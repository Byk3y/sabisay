#!/usr/bin/env bash
set -euo pipefail

# Load private env for this shell only; DO NOT echo secrets
set -a
source "$(dirname "$0")/../.env"
set +a

if [[ -z "${AMOY_RPC_URL:-}" || -z "${PRIVATE_KEY:-}" ]]; then
  echo "AMOY_RPC_URL or PRIVATE_KEY not set in contracts/.env" >&2
  exit 1
fi

# Sanity: print deployer address (safe to show)
DEPLOYER=$(cast wallet address --private-key "$PRIVATE_KEY")
echo "Deployer: $DEPLOYER"

# Deploy HelloWorld to Amoy
OUT=$(forge create ./contracts/HelloWorld.sol:HelloWorld \
  --rpc-url "$AMOY_RPC_URL" \
  --private-key "$PRIVATE_KEY")

echo "$OUT"

# Parse address + tx hash from Forge output
ADDRESS=$(echo "$OUT" | sed -n 's/Deployed to: //p' | tail -n1)
TXHASH=$(echo "$OUT" | sed -n 's/Transaction hash: //p' | tail -n1)

echo "Contract: $ADDRESS"
echo "Tx: $TXHASH"
echo "Explorer (addr): https://amoy.polygonscan.com/address/$ADDRESS"
echo "Explorer (tx):   https://amoy.polygonscan.com/tx/$TXHASH"

# Save address for later
mkdir -p contracts/addresses
jq -n --arg addr "$ADDRESS" '{ HelloWorld: $addr }' > contracts/addresses/amoy.json
echo "Wrote contracts/addresses/amoy.json"