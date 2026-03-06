import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

const MAX_LOG_LINES = 1000;

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const logsPath = path.join(process.cwd(), '.repo-brain', 'brain.log');
    if (fs.existsSync(logsPath)) {
      const content = fs.readFileSync(logsPath, 'utf-8');
      const logs = content.split('\n').filter(Boolean).slice(-MAX_LOG_LINES);
      return res.status(200).json({ success: true, logs });
    }
  } catch (err) {
    // Log file may not exist or may be unreadable; fall through to empty logs response
    console.error('[api/brain/logs] Could not read brain.log:', err);
  }

  return res.status(200).json({
    success: true,
    logs: [
      '⚠️  No log file found.',
      '💡 Run the self-hosted server to generate execution logs.',
    ],
    environment: 'vercel-serverless',
  });
}
