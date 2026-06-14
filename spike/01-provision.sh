#!/usr/bin/env bash
# Stage 1 — create resource group + free-tier Azure AI Search service.
# Writes the admin key to .env (gitignored). Takes ~2–5 min.
#
# COST GATE: aborts immediately if SEARCH_SKU != free.
# If provisioning fails with a quota/availability error, the script exits non-zero
# and prints instructions — do NOT retry with a paid SKU without human approval.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"

# Create .env from example if it doesn't exist
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[stage-1] No .env found — creating from .env.example"
  cp "$ENV_EXAMPLE" "$ENV_FILE"
fi

# Source .env
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

# Cost gate — abort if SKU is not free
if [[ "${SEARCH_SKU:-}" != "free" ]]; then
  echo "COST GATE FAIL: SEARCH_SKU is '${SEARCH_SKU:-unset}' — must be 'free'."
  echo "Edit spike/.env and set SEARCH_SKU=free, then retry."
  exit 2
fi

RESOURCE_GROUP="${SEARCH_RESOURCE_GROUP:-evidence-engine-rg}"
REGION="${SEARCH_REGION:-eastus}"
SERVICE_NAME="${SEARCH_SERVICE_NAME:-evidence-engine-search}"

echo "[stage-1] Creating resource group: $RESOURCE_GROUP (location: $REGION)"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$REGION" \
  --output none

echo "[stage-1] Creating Azure AI Search service: $SERVICE_NAME (sku: $SEARCH_SKU)"
echo "          This takes ~2–5 minutes..."
if ! az search service create \
  --name "$SERVICE_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --sku "$SEARCH_SKU" \
  --location "$REGION" \
  --output none; then
  echo ""
  echo "FAIL: stage 1 — Azure AI Search creation failed."
  echo "If this is a quota or availability error, STOP — do NOT retry with a paid SKU."
  echo "Report the error to the human operator for approval before any retry."
  exit 1
fi

echo "[stage-1] Retrieving admin key..."
ADMIN_KEY=$(az search admin-key show \
  --service-name "$SERVICE_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query primaryKey -o tsv)

# Write admin key back to .env (replace or append)
if grep -q "^SEARCH_ADMIN_KEY=" "$ENV_FILE"; then
  # macOS-compatible in-place sed
  sed -i.bak "s|^SEARCH_ADMIN_KEY=.*|SEARCH_ADMIN_KEY=$ADMIN_KEY|" "$ENV_FILE"
  rm -f "$ENV_FILE.bak"
else
  echo "SEARCH_ADMIN_KEY=$ADMIN_KEY" >> "$ENV_FILE"
fi

echo ""
echo "PASS: stage 1 — Azure AI Search provisioned"
echo "  Service name  : $SERVICE_NAME"
echo "  Resource group: $RESOURCE_GROUP"
echo "  Region        : $REGION"
echo "  SKU           : $SEARCH_SKU"
echo "  Admin key     : written to spike/.env (gitignored)"
echo ""
echo "Teardown: az group delete --name $RESOURCE_GROUP --yes --no-wait"
