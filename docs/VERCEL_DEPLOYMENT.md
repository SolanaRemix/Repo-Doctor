# Vercel Deployment Guide

## Overview

This guide explains how to deploy the Repo-Doctor application to Vercel with automatic configuration, dynamic sync strategies, and public data API endpoints.

## Features in Vercel Deployment

### 1. Public Data API Endpoints

**Endpoint**: `GET /api/public/config`
- Returns read-only sync configuration
- No authentication required
- CORS enabled for cross-origin access
- Cached for 60 seconds (client), 5 minutes (CDN)

**Endpoint**: `GET /api/public/status`
- Returns system health and sync status
- Public metrics for monitoring
- Real-time status of sync operations

### 2. Auto-Fix Endpoint

**Endpoint**: `POST /api/brain/auto-fix`
- Runs full analysis, repair, and verification
- Executes: diagnosis → doctor → surgeon → verify
- Returns detailed logs and phase results

### 3. Automatic Configuration

The Vercel deployment includes:
- Automatic routing for all API endpoints
- Public API endpoints with CORS headers
- Caching strategies for performance
- Environment variable management

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Production

```bash
npm run deploy:vercel
```

Or manually:

```bash
vercel --prod
```

### 4. Configure Environment Variables

In Vercel dashboard, add environment variables if needed:

- `NODE_ENV` = `production` (automatically set by Vercel)

**Note**: Port configuration is not needed for Vercel deployments. Vercel serverless functions automatically manage port allocation.

## Vercel Configuration

The `vercel.json` file is pre-configured with:

### Builds

- **Static Build**: Frontend UI built with Vite
- **Node.js API**: Express server with TypeScript support

### Routes

1. **Public API** (`/api/public/*`):
   - GET requests only
   - CORS enabled
   - Cached responses

2. **Brain API** (`/api/brain/*`):
   - Full CRUD operations
   - Auto-fix endpoint
   - Diagnosis and repair

3. **Sync API** (`/api/sync/*`):
   - Strategy management
   - Execution control
   - Real-time monitoring

4. **Static Assets** (`/*`):
   - Served from `dist/` folder
   - Frontend application

### Headers

Public API endpoints include:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Cache-Control: public, max-age=60, s-maxage=300`

## API Usage in Production

### Public Configuration

```bash
curl https://your-app.vercel.app/api/public/config
```

**Response:**
```json
{
  "success": true,
  "data": {
    "strategies": [...],
    "monitors": [...],
    "version": "2.2.0",
    "timestamp": "2026-02-06T20:00:00.000Z"
  }
}
```

### Public Status

```bash
curl https://your-app.vercel.app/api/public/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "system": {
      "status": "GREEN",
      "version": "2.2.0"
    },
    "sync": {
      "total": 5,
      "active": 1,
      "failed": 0
    }
  }
}
```

### Auto-Fix

```bash
curl -X POST https://your-app.vercel.app/api/brain/auto-fix
```

**Response:**
```json
{
  "success": true,
  "logs": [
    "🔧 Starting automatic analysis and repair...",
    "📊 Running diagnosis...",
    "🩺 Running health check...",
    "🔧 Applying repairs...",
    "✅ Verifying fixes...",
    "✅ Automatic fix completed"
  ],
  "phases": {
    "diagnosis": true,
    "doctor": true,
    "surgeon": true,
    "verify": true
  }
}
```

## Monitoring Your Deployment

### 1. Vercel Dashboard

Monitor your deployment at:
- https://vercel.com/dashboard
- View build logs
- Check runtime logs
- Monitor performance metrics

### 2. Public Status Endpoint

Use the public status endpoint for external monitoring:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Detailed status
curl https://your-app.vercel.app/api/public/status
```

### 3. Sync Monitors

Check real-time sync status:

```bash
curl https://your-app.vercel.app/api/sync/monitors
```

## Performance Optimization

### Caching Strategy

Public endpoints are cached:
- **Client**: 60 seconds
- **CDN**: 5 minutes (300 seconds)

This reduces load on the serverless functions while providing near-real-time data.

### Edge Functions

Consider enabling Vercel Edge Functions for:
- Lower latency
- Better global distribution
- Reduced cold starts

Edit `vercel.json` to add:

```json
{
  "functions": {
    "api/*.ts": {
      "runtime": "edge"
    }
  }
}
```

## Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors

**Solution**:
1. Check TypeScript configuration in `tsconfig.json`
2. Verify all imports use correct extensions (`.js` for `.ts` files)
3. Run `npm run build` locally to test

### API Not Responding

**Issue**: API endpoints return 404 or 502

**Solution**:
1. Check `vercel.json` routing configuration and confirm which file is configured as the entrypoint (for this project, typically `server.ts`).
2. Verify that the entrypoint file (for example, `server.ts`) correctly exposes the Express app or handler used by Vercel routing. If `server.ts` starts its own `app.listen(...)`, be aware this is a traditional Node server pattern rather than the standard Vercel serverless function pattern.
3. Check Vercel function or server logs for errors, depending on how the entrypoint is configured.

**Note on Express and serverless behavior**: On Vercel, the typical pattern is to export a request handler (e.g., an Express app) from an API file without calling `app.listen`, allowing Vercel to manage the HTTP server and scale functions on demand. If your `server.ts` file starts its own listener and relies on in-memory schedulers or monitors (such as `setInterval` jobs), those tasks may not be reliable across deployments, cold starts, or scaling events. For durable scheduling and monitoring in production, prefer external schedulers (e.g., Vercel cron jobs, GitHub Actions, or third-party schedulers) and external storage/queues instead of in-memory state.
### Environment Variables

**Issue**: Missing configuration or API keys

**Solution**:
1. Add environment variables in Vercel dashboard
2. Redeploy after adding variables
3. Check logs for specific missing variables

## Advanced Configuration

### Custom Domain

Add a custom domain in Vercel dashboard:
1. Go to Settings → Domains
2. Add your domain
3. Configure DNS records
4. SSL automatically provisioned

### Webhooks

Configure webhooks for:
- Deployment notifications
- Build status updates
- Integration with other services

### Preview Deployments

Each PR automatically gets a preview deployment:
- Unique URL for testing
- Isolated environment
- Same configuration as production

## Security Considerations

### Public Endpoints

Public endpoints are read-only and return:
- Non-sensitive configuration data
- Aggregated status metrics
- No secrets or credentials

### Private Endpoints

All write operations require proper authentication (implement as needed):
- Strategy management
- Sync execution
- Configuration updates

### Rate Limiting

Consider implementing rate limiting for public endpoints:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/public/', limiter);
```

## Next Steps

After deployment:

1. **Test Public Endpoints**: Verify public API is accessible
2. **Configure Monitoring**: Set up uptime monitoring
3. **Add Analytics**: Track API usage
4. **Set Up Alerts**: Configure notifications for failures
5. **Document URLs**: Share public API URLs with consumers

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- GitHub Issues: Submit issues to the repository
- API Documentation: See `docs/SYNC_API.md`

## Conclusion

Your Repo-Doctor application is now configured for seamless Vercel deployment with:
- ✅ Public data API endpoints
- ✅ Auto-fix capabilities
- ✅ Dynamic sync configuration
- ✅ Real-time monitoring
- ✅ Optimized caching
- ✅ CORS support

Deploy with confidence! 🚀
