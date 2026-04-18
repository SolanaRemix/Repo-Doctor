import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).end();
  }

  try {
    const vitalsPath = path.join(process.cwd(), '.repo-brain', 'vitals.json');
    if (fs.existsSync(vitalsPath)) {
      const data = JSON.parse(fs.readFileSync(vitalsPath, 'utf-8'));
      return res.status(200).json({ success: true, data });
    }
  } catch (err) {
    // Pre-computed file may not exist or may be malformed; fall through to not-found response
    console.error('[api/brain/vitals] Could not read vitals.json:', err);
  }

  return res.status(404).json({
    success: false,
    error: 'No vitals data found. Run the self-hosted server to generate vitals.',
    environment: 'vercel-serverless',
  });
}
