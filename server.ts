import express from 'express';
import cors from 'cors';
import BrainService from './services/brainService.js';

const app = express();
const port = parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize brain service
const brainService = new BrainService();

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

// Start server
app.listen(port, () => {
  console.log(`🧠 REPO BRAIN HOSPITAL API Server`);
  console.log(`🚀 Listening on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
  console.log(`🔬 Version: 2.2.0 (MERMEDA)`);
  console.log(`⚙️  Port configured via: ${process.env.API_PORT ? 'API_PORT' : process.env.PORT ? 'PORT' : 'default (3001)'}`);
});

export default app;
