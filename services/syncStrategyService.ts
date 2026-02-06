import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  SyncStrategy,
  SyncResult,
  SyncError,
  SyncMonitor,
  SyncConfiguration,
  SyncStatus,
  SyncMode
} from '../types.js';

const execAsync = promisify(exec);

export class SyncStrategyService {
  private rootPath: string;
  private brainPath: string;
  private activeStrategies: Map<string, SyncStrategy>;
  private monitors: Map<string, SyncMonitor>;
  private intervals: Map<string, NodeJS.Timeout>;
  private configuration: SyncConfiguration;

  constructor(rootPath?: string, config?: SyncConfiguration) {
    this.rootPath = rootPath || process.cwd();
    this.brainPath = path.join(this.rootPath, '.repo-brain');
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
   * Register a new synchronization strategy
   */
  async registerStrategy(strategy: SyncStrategy): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate strategy
      if (!strategy.id || !strategy.name) {
        return { success: false, error: 'Strategy ID and name are required' };
      }

      // Apply defaults
      const fullStrategy: SyncStrategy = {
        ...strategy,
        maxRetries: strategy.maxRetries ?? this.configuration.globalRetryPolicy?.maxRetries ?? 3,
        retryDelay: strategy.retryDelay ?? this.configuration.globalRetryPolicy?.retryDelay ?? 1000
      };

      this.activeStrategies.set(strategy.id, fullStrategy);
      
      // Initialize monitor
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
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute synchronization for a specific strategy
   */
  async executeSync(strategyId: string, trigger?: string): Promise<SyncResult> {
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

    const startTime = Date.now();
    const logs: string[] = [];
    
    // Update monitor
    this.updateMonitor(strategyId, {
      status: 'syncing',
      startTime: new Date().toISOString(),
      logs: [`Sync started (trigger: ${trigger || 'manual'})`]
    });

    logs.push(`Starting sync for strategy: ${strategy.name}`);
    logs.push(`Mode: ${strategy.mode}, Trigger: ${trigger || 'manual'}`);

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

      // Call success callback if defined
      if (strategy.onSuccess) {
        strategy.onSuccess(syncResult);
      }

      this.log('info', `Sync completed for ${strategy.name}: ${result.itemsSynced} items synced`);
      return syncResult;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const syncError: SyncError = {
        code: 'SYNC_FAILED',
        message: error.message,
        timestamp: new Date().toISOString(),
        retry: true,
        details: error
      };

      // Update monitor
      this.updateMonitor(strategyId, {
        status: 'failed',
        lastUpdate: new Date().toISOString(),
        logs: [...logs, `Sync failed: ${error.message}`]
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

      // Call error callback if defined
      if (strategy.onError) {
        strategy.onError(syncError);
      }

      this.log('error', `Sync failed for ${strategy.name}: ${error.message}`);
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
      } catch (error: any) {
        lastError = error;
        retryCount++;
        
        if (retryCount <= maxRetries) {
          logs.push(`Sync attempt ${retryCount} failed: ${error.message}`);
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
          } catch (error: any) {
            logs.push(`Failed to sync to ${target}: ${error.message}`);
            itemsFailed++;
          }
        }
      } else {
        // Run full fleet sync
        logs.push('Running full fleet synchronization');
        const { stdout, stderr } = await execAsync(`bash "${fleetScript}" --sync-plugins`, {
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
    } catch (error: any) {
      logs.push(`Sync operation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync plugins to a specific target
   */
  private async syncPluginsToTarget(target: string, logs: string[]): Promise<void> {
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
    
    // Copy brain scripts
    const { stdout } = await execAsync(
      `rsync -a "${this.brainPath}/" "${targetBrainPath}/" --exclude ".git"`,
      { cwd: this.rootPath }
    );
    
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

    if (strategy.mode !== 'scheduled') {
      return { success: false, error: 'Strategy is not in scheduled mode' };
    }

    if (!strategy.interval) {
      return { success: false, error: 'Interval not specified for scheduled strategy' };
    }

    // Clear existing interval if any
    this.stopScheduledSync(strategyId);

    // Start new interval
    const intervalMs = strategy.interval * 1000;
    const interval = setInterval(() => {
      this.executeSync(strategyId, 'scheduled').catch(error => {
        this.log('error', `Scheduled sync error for ${strategyId}: ${error.message}`);
      });
    }, intervalMs);

    this.intervals.set(strategyId, interval);
    this.log('info', `Scheduled sync started for ${strategy.name} (every ${strategy.interval}s)`);
    
    return { success: true };
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
  updateStrategy(strategyId: string, updates: Partial<SyncStrategy>): { success: boolean; error?: string } {
    const strategy = this.activeStrategies.get(strategyId);
    
    if (!strategy) {
      return { success: false, error: 'Strategy not found' };
    }

    const updatedStrategy = { ...strategy, ...updates, id: strategyId };
    this.activeStrategies.set(strategyId, updatedStrategy);

    // Restart scheduled sync if it was running
    if (strategy.mode === 'scheduled' && this.intervals.has(strategyId)) {
      this.stopScheduledSync(strategyId);
      if (updatedStrategy.enabled) {
        this.startScheduledSync(strategyId);
      }
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
   * Update monitor state
   */
  private updateMonitor(strategyId: string, updates: Partial<SyncMonitor>): void {
    const monitor = this.monitors.get(strategyId);
    if (monitor) {
      this.monitors.set(strategyId, {
        ...monitor,
        ...updates,
        lastUpdate: new Date().toISOString(),
        logs: updates.logs ? [...monitor.logs, ...updates.logs] : monitor.logs
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
   * Load configuration from file
   */
  async loadConfiguration(configPath?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const filePath = configPath || path.join(this.brainPath, 'sync-config.json');
      const data = await fs.readFile(filePath, 'utf-8');
      const config: SyncConfiguration = JSON.parse(data);
      
      this.configuration = config;
      
      // Register all strategies from config
      for (const strategy of config.strategies) {
        await this.registerStrategy(strategy);
      }
      
      this.log('info', `Configuration loaded from ${filePath}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfiguration(configPath?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const filePath = configPath || path.join(this.brainPath, 'sync-config.json');
      
      // Update strategies in configuration
      this.configuration.strategies = Array.from(this.activeStrategies.values());
      
      await fs.writeFile(filePath, JSON.stringify(this.configuration, null, 2), 'utf-8');
      
      this.log('info', `Configuration saved to ${filePath}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
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
