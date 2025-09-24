#!/usr/bin/env bash
set -euo pipefail

# Set the private key for the first Anvil account
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

RPC_URL=http://127.0.0.1:8545

echo "🚀 Deploying MockUSDC to local Anvil chain..."
echo "RPC URL: $RPC_URL"
echo "Private Key: $PRIVATE_KEY"
echo ""

forge script script/DeployLocal.s.sol:DeployLocal \
  --rpc-url $RPC_URL \
  --broadcast \
  -vvvv

echo ""
echo "✅ Deployment completed!"
echo "📁 Broadcast files saved to: broadcast/DeployLocal.s.sol/31337/run-latest.json"
