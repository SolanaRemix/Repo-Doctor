import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const scanResultPath = path.join(process.cwd(), '.repo-brain', 'scan-result.json');
    if (fs.existsSync(scanResultPath)) {
      const data = JSON.parse(fs.readFileSync(scanResultPath, 'utf-8'));
      return res.status(200).json({ success: true, data });
    }
  } catch (err) {
    // Pre-computed file may not exist or may be malformed; fall through to serverless notice
    console.error('[api/brain/scan] Could not read scan-result.json:', err);
  }

  return res.status(200).json({
    success: false,
    error: 'Repository scan requires the self-hosted server mode. Shell script execution is not available in the Vercel serverless environment.',
    environment: 'vercel-serverless',
  });
}
