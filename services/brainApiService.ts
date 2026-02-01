const getApiBaseUrl = (): string => {
  // Priority: Environment variable > Window location for dynamic deployment
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Use current origin with /api path for production deployments
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin;
    // If running on localhost, use default API port
    if (origin.includes('localhost')) {
      const apiPort = import.meta.env.VITE_API_PORT || '3001';
      return `http://localhost:${apiPort}/api`;
    }
    // For production, assume API is at same origin
    return `${origin}/api`;
  }
  
  // Fallback for non-browser environments
  const apiPort = import.meta.env.VITE_API_PORT || '3001';
  return `http://localhost:${apiPort}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  logs?: string[];
  exitCode?: number;
}

export class BrainApiService {
  /**
   * Execute the full 18-phase brain pipeline
   */
  static async runFullPipeline(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        logs: [`Failed to connect to API: ${error.message}`]
      };
    }
  }

  /**
   * Execute a specific brain phase
   */
  static async runPhase(phaseName: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/phase/${phaseName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        logs: [`Failed to execute phase: ${error.message}`]
      };
    }
  }

  /**
   * Scan a repository
   */
  static async scanRepository(repoPath?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoPath })
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current diagnosis
   */
  static async getDiagnosis(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/diagnosis`);
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get detection results
   */
  static async getDetection(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/detection`);
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get brain execution logs
   */
  static async getLogs(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/logs`);
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        logs: []
      };
    }
  }

  /**
   * Run autopsy
   */
  static async runAutopsy(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/autopsy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Run brain doctor
   */
  static async runDoctor(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create repair PR
   */
  static async createRepairPR(repoName: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/repair-pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoName })
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Run normalization
   */
  static async normalize(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/brain/normalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check API health
   */
  static async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: 'API server is not running'
      };
    }
  }
}

export default BrainApiService;
