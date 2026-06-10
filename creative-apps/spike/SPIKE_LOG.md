# Evidence Engine — Spike Run Log

## Overview

Each row records one stage execution. Result is PASS / FAIL / SKIP. Notes capture any
quota errors, timing, or follow-up actions.

## Run Results

| Run | Stage | Description | Date | Result | Duration | Notes |
|-----|-------|-------------|------|--------|----------|-------|
| 1 | 0 | Azure CLI login check | 2026-06-10 | PASS | <1s | subscription: Azure subscription 1, user: thomas1311@hotmail.co.uk |
| 1 | 1 | Provision free-tier Azure AI Search | 2026-06-10 | PASS | ~3 min | sku=free, status=running; Microsoft.Search provider auto-registered; admin key written to .env |
