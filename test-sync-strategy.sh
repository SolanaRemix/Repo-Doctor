#!/usr/bin/env bash
set -euo pipefail

# REPO BRAIN HOSPITAL - Sync Strategy Service Tests
# Purpose: Validates the synchronization strategy service functionality

API_URL="http://localhost:3001"

log() { echo "🧪 [sync-test] $1"; }
error() { echo "❌ [sync-test] $1"; exit 1; }
success() { echo "✅ [sync-test] $1"; }

# Check if server is running
check_server() {
  log "Checking if API server is running..."
  if curl -s "${API_URL}/api/health" > /dev/null 2>&1; then
    success "API server is running"
    return 0
  else
    log "API server is not running. Please start it with: npm run server"
    return 1
  fi
}

# Test 1: Register a strategy
test_register_strategy() {
  log "Test 1: Register synchronization strategy"
  
  RESPONSE=$(curl -s -X POST "${API_URL}/api/sync/strategy" \
    -H "Content-Type: application/json" \
    -d '{
      "id": "test-manual-sync",
      "name": "Test Manual Sync",
      "mode": "manual",
      "enabled": true,
      "maxRetries": 2,
      "retryDelay": 500
    }')
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    success "Strategy registered successfully"
  else
    error "Failed to register strategy: $RESPONSE"
  fi
}

# Test 2: Get all strategies
test_get_strategies() {
  log "Test 2: Get all strategies"
  
  RESPONSE=$(curl -s "${API_URL}/api/sync/strategies")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    if echo "$RESPONSE" | grep -q "test-manual-sync"; then
      success "Strategies retrieved successfully"
    else
      error "Registered strategy not found in list"
    fi
  else
    error "Failed to get strategies: $RESPONSE"
  fi
}

# Test 3: Update a strategy
test_update_strategy() {
  log "Test 3: Update strategy"
  
  RESPONSE=$(curl -s -X PUT "${API_URL}/api/sync/strategy/test-manual-sync" \
    -H "Content-Type: application/json" \
    -d '{
      "enabled": false
    }')
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    success "Strategy updated successfully"
  else
    error "Failed to update strategy: $RESPONSE"
  fi
}

# Test 4: Get monitor status
test_get_monitor() {
  log "Test 4: Get monitor status"
  
  RESPONSE=$(curl -s "${API_URL}/api/sync/monitor/test-manual-sync")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    if echo "$RESPONSE" | grep -q '"status":"idle"'; then
      success "Monitor status retrieved successfully"
    else
      error "Unexpected monitor status"
    fi
  else
    error "Failed to get monitor status: $RESPONSE"
  fi
}

# Test 5: Get all monitors
test_get_all_monitors() {
  log "Test 5: Get all monitors"
  
  RESPONSE=$(curl -s "${API_URL}/api/sync/monitors")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    success "All monitors retrieved successfully"
  else
    error "Failed to get all monitors: $RESPONSE"
  fi
}

# Test 6: Delete a strategy
test_delete_strategy() {
  log "Test 6: Delete strategy"
  
  RESPONSE=$(curl -s -X DELETE "${API_URL}/api/sync/strategy/test-manual-sync")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    success "Strategy deleted successfully"
  else
    error "Failed to delete strategy: $RESPONSE"
  fi
}

# Test 7: Verify deletion
test_verify_deletion() {
  log "Test 7: Verify strategy deletion"
  
  RESPONSE=$(curl -s "${API_URL}/api/sync/strategies")
  
  if echo "$RESPONSE" | grep -q "test-manual-sync"; then
    error "Strategy still exists after deletion"
  else
    success "Strategy deletion verified"
  fi
}

# Run all tests
main() {
  log "Starting Sync Strategy Service Tests..."
  log "========================================"
  
  if ! check_server; then
    error "Cannot run tests without API server"
  fi
  
  test_register_strategy
  test_get_strategies
  test_update_strategy
  test_get_monitor
  test_get_all_monitors
  test_delete_strategy
  test_verify_deletion
  
  log "========================================"
  success "All tests passed!"
}

main "$@"
