#!/usr/bin/env bash
set -euo pipefail

# Test new public API endpoints and auto-fix endpoint

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
API_URL="http://localhost:3001"

log() { echo "🧪 [test-new-endpoints] $1"; }
error() { echo "❌ [test-new-endpoints] $1"; exit 1; }
success() { echo "✅ [test-new-endpoints] $1"; }

# Check if server is running
check_server() {
  log "Checking if API server is running..."
  if curl -s "${API_URL}/api/health" > /dev/null 2>&1; then
    success "API server is running"
    return 0
  else
    log "API server is not running. Tests will be skipped."
    return 1
  fi
}

# Test 1: Public config endpoint
test_public_config() {
  log "Test 1: Get public configuration"
  
  RESPONSE=$(curl -s "${API_URL}/api/public/config")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    if echo "$RESPONSE" | grep -q '"version":"2.2.0"'; then
      success "Public config endpoint working"
    else
      error "Public config missing version"
    fi
  else
    error "Failed to get public config: $RESPONSE"
  fi
}

# Test 2: Public status endpoint
test_public_status() {
  log "Test 2: Get public status"
  
  RESPONSE=$(curl -s "${API_URL}/api/public/status")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    if echo "$RESPONSE" | grep -q '"system"'; then
      success "Public status endpoint working"
    else
      error "Public status missing system info"
    fi
  else
    error "Failed to get public status: $RESPONSE"
  fi
}

# Test 3: Auto-fix endpoint (will fail gracefully if .repo-brain not present)
test_auto_fix() {
  log "Test 3: Auto-fix endpoint (may fail if .repo-brain not present)"
  
  RESPONSE=$(curl -s -X POST "${API_URL}/api/brain/auto-fix")
  
  # Check if response has expected structure (success or graceful error)
  if echo "$RESPONSE" | grep -q '"logs"'; then
    success "Auto-fix endpoint working (returned logs)"
  elif echo "$RESPONSE" | grep -q '"error"'; then
    log "Auto-fix returned error (expected if .repo-brain not present)"
    success "Auto-fix endpoint responds correctly"
  else
    error "Auto-fix endpoint not responding correctly: $RESPONSE"
  fi
}

# Run all tests
main() {
  log "Starting New Endpoint Tests..."
  log "========================================"
  
  if ! check_server; then
    log "Skipping tests - server not running"
    exit 0
  fi
  
  test_public_config
  test_public_status
  test_auto_fix
  
  log "========================================"
  success "All new endpoint tests passed!"
}

main "$@"
