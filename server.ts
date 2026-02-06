import express from 'express';
import cors from 'cors';
import BrainService from './services/brainService.js';
import SyncStrategyService from './services/syncStrategyService.js';

const app = express();
const port = parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const brainService = new BrainService();
const syncService = new SyncStrategyService();

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: '2.2.0',
    service: 'repo-brain-hospital-api'
  });
});

/**
 * POST /api/brain/run
 * Execute the full 18-phase brain pipeline
 */
app.post('/api/brain/run', async (req, res) => {
  try {
    const result = await brainService.runFullPipeline();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      logs: [`Error: ${error.message}`]
    });
  }
});

/**
 * POST /api/brain/phase/:phaseName
 * Execute a specific brain phase
 */
app.post('/api/brain/phase/:phaseName', async (req, res) => {
  try {
    const { phaseName } = req.params;
    const result = await brainService.runPhase(phaseName);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      logs: [`Error: ${error.message}`]
    });
  }
});

/**
 * POST /api/brain/scan
 * Scan the current repository
 */
app.post('/api/brain/scan', async (req, res) => {
  try {
    const { repoPath } = req.body;
    const result = await brainService.scanRepository(repoPath);
    
    if (result) {
      res.json({ success: true, data: result });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to scan repository' 
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/brain/diagnosis
 * Get current diagnosis
 */
app.get('/api/brain/diagnosis', async (req, res) => {
  try {
    const diagnosis = await brainService.getDiagnosis();
    
    if (diagnosis) {
      res.json({ success: true, data: diagnosis });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'No diagnosis found' 
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/brain/detection
 * Get detection results
 */
app.get('/api/brain/detection', async (req, res) => {
  try {
    const detection = await brainService.getDetection();
    
    if (detection) {
      res.json({ success: true, data: detection });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'No detection data found' 
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/brain/logs
 * Get brain execution logs
 */
app.get('/api/brain/logs', async (req, res) => {
  try {
    const logs = await brainService.readBrainLogs();
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      logs: []
    });
  }
});

/**
 * POST /api/brain/autopsy
 * Run forensic autopsy
 */
app.post('/api/brain/autopsy', async (req, res) => {
  try {
    const result = await brainService.runAutopsy();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/brain/doctor
 * Run brain doctor health check
 */
app.post('/api/brain/doctor', async (req, res) => {
  try {
    const result = await brainService.runDoctor();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/brain/repair-pr
 * Create a repair PR for the repository
 */
app.post('/api/brain/repair-pr', async (req, res) => {
  try {
    const { repoName } = req.body;
    
    if (!repoName) {
      return res.status(400).json({
        success: false,
        error: 'Repository name is required'
      });
    }
    
    const result = await brainService.createRepairPR(repoName);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/brain/normalize
 * Normalize repository structure
 */
app.post('/api/brain/normalize', async (req, res) => {
  try {
    const result = await brainService.runPhase('normalize');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/brain/auto-fix
 * Run full analysis, repair, and apply patches automatically
 */
app.post('/api/brain/auto-fix', async (req, res) => {
  try {
    const logs: string[] = [];
    logs.push('🔧 Starting automatic analysis and repair...');

    // Step 1: Run diagnosis
    logs.push('📊 Running diagnosis...');
    const diagResult = await brainService.runPhase('diagnose');
    logs.push(...diagResult.logs);

    // Step 2: Run doctor
    logs.push('🩺 Running health check...');
    const doctorResult = await brainService.runDoctor();
    logs.push(...doctorResult.logs);

    // Step 3: Run surgeon (repair)
    logs.push('🔧 Applying repairs...');
    const surgeonResult = await brainService.runPhase('surgeon');
    logs.push(...surgeonResult.logs);

    // Step 4: Verify fixes
    logs.push('✅ Verifying fixes...');
    const verifyResult = await brainService.runPhase('verify');
    logs.push(...verifyResult.logs);

    logs.push('✅ Automatic fix completed');

    res.json({
      success: true,
      logs,
      phases: {
        diagnosis: diagResult.success,
        doctor: doctorResult.success,
        surgeon: surgeonResult.success,
        verify: verifyResult.success
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      logs: [`Error during auto-fix: ${error.message}`]
    });
  }
});

// ===================================================================
// PUBLIC DATA API ENDPOINTS
// ===================================================================

/**
 * GET /api/public/config
 * Get public sync configuration and strategies (read-only)
 */
app.get('/api/public/config', (req, res) => {
  try {
    const strategies = syncService.getAllStrategies();
    const monitors = syncService.getAllMonitors();
    
    // Filter sensitive data - only return public info
    const publicStrategies = strategies.map(s => ({
      id: s.id,
      name: s.name,
      mode: s.mode,
      enabled: s.enabled,
      interval: s.interval
    }));

    const publicMonitors = monitors.map(m => ({
      strategyId: m.strategyId,
      status: m.status,
      lastUpdate: m.lastUpdate
    }));

    res.json({
      success: true,
      data: {
        strategies: publicStrategies,
        monitors: publicMonitors,
        version: '2.2.0',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/public/status
 * Get public system status and health metrics
 */
app.get('/api/public/status', async (req, res) => {
  try {
    const diagnosis = await brainService.getDiagnosis();
    const monitors = syncService.getAllMonitors();
    
    const activeStrategies = monitors.filter(m => m.status === 'syncing').length;
    const failedStrategies = monitors.filter(m => m.status === 'failed').length;

    res.json({
      success: true,
      data: {
        system: {
          status: diagnosis?.status || 'unknown',
          version: '2.2.0',
          timestamp: new Date().toISOString()
        },
        sync: {
          total: monitors.length,
          active: activeStrategies,
          failed: failedStrategies,
          idle: monitors.length - activeStrategies - failedStrategies
        },
        health: diagnosis ? {
          framework: diagnosis.framework,
          ci: diagnosis.ci,
          healthScore: diagnosis.healthScore
        } : null
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===================================================================
// SYNCHRONIZATION STRATEGY ENDPOINTS
// ===================================================================

/**
 * POST /api/sync/strategy
 * Register a new synchronization strategy
 */
app.post('/api/sync/strategy', async (req, res) => {
  try {
    const strategy = req.body;
    const result = await syncService.registerStrategy(strategy);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sync/strategies
 * Get all registered strategies
 */
app.get('/api/sync/strategies', (req, res) => {
  try {
    const strategies = syncService.getAllStrategies();
    res.json({ success: true, data: strategies });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/sync/strategy/:strategyId
 * Update a synchronization strategy
 */
app.put('/api/sync/strategy/:strategyId', (req, res) => {
  try {
    const { strategyId } = req.params;
    const updates = req.body;
    const result = syncService.updateStrategy(strategyId, updates);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/sync/strategy/:strategyId
 * Remove a synchronization strategy
 */
app.delete('/api/sync/strategy/:strategyId', (req, res) => {
  try {
    const { strategyId } = req.params;
    const result = syncService.removeStrategy(strategyId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sync/execute/:strategyId
 * Execute synchronization for a specific strategy
 */
app.post('/api/sync/execute/:strategyId', async (req, res) => {
  try {
    const { strategyId } = req.params;
    const { trigger } = req.body;
    const result = await syncService.executeSync(strategyId, trigger);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sync/schedule/start/:strategyId
 * Start scheduled synchronization
 */
app.post('/api/sync/schedule/start/:strategyId', async (req, res) => {
  try {
    const { strategyId } = req.params;
    const result = await syncService.startScheduledSync(strategyId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sync/schedule/stop/:strategyId
 * Stop scheduled synchronization
 */
app.post('/api/sync/schedule/stop/:strategyId', (req, res) => {
  try {
    const { strategyId } = req.params;
    syncService.stopScheduledSync(strategyId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sync/monitor/:strategyId
 * Get synchronization monitor status for a strategy
 */
app.get('/api/sync/monitor/:strategyId', (req, res) => {
  try {
    const { strategyId } = req.params;
    const monitor = syncService.getMonitor(strategyId);
    
    if (monitor) {
      res.json({ success: true, data: monitor });
    } else {
      res.status(404).json({
        success: false,
        error: 'Monitor not found'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sync/monitors
 * Get all synchronization monitors
 */
app.get('/api/sync/monitors', (req, res) => {
  try {
    const monitors = syncService.getAllMonitors();
    res.json({ success: true, data: monitors });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sync/config/load
 * Load synchronization configuration from file
 */
app.post('/api/sync/config/load', async (req, res) => {
  try {
    const { configPath } = req.body;
    const result = await syncService.loadConfiguration(configPath);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sync/config/save
 * Save synchronization configuration to file
 */
app.post('/api/sync/config/save', async (req, res) => {
  try {
    const { configPath } = req.body;
    const result = await syncService.saveConfiguration(configPath);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`🧠 REPO BRAIN HOSPITAL API Server`);
  console.log(`🚀 Listening on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
  console.log(`🔬 Version: 2.2.0 (MERMEDA)`);
  console.log(`⚙️  Port configured via: ${process.env.API_PORT ? 'API_PORT' : process.env.PORT ? 'PORT' : 'default (3001)'}`);
  console.log(`🔄 Sync API: http://localhost:${port}/api/sync`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM signal received: closing HTTP server');
  syncService.cleanup();
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT signal received: closing HTTP server');
  syncService.cleanup();
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
});

export default app;
