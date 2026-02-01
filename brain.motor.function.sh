#!/usr/bin/env bash
set -euo pipefail

# ⚙️ REPO BRAIN HOSPITAL - Motor Function Test (Phase 15 - v2.2.0)
# Purpose: Verify Hardhat/Web3 compilation cycles for blockchain repositories

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
BRAIN="$ROOT/.repo-brain"
DETECT="$BRAIN/detect.json"
OUT="$BRAIN/motor-function.json"

log() { echo -e "⚙️ [Motor Function] $1"; }

log "Initiating Motor Function Test..."

motor_status="not_applicable"
compilation_successful="false"
test_successful="false"
framework_detected="none"
check_performed="false"

# Check if this is a Web3/blockchain repository
if [ -f "$DETECT" ]; then
  languages=$(${JQ_BIN:-jq} -r '.languages[]' "$DETECT" 2>/dev/null || echo "")
  
  # Check for Solidity/Hardhat
  if echo "$languages" | grep -q "solidity" || [ -f "$ROOT/hardhat.config.ts" ] || [ -f "$ROOT/hardhat.config.js" ]; then
    framework_detected="hardhat"
    motor_status="checking"
    check_performed="true"
    
    log "🔍 Detected Hardhat project - Verifying motor function..."
    
    # Check for Hardhat installation
    if [ -f "$ROOT/package.json" ] && grep -q '"hardhat"' "$ROOT/package.json"; then
      log "✅ Hardhat dependency found"
      
      # Check for compiled artifacts
      if [ -d "$ROOT/artifacts" ] && [ -d "$ROOT/cache" ]; then
        log "✅ Compilation artifacts present"
        compilation_successful="true"
        motor_status="stable"
      else
        log "⚠️ No compilation artifacts found"
        motor_status="needs_compilation"
        
        # Attempt compilation if node_modules exists
        if [ -d "$ROOT/node_modules" ] && command -v npx >/dev/null 2>&1; then
          log "🔧 Attempting Hardhat compilation..."
          if npx hardhat compile --quiet >/dev/null 2>&1; then
            log "✅ Compilation successful"
            compilation_successful="true"
            motor_status="stable"
          else
            log "⚠️ Compilation failed - Manual intervention required"
            motor_status="unstable"
          fi
        fi
      fi
      
      # Check for tests
      if [ -d "$ROOT/test" ] || [ -d "$ROOT/tests" ]; then
        log "🧪 Test directory detected"
        # Note: We don't run tests automatically to avoid long execution
        test_successful="detected_but_not_run"
      fi
    else
      log "⚠️ Hardhat not installed"
      motor_status="missing_dependency"
    fi
  
  # Check for Foundry
  elif [ -f "$ROOT/foundry.toml" ]; then
    framework_detected="foundry"
    motor_status="checking"
    check_performed="true"
    
    log "🔍 Detected Foundry project - Verifying motor function..."
    
    if command -v forge >/dev/null 2>&1; then
      log "✅ Forge binary found"
      
      # Check if project builds
      if [ -d "$ROOT/out" ]; then
        log "✅ Build artifacts present"
        compilation_successful="true"
        motor_status="stable"
      else
        log "🔧 Attempting Foundry build..."
        if forge build --quiet >/dev/null 2>&1; then
          log "✅ Build successful"
          compilation_successful="true"
          motor_status="stable"
        else
          log "⚠️ Build failed"
          motor_status="unstable"
        fi
      fi
    else
      log "⚠️ Forge not installed"
      motor_status="missing_dependency"
    fi
  
  # Check for Anchor (Solana)
  elif [ -f "$ROOT/Anchor.toml" ]; then
    framework_detected="anchor"
    motor_status="checking"
    check_performed="true"
    
    log "🔍 Detected Anchor project - Verifying motor function..."
    
    if command -v anchor >/dev/null 2>&1; then
      log "✅ Anchor CLI found"
      
      if [ -d "$ROOT/target" ]; then
        log "✅ Build artifacts present"
        compilation_successful="true"
        motor_status="stable"
      else
        log "⚠️ No build artifacts - requires 'anchor build'"
        motor_status="needs_compilation"
      fi
    else
      log "⚠️ Anchor CLI not installed"
      motor_status="missing_dependency"
    fi
  fi
fi

# If no Web3 framework detected, skip motor function test
if [ "$framework_detected" = "none" ]; then
  log "ℹ️ No Web3 framework detected - Motor function test not applicable"
fi

# Generate report
cat > "$OUT" <<JSON
{
  "phase": "motor-function",
  "motor_status": "$motor_status",
  "framework_detected": "$framework_detected",
  "check_performed": $check_performed,
  "compilation_successful": $compilation_successful,
  "test_successful": "$test_successful",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
JSON

if [ "$motor_status" = "stable" ] || [ "$motor_status" = "not_applicable" ]; then
  log "✅ Motor Function Test complete"
  exit 0
else
  log "⚠️ Motor Function Test complete with warnings"
  exit 0  # Non-blocking warning
fi
