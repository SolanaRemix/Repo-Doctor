# Advanced Synchronization Strategy API

## Overview

The Advanced Synchronization Strategy API provides a robust, configurable system for dynamic repository synchronization with real-time monitoring, error handling, and retry logic.

## Features

- **Multiple Sync Modes**: Realtime, Scheduled, Manual, and On-Demand
- **User-Configurable Strategies**: Define custom synchronization strategies
- **Robust Error Handling**: Automatic retry with exponential backoff
- **Status Monitoring**: Real-time progress and status tracking
- **Planned Filter Support** (not yet implemented): Include/exclude patterns for selective synchronization
- **Scheduled Execution**: Interval-based automatic synchronization
- **Public Data API**: Read-only public endpoints for status and configuration
- **Auto-Fix**: Automated analysis, repair, and patch application

## Synchronization Modes

### Realtime
Conceptual mode intended for event-driven synchronization (e.g., push, commit). Currently, realtime behavior must be emulated via scheduled runs or manual `/execute/:id` calls; direct event/webhook triggering is not yet implemented.

### Scheduled
Automatic synchronization at specified intervals (in seconds).

### Manual
Synchronization triggered manually via API call (e.g., `/execute/:id`).

### On-Demand
Synchronization triggered manually via the execution API (e.g., `/execute/:id`). Webhook- or event-based on-demand triggering is planned but not yet implemented.

## API Endpoints

### Public API Endpoints (Read-Only)

#### Get Public Configuration

**GET** `/api/public/config`

Get public synchronization configuration and strategies (read-only, no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "strategies": [
      {
        "id": "hourly-fleet-sync",
        "name": "Hourly Fleet Synchronization",
        "mode": "scheduled",
        "enabled": true,
        "interval": 3600
      }
    ],
    "monitors": [
      {
        "strategyId": "hourly-fleet-sync",
        "status": "success",
        "lastUpdate": "2026-02-06T20:00:00.000Z"
      }
    ],
    "version": "2.2.0",
    "timestamp": "2026-02-06T20:00:00.000Z"
  }
}
```

#### Get Public Status

**GET** `/api/public/status`

Get public system status and health metrics (read-only, no authentication required).

**Response:**
```json
{
  "success": true,
  "data": {
    "system": {
      "status": "GREEN",
      "version": "2.2.0",
      "timestamp": "2026-02-06T20:00:00.000Z"
    },
    "sync": {
      "total": 5,
      "active": 1,
      "failed": 0,
      "idle": 4
    },
    "health": {
      "framework": "react",
      "ci": "github-actions",
      "healthScore": 85
    }
  }
}
```

### Brain Operations

#### Auto-Fix

**POST** `/api/brain/auto-fix`

Run full analysis, repair, and apply patches automatically. This endpoint executes diagnosis, doctor, surgeon, and verify phases in sequence.

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

### Register a Strategy

**POST** `/api/sync/strategy`

Register a new synchronization strategy.

**Request Body:**
```json
{
  "id": "my-sync-strategy",
  "name": "My Sync Strategy",
  "mode": "scheduled",
  "enabled": true,
  "interval": 3600,
  "maxRetries": 3,
  "retryDelay": 1000,
  "targets": ["repo1", "repo2"]
}
```

**Note**: `targets` must be relative paths without `..` or shell metacharacters. Absolute paths are rejected for security.

**Response:**
```json
{
  "success": true
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid target \"../escape\": Target contains invalid path segments"
}
```

### Get All Strategies

**GET** `/api/sync/strategies`

Retrieve all registered synchronization strategies.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "my-sync-strategy",
      "name": "My Sync Strategy",
      "mode": "scheduled",
      "enabled": true,
      "interval": 3600,
      "maxRetries": 3,
      "retryDelay": 1000,
      "targets": ["repo1", "repo2"]
    }
  ]
}
```

### Update a Strategy

**PUT** `/api/sync/strategy/:strategyId`

Update an existing synchronization strategy.

**Request Body:**
```json
{
  "enabled": false,
  "interval": 7200
}
```

**Response:**
```json
{
  "success": true
}
```

