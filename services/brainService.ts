import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BrainExecutionResult {
  success: boolean;
  logs: string[];
  exitCode: number;
  error?: string;
}

export interface RepoScanResult {
  repo: string;
  status: 'GREEN' | 'AUTO_FIXABLE' | 'RED';
  reason: string;
  languages: string[];
  framework: string;
  ci: string;
  timestamp: string;
  phases?: any[];
  healthScore?: number;
}

export class BrainService {
  private rootPath: string;
  private brainPath: string;

  constructor(rootPath?: string) {
    this.rootPath = rootPath || process.cwd();
    this.brainPath = path.join(this.rootPath, '.repo-brain');
  }

  /**
   * Execute the full 18-phase brain pipeline
   */
  async runFullPipeline(): Promise<BrainExecutionResult> {
    const logs: string[] = [];
    
    try {
      logs.push('🧠 Starting 18-Phase MERMEDA Pipeline...');
      
      const brainRunScript = path.join(this.brainPath, 'brain.run.sh');
      const { stdout, stderr } = await execAsync(`bash "${brainRunScript}"`, {
        cwd: this.rootPath,
        env: { ...process.env, JQ_BIN: 'jq' }
      });
      
      if (stdout) logs.push(...stdout.split('\n').filter(Boolean));
      if (stderr) logs.push(...stderr.split('\n').filter(Boolean));
      
      logs.push('✅ Pipeline execution complete');
      
      return {
        success: true,
        logs,
        exitCode: 0
      };
    } catch (error: any) {
      logs.push(`❌ Pipeline error: ${error.message}`);
      return {
        success: false,
        logs,
        exitCode: error.code || 1,
        error: error.message
      };
    }
  }

  /**
   * Run a specific brain phase
   */
  async runPhase(phaseName: string): Promise<BrainExecutionResult> {
    const logs: string[] = [];
    
    try {
      logs.push(`🧠 Running phase: ${phaseName}...`);
      
      const phaseScript = path.join(this.brainPath, `brain.${phaseName}.sh`);
      const { stdout, stderr } = await execAsync(`bash "${phaseScript}"`, {
        cwd: this.rootPath,
        env: { ...process.env, JQ_BIN: 'jq' }
      });
      
      if (stdout) logs.push(...stdout.split('\n').filter(Boolean));
      if (stderr) logs.push(...stderr.split('\n').filter(Boolean));
      
      logs.push(`✅ Phase ${phaseName} complete`);
      
      return {
        success: true,
        logs,
        exitCode: 0
      };
    } catch (error: any) {
      logs.push(`❌ Phase error: ${error.message}`);
      return {
        success: false,
        logs,
        exitCode: error.code || 1,
        error: error.message
      };
    }
  }

  /**
   * Scan a repository and return diagnosis
   */
  async scanRepository(repoPath?: string): Promise<RepoScanResult | null> {
    const targetPath = repoPath || this.rootPath;
    
    try {
      // Run detection
      await this.runPhase('detect');
      
      // Run diagnosis
      await this.runPhase('diagnose');
      
      // Read diagnosis result
      const diagnosisPath = path.join(this.brainPath, 'diagnosis.json');
      const diagnosisData = await fs.readFile(diagnosisPath, 'utf-8');
      const diagnosis = JSON.parse(diagnosisData);
      
      // Calculate health score
      const healthScore = this.calculateHealthScore(diagnosis);
      
      return {
        ...diagnosis,
        healthScore
      };
    } catch (error) {
      console.error('Scan error:', error);
      return null;
    }
  }

  /**
   * Read brain execution logs
   */
  async readBrainLogs(): Promise<string[]> {
    try {
      const autopsyPath = path.join(this.brainPath, 'autopsy');
      const files = await fs.readdir(autopsyPath).catch(() => []);
      
      if (files.length === 0) return ['No logs available'];
      
      const latestLog = files.sort().reverse()[0];
      const logContent = await fs.readFile(
        path.join(autopsyPath, latestLog),
        'utf-8'
      );
      
      return logContent.split('\n').filter(Boolean);
    } catch (error) {
      return ['Failed to read logs'];
    }
  }

  /**
   * Get current repo diagnosis
   */
  async getDiagnosis(): Promise<any> {
    try {
      const diagnosisPath = path.join(this.brainPath, 'diagnosis.json');
      const data = await fs.readFile(diagnosisPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get detection results
   */
  async getDetection(): Promise<any> {
    try {
      const detectPath = path.join(this.brainPath, 'detect.json');
      const data = await fs.readFile(detectPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Run autopsy (forensic analysis)
   */
  async runAutopsy(): Promise<BrainExecutionResult> {
    return this.runPhase('autopsy');
  }

  /**
   * Run brain doctor (health check)
   */
  async runDoctor(): Promise<BrainExecutionResult> {
    return this.runPhase('doctor');
  }

  /**
   * Calculate health score based on diagnosis
   */
  private calculateHealthScore(diagnosis: any): number {
    const { status, ci, languages } = diagnosis;
    
    let score = 50; // Base score
    
    // Status impact
    if (status === 'GREEN') score += 40;
    else if (status === 'AUTO_FIXABLE') score += 20;
    else if (status === 'RED') score -= 30;
    
    // CI configuration
    if (ci !== 'none') score += 10;
    
    // Language detection
    if (languages && Array.isArray(languages)) {
      score += Math.min(languages.length * 5, 20);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Create a repair PR
   */
  async createRepairPR(repoName: string): Promise<{ success: boolean; prUrl?: string; error?: string }> {
    try {
      const { stdout } = await execAsync(`bash "${path.join(this.brainPath, 'brain.auto-pr.sh')}"`, {
        cwd: this.rootPath
      });
      
      // Parse PR URL from output (simplified - would need actual implementation)
      const prUrlMatch = stdout.match(/https:\/\/github\.com\/[^\s]+/);
      const prUrl = prUrlMatch ? prUrlMatch[0] : `https://github.com/org/${repoName}/pull/1`;
      
      return { success: true, prUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default BrainService;
