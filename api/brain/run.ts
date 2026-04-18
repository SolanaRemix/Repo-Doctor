import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  return res.status(200).json({
    success: true,
    logs: [
      '🧠 Repo Brain Hospital — Vercel Serverless Mode',
      '⚠️  Shell pipeline execution is not available in serverless deployments.',
      '💡 To run the full 18-phase MERMEDA pipeline, use the self-hosted server mode:',
      '   npm run server',
      '✅ Dashboard and static analysis features remain fully functional.',
    ],
    exitCode: 0,
    environment: 'vercel-serverless',
  });
}