### Delete a Strategy

**DELETE** `/api/sync/strategy/:strategyId`

Remove a synchronization strategy.

**Response:**
```json
{
  "success": true
}
```

### Execute Sync

**POST** `/api/sync/execute/:strategyId`

Execute synchronization for a specific strategy.

**Request Body:**
```json
{
  "trigger": "manual"
}
```

**Response:**
```json
{
  "strategyId": "my-sync-strategy",
  "status": "success",
  "timestamp": "2026-02-06T11:30:00.000Z",
  "duration": 5432,
  "itemsSynced": 10,
  "itemsFailed": 0,
  "repos": ["repo1", "repo2"],
  "logs": [
    "Starting sync for strategy: My Sync Strategy",
    "Mode: scheduled, Trigger: manual",
    "Syncing plugins to 2 target(s)",
    "Synced plugins to repo1",
    "Synced plugins to repo2"
  ]
}
```

### Start Scheduled Sync

**POST** `/api/sync/schedule/start/:strategyId`

Start scheduled synchronization for a strategy.

**Response:**
```json
{
  "success": true
}
```

### Stop Scheduled Sync

**POST** `/api/sync/schedule/stop/:strategyId`

Stop scheduled synchronization for a strategy.

**Response:**
```json
{
  "success": true
}
```

### Get Monitor Status

**GET** `/api/sync/monitor/:strategyId`

Get real-time monitoring status for a strategy.

**Response:**
```json
{
  "success": true,
  "data": {
    "strategyId": "my-sync-strategy",
    "status": "success",
    "currentProgress": 10,
    "totalItems": 10,
    "startTime": "2026-02-06T11:30:00.000Z",
    "lastUpdate": "2026-02-06T11:30:05.432Z",
    "logs": [
      "Strategy My Sync Strategy registered",
      "Sync started (trigger: manual)",
      "Sync completed successfully in 5432ms"
    ]
  }
}
```

### Get All Monitors

**GET** `/api/sync/monitors`

Get monitoring status for all strategies.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "strategyId": "my-sync-strategy",
      "status": "idle",
      "currentProgress": 0,
      "totalItems": 0,
      "startTime": "2026-02-06T11:27:00.000Z",
      "lastUpdate": "2026-02-06T11:27:00.000Z",
      "logs": ["Strategy My Sync Strategy registered"]
    }
  ]
}
```

### Load Configuration

**POST** `/api/sync/config/load`

Load synchronization configuration from a file.

**Request Body:**
```json
{
  "configPath": "/path/to/sync-config.json"
}
```

**Response:**
```json
{
  "success": true
}
```

### Save Configuration

**POST** `/api/sync/config/save`

Save synchronization configuration to a file.

**Request Body:**
```json
{
  "configPath": "sync-config.json"
}
```

**Response:**
```json
{
  "success": true
}
```

## Configuration File Format

See `sync-config.example.json` for a complete example.

```json
{
  "strategies": [
    {
      "id": "fleet-realtime-sync",
      "name": "Fleet Real-time Synchronization",
      "mode": "realtime",
      "enabled": true,
      "maxRetries": 3,
      "retryDelay": 2000
    }
  ],
  "globalRetryPolicy": {
    "maxRetries": 3,
    "retryDelay": 1000,
    "backoffMultiplier": 2
  },
  "monitoring": {
    "enabled": true,
    "logLevel": "info",
    "alertThreshold": 5
  }
}
```

## Error Handling

The synchronization service includes robust error handling with:

- **Automatic Retry**: Failed synchronizations are automatically retried
- **Exponential Backoff**: Retry delays increase exponentially
- **Error Callbacks**: Custom error handlers can be defined
- **Detailed Logging**: All errors are logged with timestamps and context

## Status Monitoring

Real-time status monitoring provides:

- **Current Status**: idle, syncing, success, failed, retrying
- **Progress Tracking**: Current and total items synced
- **Timestamp Tracking**: Start time and last update time
- **Detailed Logs**: Complete log history for each strategy

## Usage Examples

### Basic Manual Sync

```bash
# Register a strategy
curl -X POST http://localhost:3001/api/sync/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "id": "manual-sync",
    "name": "Manual Sync",
    "mode": "manual",
    "enabled": true
  }'

