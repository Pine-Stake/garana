#!/usr/bin/env node

import * as StellarSdk from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;
const CONTRACT_ID = process.env.CONTRACT_ID;

if (!CONTRACT_ID) {
    console.error('❌ CONTRACT_ID environment variable is required');
    process.exit(1);
}

async function transferNFT() {
    const args = process.argv.slice(2);
    
    if (args.length < 4) {
        console.error('Usage: node transfer-nft.js <collection-id> <token-id> <to-address> <from-secret-key>');
        console.error('Example: node transfer-nft.js 0 1 GXXX... SXXX...');
        process.exit(1);
    }

    const [collectionIdStr, tokenIdStr, toAddress, fromSecretKey] = args;
    const collectionId = parseInt(collectionIdStr);
    const tokenId = parseInt(tokenIdStr);
    
    if (isNaN(collectionId) || isNaN(tokenId)) {
        console.error('❌ Collection ID and Token ID must be numbers');
        process.exit(1);
    }

    try {
        const server = new StellarSdk.rpc.Server(RPC_URL);
        const fromKeypair = StellarSdk.Keypair.fromSecret(fromSecretKey);
        
        console.log('📮 Transferring NFT...');
        console.log(`🆔 Collection ID: ${collectionId}`);
        console.log(`🎯 Token ID: ${tokenId}`);
        console.log(`📤 From: ${fromKeypair.publicKey()}`);
        console.log(`📥 To: ${toAddress}`);
        
        // Get account
        const account = await server.getAccount(fromKeypair.publicKey());
        
        // Create contract instance
        const contract = new StellarSdk.Contract(CONTRACT_ID);
        
        // Build transaction
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(
            contract.call(
                'transfer',
                StellarSdk.Address.fromString(fromKeypair.publicKey()),    // from
                StellarSdk.Address.fromString(toAddress),                  // to
                collectionId,               // collection_id
                tokenId                     // token_id
            )
        )
        .setTimeout(30)
        .build();

        // Simulate first
        console.log('🔍 Simulating transaction...');
        const simulated = await server.simulateTransaction(transaction);
        
        if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
            console.error('❌ Simulation failed:', simulated.error);
            process.exit(1);
        }

        // Prepare and sign transaction
        const prepared = await server.prepareTransaction(transaction);
        prepared.sign(fromKeypair);
        
        // Submit transaction
        console.log('📡 Submitting transaction...');
        const result = await server.sendTransaction(prepared);
        
        if (result.status === 'ERROR') {
            console.error('❌ Transaction failed:', result);
            process.exit(1);
        }

        console.log('⏳ Waiting for confirmation...');
        
        // Wait for confirmation
        let getResponse = await server.getTransaction(result.hash);
        while (getResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            getResponse = await server.getTransaction(result.hash);
        }

        if (getResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
            console.log('✅ NFT transferred successfully!');
            console.log(`🆔 Transaction Hash: ${result.hash}`);
        } else {
            console.error('❌ Transaction failed:', getResponse);
        }

    } catch (error) {
        console.error('❌ Error transferring NFT:', error.message);
        process.exit(1);
    }
}

transferNFT();