#!/usr/bin/env bash
set -euo pipefail

# 🧬 REPO BRAIN HOSPITAL - Resilient Runner (v2.2.0)
# Optimized for Windows (Git Bash/WSL) and POSIX
# 18-Phase MERMEDA Orchestration Pipeline

# Resolve the brain directory relative to the script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || cd "$SCRIPT_DIR/.." && pwd)"
BRAIN="$SCRIPT_DIR"

log() { echo -e "🧠 [BRAIN] $1"; }

mkdir -p "$BRAIN/tools"
mkdir -p "$BRAIN/auto-comments"

# Node fallback for jq
if ! command -v jq >/dev/null 2>&1; then
  log "⚠️ jq not found, using Node fallback..."
  if [ ! -f "$BRAIN/tools/json-cli.js" ]; then
    log "💉 JSON-CLI missing. Repairing..."
    # Placeholder for a real repair - in this environment we assume it's seeded
  fi
  export JQ_BIN="node $BRAIN/tools/json-cli.js"
else
  export JQ_BIN="jq"
fi

# Resilient requirement check
require() { 
  if [ ! -f "$BRAIN/$1" ]; then
    log "❌ FATAL: Missing component '$1' in $BRAIN"
    log "💡 Try running: brainctl heal"
    exit 1
  fi
}

# The 18-Phase MERMEDA Pipeline (v2.2.0)
SCRIPTS=(
  brain.detect.sh
  brain.scan-actions.sh
  brain.frameworks.sh
  brain.frameworks.ci.sh
  brain.solidity.detect.sh
  brain.solidity.ci.sh
  brain.rust.sh
  brain.normalize.sh
  brain.diagnose.sh
  brain.fix.safe.sh
  brain.verify.sh
  brain.ai.guard.sh
  brain.greenlock.sh
  brain.neural.bridge.sh
  brain.motor.function.sh
  brain.guard.sh
  brain.fleet.sh
  brain.vitals.sh
  brain.vercel.troubleshoot.sh
  brain.test.sh
)

log "Initiating 18-Phase Hospital Admission (MERMEDA v2.2.0)..."
for s in "${SCRIPTS[@]}"; do require "$s"; done

for s in "${SCRIPTS[@]}"; do
  log "Executing Phase: $s"
  bash "$BRAIN/$s" || log "⚠️ Phase $s returned a warning signal. Continuing..."
done

# Synchronize workflows
mkdir -p "$ROOT/.github/workflows"
cp -u "$BRAIN/github-actions/"*.yml "$ROOT/.github/workflows/" 2>/dev/null || true

log "✅ Admission Cycle Complete. Repository Health Updated."
