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

async function createCollection() {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.error('Usage: node create-collection.js <name> <symbol> <base-uri> [secret-key]');
        console.error('Example: node create-collection.js "My Collection" "MC" "https://api.example.com/" SXXX...');
        process.exit(1);
    }

    const [name, symbol, baseUri, secretKey] = args;
    
    if (!secretKey) {
        console.error('❌ Secret key is required as the 4th parameter');
        process.exit(1);
    }

    try {
        const server = new StellarSdk.rpc.Server(RPC_URL);
        const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
        
        console.log('🚀 Creating collection...');
        console.log(`📝 Name: ${name}`);
        console.log(`🔤 Symbol: ${symbol}`);
        console.log(`🔗 Base URI: ${baseUri}`);
        console.log(`👤 Creator: ${sourceKeypair.publicKey()}`);
        
        // Get account
        const account = await server.getAccount(sourceKeypair.publicKey());
        
        // Create contract instance
        const contract = new StellarSdk.Contract(CONTRACT_ID);
        
        // Build transaction
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(
            contract.call(
                'create_collection',
                StellarSdk.nativeToScVal(sourceKeypair.publicKey(), {type: 'address'}),  // creator
                StellarSdk.nativeToScVal(name, {type: 'string'}),                       // name
                StellarSdk.nativeToScVal(symbol, {type: 'string'}),                     // symbol
                baseUri ? StellarSdk.nativeToScVal(baseUri, {type: 'string'}) : StellarSdk.nativeToScVal(null, {type: 'option'})    // base_uri
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
        prepared.sign(sourceKeypair);
        
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
            console.log('✅ Collection created successfully!');
            console.log(`🆔 Transaction Hash: ${result.hash}`);
            
            // Try to extract collection ID from result
            if (getResponse.returnValue) {
                const collectionId = StellarSdk.scValToNative(getResponse.returnValue);
                console.log(`🎯 Collection ID: ${collectionId}`);
            }
        } else {
            console.error('❌ Transaction failed:', getResponse);
        }

    } catch (error) {
        console.error('❌ Error creating collection:', error.message);
        process.exit(1);
    }
}

createCollection();