# Execute sync
curl -X POST http://localhost:3001/api/sync/execute/manual-sync \
  -H "Content-Type: application/json" \
  -d '{"trigger": "api"}'

# Check monitor
curl http://localhost:3001/api/sync/monitor/manual-sync
```

### Scheduled Sync with Targets

```bash
# Register scheduled strategy
curl -X POST http://localhost:3001/api/sync/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "id": "hourly-sync",
    "name": "Hourly Plugin Sync",
    "mode": "scheduled",
    "enabled": true,
    "interval": 3600,
    "targets": ["repo1", "repo2", "repo3"]
  }'

# Start scheduled sync
curl -X POST http://localhost:3001/api/sync/schedule/start/hourly-sync
```

### Load Configuration from File

```bash
# Load configuration
curl -X POST http://localhost:3001/api/sync/config/load \
  -H "Content-Type: application/json" \
  -d '{"configPath": "./sync-config.json"}'

# Get all strategies
curl http://localhost:3001/api/sync/strategies

# Get all monitors
curl http://localhost:3001/api/sync/monitors
```

## Integration with Repo Brain

The synchronization service integrates seamlessly with the existing Repo Brain system:

- Uses `brain.fleet.sh` for fleet-wide synchronization
- Supports plugin synchronization to target repositories
- Compatible with existing `.repo-brain` structure
- Maintains consistency with MERMEDA pipeline phases

## Best Practices

1. **Use Scheduled Mode for Regular Syncs**: Set up scheduled strategies for routine synchronization
2. **Configure Appropriate Retry Policies**: Adjust retry count and delays based on your network reliability
3. **Monitor Status Regularly**: Check monitor endpoints to track sync health
4. **Use Filters for Selective Sync**: Apply filters to sync only necessary files
5. **Save Configuration**: Persist your strategies to configuration files for easy restoration

## Troubleshooting

### Sync Fails Immediately

Check that:
- Strategy is enabled
- Targets exist and are valid git repositories
- Required scripts are executable

### Scheduled Sync Not Running

Verify:
- Strategy mode is set to "scheduled"
- Interval is specified in seconds
- Scheduled sync has been started via API

### High Failure Rate

Consider:
- Increasing retry count
- Adjusting retry delay
- Checking network connectivity
- Reviewing error logs in monitor

## Security

The synchronization service implements multiple security layers:

### Path Validation

All target paths are validated to prevent directory traversal:
- **Absolute paths rejected**: Only relative paths allowed
- **Traversal blocked**: Paths containing `..` are rejected
- **Metacharacter filtering**: Shell metacharacters like `|`, `;`, `$` are blocked
- **Root containment**: All resolved paths must stay within the repository root

### Command Injection Prevention

- Uses `execFile()` instead of `exec()` to avoid shell interpretation
- All commands use argument arrays, not string concatenation
- No user input is ever passed to a shell

### File Access Restrictions

Configuration load/save operations are restricted:
- **Directory restriction**: Only `.repo-brain/` directory accessible
- **Path sanitization**: `path.basename()` strips directory traversal
- **No absolute paths**: User-provided paths must be relative
- **Filename validation**: Rejects invalid characters and patterns

### Resource Limits

- **Log size limiting**: Monitor logs capped at 1000 lines to prevent memory exhaustion
- **Execution locking**: Prevents overlapping sync executions for the same strategy
- **Interval validation**: Scheduled syncs validate enabled state before starting

### Input Validation

- **Strategy validation**: ID, name, and mode are required and validated
- **Target validation**: All targets validated before registration
- **Trigger validation**: Only valid `SyncTrigger` values accepted
- **HTTP status codes**: 400 for validation errors, 500 for server errors

### Best Practices

1. **Use relative target paths** like `"repo1"`, `"projects/repo2"`
2. **Avoid special characters** in target names
3. **Review monitor logs** regularly for security events
4. **Limit strategy access** to trusted users only
5. **Use HTTPS** in production deployments
