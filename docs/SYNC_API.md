# Advanced Synchronization Strategy API

## Overview

The Advanced Synchronization Strategy API provides a robust, configurable system for dynamic repository synchronization with real-time monitoring, error handling, and retry logic.

## Features

- **Multiple Sync Modes**: Realtime, Scheduled, Manual, and On-Demand
- **User-Configurable Strategies**: Define custom synchronization strategies
- **Robust Error Handling**: Automatic retry with exponential backoff
- **Status Monitoring**: Real-time progress and status tracking
- **Filter Support**: Include/exclude patterns for selective synchronization
- **Scheduled Execution**: Interval-based automatic synchronization

## Synchronization Modes

### Realtime
Synchronization triggered immediately on events (e.g., push, commit).

### Scheduled
Automatic synchronization at specified intervals (in seconds).

### Manual
Synchronization triggered manually via API call.

### On-Demand
Synchronization executed on specific triggers (e.g., webhook, API).

## API Endpoints

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
  "targets": ["repo1", "repo2"],
  "filters": [
    {
      "type": "include",
      "pattern": "*.ts",
      "scope": "files"
    }
  ]
}
```

**Response:**
```json
{
  "success": true
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
  "configPath": "/path/to/sync-config.json"
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
