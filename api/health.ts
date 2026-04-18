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

  let version = process.env.npm_package_version || 'unknown';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    version = pkg.version || version;
  } catch {
    // package.json not available in serverless bundle; use env fallback
  }

  return res.status(200).json({
    success: true,
    status: 'healthy',
    version,
    service: 'repo-brain-hospital-api',
    environment: process.env.VERCEL_ENV || 'production',
    deployment: 'vercel-serverless',
  });
}
