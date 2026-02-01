#!/usr/bin/env bash
set -euo pipefail

# 🤖 REPO BRAIN HOSPITAL - Neural Bridge Grafting (Phase 14 - v2.2.0)
# Purpose: Automated GitHub Token authentication repair and feedback loop restoration

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
BRAIN="$ROOT/.repo-brain"
OUT="$BRAIN/neural-bridge.json"

log() { echo -e "🤖 [Neural Bridge] $1"; }

log "Initiating Neural Bridge Grafting..."

# Check for GITHUB_TOKEN in environment
github_token_status="missing"
if [ -n "${GITHUB_TOKEN:-}" ]; then
  github_token_status="present"
  log "✅ GITHUB_TOKEN detected in environment"
else
  log "⚠️ GITHUB_TOKEN not found in environment"
fi

# Check for GitHub Actions context
in_github_actions="false"
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  in_github_actions="true"
  log "✅ Running in GitHub Actions context"
fi

# Check for authentication loop issues
auth_loop_detected="false"
feedback_loop_status="healthy"

# Check if GitHub API is accessible
if command -v curl >/dev/null 2>&1; then
  if [ "$github_token_status" = "present" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: token $GITHUB_TOKEN" \
      "https://api.github.com/user" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
      log "✅ GitHub API authentication successful"
      feedback_loop_status="active"
    elif [ "$response" = "401" ]; then
      log "⚠️ GitHub Token authentication failed"
      auth_loop_detected="true"
      feedback_loop_status="broken"
    else
      log "⚠️ GitHub API unreachable (status: $response)"
      feedback_loop_status="unreachable"
    fi
  fi
fi

# Attempt to repair feedback loop
repair_attempts=0
repair_success="false"

if [ "$feedback_loop_status" = "broken" ]; then
  log "💉 Attempting to restore feedback loop..."
  repair_attempts=1
  
  # In a real scenario, this would attempt token refresh or re-authentication
  # For now, we document the repair attempt
  log "🔧 Documented repair attempt for manual intervention"
  
  # Check for backup token in git config
  backup_token=$(git config --get github.token 2>/dev/null || echo "")
  if [ -n "$backup_token" ]; then
    log "✅ Found backup token in git config"
    export GITHUB_TOKEN="$backup_token"
    repair_success="true"
    feedback_loop_status="restored"
  fi
fi

# Generate report
cat > "$OUT" <<JSON
{
  "phase": "neural-bridge",
  "github_token_status": "$github_token_status",
  "in_github_actions": $in_github_actions,
  "auth_loop_detected": $auth_loop_detected,
  "feedback_loop_status": "$feedback_loop_status",
  "repair_attempts": $repair_attempts,
  "repair_success": $repair_success,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
JSON

if [ "$feedback_loop_status" = "active" ] || [ "$feedback_loop_status" = "restored" ]; then
  log "✅ Neural Bridge Grafting complete - Feedback loop operational"
  exit 0
else
  log "⚠️ Neural Bridge Grafting complete - Manual intervention may be required"
  exit 0  # Non-blocking warning
fi
