import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  SyncStrategy,
  SyncResult,
  SyncError,
  SyncMonitor,
  SyncConfiguration,
  SyncTrigger
} from '../types.js';

const execFileAsync = promisify(execFile);

// Security constants
const MAX_LOG_LINES = 1000;
const SAFE_CONFIG_DIR = '.repo-brain';
const SAFE_CONFIG_FILE = 'sync-config.json';

export class SyncStrategyService {
  private rootPath: string;
  private brainPath: string;
  private activeStrategies: Map<string, SyncStrategy>;
  private monitors: Map<string, SyncMonitor>;
  private intervals: Map<string, NodeJS.Timeout>;
  private configuration: SyncConfiguration;

  constructor(rootPath?: string, config?: SyncConfiguration) {
    this.rootPath = rootPath || process.cwd();
    this.brainPath = path.join(this.rootPath, SAFE_CONFIG_DIR);
    this.activeStrategies = new Map();
    this.monitors = new Map();
    this.intervals = new Map();
    
    // Default configuration
    this.configuration = config || {
      strategies: [],
      globalRetryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      monitoring: {
        enabled: true,
        logLevel: 'info',
        alertThreshold: 5
      }
    };
  }

  /**
   * Validate and sanitize target path to prevent directory traversal
   */
  private validateTargetPath(target: string): { valid: boolean; error?: string } {
    // Reject absolute paths
    if (path.isAbsolute(target)) {
      return { valid: false, error: 'Target must be a relative path' };
    }

    // Reject paths with .. or path traversal attempts
    if (target.includes('..') || target.includes('/./') || target.startsWith('./')) {
      return { valid: false, error: 'Target contains invalid path segments' };
    }

    // Reject paths with shell metacharacters
    if (/[;&|`$(){}[\]<>*?~]/.test(target)) {
      return { valid: false, error: 'Target contains invalid characters' };
    }

    // Resolve and ensure path stays within rootPath
    const resolvedPath = path.resolve(this.rootPath, target);
    const normalizedRoot = path.resolve(this.rootPath);
    
    if (!resolvedPath.startsWith(normalizedRoot + path.sep) && resolvedPath !== normalizedRoot) {
      return { valid: false, error: 'Target escapes root directory' };
    }

    return { valid: true };
  }

  /**
   * Register a new synchronization strategy
   */
  async registerStrategy(strategy: SyncStrategy): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate strategy
      if (!strategy.id || !strategy.name) {
        return { success: false, error: 'Strategy ID and name are required' };
      }

      // Validate targets if provided
      if (strategy.targets) {
        for (const target of strategy.targets) {
          const validation = this.validateTargetPath(target);
          if (!validation.valid) {
            return { success: false, error: `Invalid target "${target}": ${validation.error}` };
          }
        }
      }

      // Stop existing strategy if re-registering
      if (this.activeStrategies.has(strategy.id)) {
        this.stopScheduledSync(strategy.id);
      }

      // Apply defaults
      const fullStrategy: SyncStrategy = {
        ...strategy,
        maxRetries: strategy.maxRetries ?? this.configuration.globalRetryPolicy?.maxRetries ?? 3,
        retryDelay: strategy.retryDelay ?? this.configuration.globalRetryPolicy?.retryDelay ?? 1000,
        // Remove callback functions for security (cannot be serialized)
        onSuccess: undefined,
        onError: undefined
      };

      this.activeStrategies.set(strategy.id, fullStrategy);
      
      // Initialize or reset monitor
      this.monitors.set(strategy.id, {
        strategyId: strategy.id,
        status: 'idle',
        currentProgress: 0,
        totalItems: 0,
        startTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        logs: [`Strategy ${strategy.name} registered`]
      });

      // Auto-start if enabled and in scheduled mode
      if (strategy.enabled && strategy.mode === 'scheduled' && strategy.interval) {
        await this.startScheduledSync(strategy.id);
      }

      this.log('info', `Strategy registered: ${strategy.name} (${strategy.id})`);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Execute synchronization for a specific strategy
   */
  async executeSync(strategyId: string, trigger?: SyncTrigger): Promise<SyncResult> {
    const strategy = this.activeStrategies.get(strategyId);
    
    if (!strategy) {
      return this.createErrorResult(strategyId, {
        code: 'STRATEGY_NOT_FOUND',
        message: `Strategy ${strategyId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    if (!strategy.enabled) {
      return this.createErrorResult(strategyId, {
        code: 'STRATEGY_DISABLED',
        message: `Strategy ${strategyId} is disabled`,
        timestamp: new Date().toISOString()
      });
    }

    // Check if already running (prevent overlapping executions)
    const currentMonitor = this.monitors.get(strategyId);
    if (currentMonitor && (currentMonitor.status === 'syncing' || currentMonitor.status === 'retrying')) {
      return this.createErrorResult(strategyId, {
        code: 'SYNC_IN_PROGRESS',
        message: `Sync already in progress for strategy ${strategyId}`,
        timestamp: new Date().toISOString()
      });
    }

    const startTime = Date.now();
    const logs: string[] = [];
    
    // Update monitor
    this.updateMonitor(strategyId, {
      status: 'syncing',
      startTime: new Date().toISOString(),
      logs: [`Sync started (trigger: ${trigger || 'api'})`]
    });

    logs.push(`Starting sync for strategy: ${strategy.name}`);
    logs.push(`Mode: ${strategy.mode}, Trigger: ${trigger || 'api'}`);

    try {
      // Execute sync with retry logic
      const result = await this.executeSyncWithRetry(strategy, logs);
      
      const duration = Date.now() - startTime;
      
      // Update monitor
      this.updateMonitor(strategyId, {
        status: 'success',
        currentProgress: result.itemsSynced,
        totalItems: result.itemsSynced,
        lastUpdate: new Date().toISOString(),
        logs: [...logs, `Sync completed successfully in ${duration}ms`]
      });

      const syncResult: SyncResult = {
        strategyId,
        status: 'success',
        timestamp: new Date().toISOString(),
        duration,
        itemsSynced: result.itemsSynced,
        itemsFailed: result.itemsFailed,
        repos: result.repos,
        logs
      };

      this.log('info', `Sync completed for ${strategy.name}: ${result.itemsSynced} items synced`);
      return syncResult;
      
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      const syncError: SyncError = {
        code: 'SYNC_FAILED',
        message,
        timestamp: new Date().toISOString(),
        retry: true,
        details: error instanceof Error ? error.stack : String(error)
      };

      // Update monitor
      this.updateMonitor(strategyId, {
        status: 'failed',
        lastUpdate: new Date().toISOString(),
        logs: [...logs, `Sync failed: ${message}`]
      });

      const syncResult: SyncResult = {
        strategyId,
        status: 'failed',
        timestamp: new Date().toISOString(),
        duration,
        itemsSynced: 0,
        itemsFailed: 0,
        logs,
        error: syncError
      };

      this.log('error', `Sync failed for ${strategy.name}: ${message}`);
      return syncResult;
    }
  }

  /**
   * Execute sync with retry logic
   */
  private async executeSyncWithRetry(
    strategy: SyncStrategy,
    logs: string[]
  ): Promise<{ itemsSynced: number; itemsFailed: number; repos: string[] }> {
    const maxRetries = strategy.maxRetries || 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount <= maxRetries) {
      try {
        if (retryCount > 0) {
          const delay = this.calculateRetryDelay(retryCount, strategy.retryDelay || 1000);
          logs.push(`Retry attempt ${retryCount}/${maxRetries} after ${delay}ms delay`);
          this.updateMonitor(strategy.id, { status: 'retrying' });
          await this.sleep(delay);
        }

        return await this.performSync(strategy, logs);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        lastError = error instanceof Error ? error : new Error(message);
        retryCount++;
        
        if (retryCount <= maxRetries) {
          logs.push(`Sync attempt ${retryCount} failed: ${message}`);
        }
      }
    }

    throw lastError || new Error('Sync failed after all retries');
  }

  /**
   * Perform the actual synchronization
   */
  private async performSync(
    strategy: SyncStrategy,
    logs: string[]
  ): Promise<{ itemsSynced: number; itemsFailed: number; repos: string[] }> {
    const repos: string[] = [];
    let itemsSynced = 0;
    let itemsFailed = 0;

    // Check if we're syncing plugins or running fleet operations
    const fleetScript = path.join(this.brainPath, 'brain.fleet.sh');
    
    try {
      // Sync plugins first if targets are specified
      if (strategy.targets && strategy.targets.length > 0) {
        logs.push(`Syncing plugins to ${strategy.targets.length} target(s)`);
        
        for (const target of strategy.targets) {
          try {
            await this.syncPluginsToTarget(target, logs);
            repos.push(target);
            itemsSynced++;
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            logs.push(`Failed to sync to ${target}: ${message}`);
            itemsFailed++;
          }
        }
      } else {
        // Run full fleet sync using execFile (safer than exec)
        logs.push('Running full fleet synchronization');
        const { stdout, stderr } = await execFileAsync('bash', [fleetScript, '--sync-plugins'], {
          cwd: this.rootPath,
          env: { ...process.env, JQ_BIN: 'jq' }
        });

        if (stdout) {
          const lines = stdout.split('\n').filter(Boolean);
          logs.push(...lines);
          // Count repos synced from output
          const syncedRepos = lines.filter(l => l.includes('Syncing repo-brain into'));
          itemsSynced = syncedRepos.length;
          repos.push(...syncedRepos.map(l => l.split('into ')[1]?.trim() || ''));
        }
        
        if (stderr) {
          logs.push(`Warnings: ${stderr}`);
        }
      }

      return { itemsSynced, itemsFailed, repos: repos.filter(Boolean) };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logs.push(`Sync operation failed: ${message}`);
      throw error;
    }
  }

  /**
   * Sync plugins to a specific target
   */
  private async syncPluginsToTarget(target: string, logs: string[]): Promise<void> {
    // Validate target path
    const validation = this.validateTargetPath(target);
    if (!validation.valid) {
      throw new Error(`Invalid target: ${validation.error}`);
    }

    const targetPath = path.join(this.rootPath, target);
    const targetBrainPath = path.join(targetPath, '.repo-brain');
    
    // Check if target exists and is a git repo
    try {
      await fs.access(path.join(targetPath, '.git'));
    } catch {
      throw new Error(`Target ${target} is not a valid git repository`);
    }

    // Create .repo-brain directory
    await fs.mkdir(targetBrainPath, { recursive: true });
    
    // Ensure rsync is available before attempting to sync
    try {
      await execFileAsync('rsync', ['--version']);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Required dependency "rsync" is not available on this system. Please install rsync and try again. Original error: ${message}`
      );
    }

    // Copy brain scripts using execFile (safe from command injection)
    try {
      await execFileAsync('rsync', [
        '-a',
        `${this.brainPath}/`,
        `${targetBrainPath}/`,
        '--exclude',
        '.git'
      ], {
        cwd: this.rootPath
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to sync plugins using rsync: ${message}`);
    }
    
    logs.push(`Synced plugins to ${target}`);
  }

  /**
   * Start scheduled synchronization
   */
  async startScheduledSync(strategyId: string): Promise<{ success: boolean; error?: string }> {
    const strategy = this.activeStrategies.get(strategyId);
    
    if (!strategy) {
      return { success: false, error: 'Strategy not found' };
    }

    if (!strategy.enabled) {
      return { success: false, error: 'Cannot start scheduled sync for disabled strategy' };
    }

    if (strategy.mode !== 'scheduled') {
      return { success: false, error: 'Strategy is not in scheduled mode' };
    }

    if (!strategy.interval) {
      return { success: false, error: 'Interval not specified for scheduled strategy' };
    }

    // In serverless environments (e.g. Vercel), long-lived in-memory timers such as
    // setInterval are not reliable because function instances are short-lived and
    // state is not shared across invocations. Instead of starting an in-process
    // scheduler here, callers should configure an external scheduler (e.g. Vercel
    // Cron) to invoke a route that calls `executeSync` for this strategy.
    this.log(
      'warn',
      `Scheduled sync requested for strategy "${strategy.name}" (${strategyId}), ` +
      'but in-process scheduling is disabled in this deployment. ' +
      'Use an external scheduler (e.g. Vercel Cron) to trigger executeSync instead.'
    );

    return {
      success: false,
      error: 'In-process scheduled syncs are not supported in this deployment. ' +
             'Configure an external scheduler to trigger executeSync for this strategy.'
    };
  }

  /**
   * Stop scheduled synchronization
   */
  stopScheduledSync(strategyId: string): void {
    const interval = this.intervals.get(strategyId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(strategyId);
      this.log('info', `Scheduled sync stopped for ${strategyId}`);
    }
  }

  /**
   * Get strategy monitor status
   */
  getMonitor(strategyId: string): SyncMonitor | null {
    return this.monitors.get(strategyId) || null;
  }

  /**
   * Get all monitors
   */
  getAllMonitors(): SyncMonitor[] {
    return Array.from(this.monitors.values());
  }

  /**
   * Get all strategies
   */
  getAllStrategies(): SyncStrategy[] {
    return Array.from(this.activeStrategies.values());
  }

  /**
   * Update strategy configuration
   */
  async updateStrategy(strategyId: string, updates: Partial<SyncStrategy>): Promise<{ success: boolean; error?: string }> {
    const strategy = this.activeStrategies.get(strategyId);
    
    if (!strategy) {
      return { success: false, error: 'Strategy not found' };
    }

    // Validate targets if being updated
    if (updates.targets) {
      for (const target of updates.targets) {
        const validation = this.validateTargetPath(target);
        if (!validation.valid) {
          return { success: false, error: `Invalid target "${target}": ${validation.error}` };
        }
      }
    }

    const updatedStrategy = {
      ...strategy,
      ...updates,
      id: strategyId,
      // Remove callbacks (cannot be serialized)
      onSuccess: undefined,
      onError: undefined
    };
    this.activeStrategies.set(strategyId, updatedStrategy);

    // Ensure scheduled sync state matches updated strategy
    if (updatedStrategy.enabled && updatedStrategy.mode === 'scheduled' && updatedStrategy.interval) {
      // If an interval is already running, restart it with the updated configuration
      if (this.intervals.has(strategyId)) {
        this.stopScheduledSync(strategyId);
      }
      const result = await this.startScheduledSync(strategyId);
      if (!result.success) {
        return result;
      }
    } else if (this.intervals.has(strategyId)) {
      // Stop scheduled sync if strategy is no longer scheduled or disabled
      this.stopScheduledSync(strategyId);
    }

    this.log('info', `Strategy updated: ${strategyId}`);
    return { success: true };
  }

  /**
   * Remove a strategy
   */
  removeStrategy(strategyId: string): { success: boolean; error?: string } {
    if (!this.activeStrategies.has(strategyId)) {
      return { success: false, error: 'Strategy not found' };
    }

    this.stopScheduledSync(strategyId);
    this.activeStrategies.delete(strategyId);
    this.monitors.delete(strategyId);
    
    this.log('info', `Strategy removed: ${strategyId}`);
    return { success: true };
  }

  /**
   * Update monitor state with log size limiting
   */
  private updateMonitor(strategyId: string, updates: Partial<SyncMonitor>): void {
    const monitor = this.monitors.get(strategyId);
    if (monitor) {
      let updatedLogs = updates.logs ? [...monitor.logs, ...updates.logs] : monitor.logs;
      
      // Limit log size to prevent unbounded growth
      if (updatedLogs.length > MAX_LOG_LINES) {
        updatedLogs = updatedLogs.slice(-MAX_LOG_LINES);
      }
      
      this.monitors.set(strategyId, {
        ...monitor,
        ...updates,
        lastUpdate: new Date().toISOString(),
        logs: updatedLogs
      });
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number, baseDelay: number): number {
    const backoffMultiplier = this.configuration.globalRetryPolicy?.backoffMultiplier ?? 2;
    return baseDelay * Math.pow(backoffMultiplier, retryCount - 1);
  }

  /**
   * Create error result
   */
  private createErrorResult(strategyId: string, error: SyncError): SyncResult {
    return {
      strategyId,
      status: 'failed',
      timestamp: new Date().toISOString(),
      duration: 0,
      itemsSynced: 0,
      itemsFailed: 0,
      logs: [error.message],
      error
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging utility
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (!this.configuration.monitoring?.enabled) return;
    
    const logLevel = this.configuration.monitoring?.logLevel || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    
    if (levels.indexOf(level) >= levels.indexOf(logLevel)) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Load configuration from file (restricted to safe directory)
   */
  async loadConfiguration(configPath?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Restrict to safe directory only
      let filePath: string;
      if (configPath) {
        // Reject absolute paths
        if (path.isAbsolute(configPath)) {
          return { success: false, error: 'Absolute paths not allowed' };
        }
        // Reject path traversal
        if (configPath.includes('..')) {
          return { success: false, error: 'Path traversal not allowed' };
        }
        // Only allow files in the safe config directory
        filePath = path.join(this.brainPath, path.basename(configPath));
      } else {
        filePath = path.join(this.brainPath, SAFE_CONFIG_FILE);
      }
      
      const data = await fs.readFile(filePath, 'utf-8');
      const config: SyncConfiguration = JSON.parse(data);
      
      this.configuration = config;
      
      // Register all strategies from config
      for (const strategy of config.strategies) {
        await this.registerStrategy(strategy);
      }
      
      this.log('info', `Configuration loaded from ${filePath}`);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Save configuration to file (restricted to safe directory)
   */
  async saveConfiguration(configPath?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Restrict to safe directory only
      let filePath: string;
      if (configPath) {
        // Reject absolute paths
        if (path.isAbsolute(configPath)) {
          return { success: false, error: 'Absolute paths not allowed' };
        }
        // Reject path traversal
        if (configPath.includes('..')) {
          return { success: false, error: 'Path traversal not allowed' };
        }
        // Only allow files in the safe config directory
        filePath = path.join(this.brainPath, path.basename(configPath));
      } else {
        filePath = path.join(this.brainPath, SAFE_CONFIG_FILE);
      }
      
      // Update strategies in configuration
      this.configuration.strategies = Array.from(this.activeStrategies.values());
      
      await fs.writeFile(filePath, JSON.stringify(this.configuration, null, 2), 'utf-8');
      
      this.log('info', `Configuration saved to ${filePath}`);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Cleanup - stop all scheduled syncs
   */
  cleanup(): void {
    this.log('info', 'Cleaning up sync strategy service');
    
    for (const strategyId of this.intervals.keys()) {
      this.stopScheduledSync(strategyId);
    }
    
    this.activeStrategies.clear();
    this.monitors.clear();
  }
}

export default SyncStrategyService;
