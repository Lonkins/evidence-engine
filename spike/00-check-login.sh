#!/usr/bin/env bash
# Stage 0 — verify az CLI is authenticated.
# Exits 0 and prints "PASS: stage 0" on success.
# Exits 1 and prints "FAIL: stage 0" if not logged in; human must run: az login
set -euo pipefail

if az account show --query id -o tsv &>/dev/null 2>&1; then
  ACCOUNT_NAME=$(az account show --query "name" -o tsv 2>/dev/null)
  USER_NAME=$(az account show --query "user.name" -o tsv 2>/dev/null)
  echo "PASS: stage 0 — subscription: '$ACCOUNT_NAME', user: '$USER_NAME'"
else
  echo "FAIL: stage 0 — not logged in to Azure CLI."
  echo "Fix: run 'az login' in a terminal, then retry."
  exit 1
fi
