#!/bin/bash

# Garana NFT Contract Deployment Script
# Run from the stellar/ directory

set -e

echo "🚀 Building Garana NFT Contract..."

# Build the contract
echo "📦 Building contract..."
stellar contract build

# Check if build succeeded
if [ ! -f "target/wasm32v1-none/release/guarana.wasm" ]; then
    echo "❌ Build failed - wasm file not found"
    exit 1
fi

# Optimize the contract
echo "⚡ Optimizing contract..."
stellar contract optimize --wasm target/wasm32v1-none/release/guarana.wasm

# Check if optimization succeeded
if [ ! -f "target/wasm32v1-none/release/guarana.optimized.wasm" ]; then
    echo "❌ Optimization failed - optimized wasm file not found"
    exit 1
fi

echo "✅ Contract built and optimized successfully!"
echo "📄 Optimized contract: target/wasm32v1-none/release/guarana.optimized.wasm"
echo ""
echo "To deploy the contract, run:"
echo "stellar contract deploy --wasm target/wasm32v1-none/release/guarana.optimized.wasm --source YOUR_SECRET_KEY --network testnet"
echo ""
echo "Remember to update the CONTRACT_ID in web/.env.local after deployment!"