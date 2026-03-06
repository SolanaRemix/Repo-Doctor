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

  try {
    const diagnosisPath = path.join(process.cwd(), '.repo-brain', 'diagnosis.json');
    if (fs.existsSync(diagnosisPath)) {
      const data = JSON.parse(fs.readFileSync(diagnosisPath, 'utf-8'));
      return res.status(200).json({ success: true, data });
    }
  } catch (err) {
    // Pre-computed file may not exist or may be malformed; fall through to not-found response
    console.error('[api/brain/diagnosis] Could not read diagnosis.json:', err);
  }

  return res.status(404).json({
    success: false,
    error: 'No diagnosis data found. Run the self-hosted server to generate diagnosis results.',
    environment: 'vercel-serverless',
  });
}
