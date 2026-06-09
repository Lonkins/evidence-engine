#!/bin/bash
# RiskRadar overnight autonomous development loop
# Runs a single Claude Code cycle, then exits. Scheduled via launchd.

set -e

REPO="/Users/tomprice/Documents/Projects/agents-league"
LOG="$REPO/.claude/memory/overnight-log.md"
PROMPT_FILE="$REPO/OVERNIGHT_LOOP.md"
CLAUDE="/opt/homebrew/bin/claude"

echo "" >> "$LOG"
echo "## $(date '+%Y-%m-%d %H:%M') — cycle start" >> "$LOG"

cd "$REPO"

"$CLAUDE" \
  --dangerously-skip-permissions \
  --print \
  "$(cat "$PROMPT_FILE")" \
  >> "$LOG" 2>&1

echo "## $(date '+%Y-%m-%d %H:%M') — cycle end" >> "$LOG"
