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

async function mintNFT() {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.error('Usage: node mint-nft.js <collection-id> <recipient-address> [secret-key]');
        console.error('Example: node mint-nft.js 0 GXXX... SXXX...');
        process.exit(1);
    }

    const [collectionIdStr, recipientAddress, secretKey] = args;
    const collectionId = parseInt(collectionIdStr);
    
    if (isNaN(collectionId)) {
        console.error('❌ Collection ID must be a number');
        process.exit(1);
    }
    
    if (!secretKey) {
        console.error('❌ Secret key is required as the 3rd parameter');
        process.exit(1);
    }

    try {
        const server = new StellarSdk.rpc.Server(RPC_URL);
        const minterKeypair = StellarSdk.Keypair.fromSecret(secretKey);
        
        // Create contract instance to query collection info
        const contract = new StellarSdk.Contract(CONTRACT_ID);
        const dummyKeypair = StellarSdk.Keypair.random();
        const dummyAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');
        
        // Query collection to get base URI and current token count
        const collectionTx = new StellarSdk.TransactionBuilder(dummyAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(
            contract.call('get_collection', StellarSdk.nativeToScVal(collectionId, {type: 'u32'}))
        )
        .setTimeout(30)
        .build();
        
        const collectionResult = await server.simulateTransaction(collectionTx);
        if (StellarSdk.rpc.Api.isSimulationError(collectionResult)) {
            console.error('❌ Failed to get collection info:', collectionResult.error);
            process.exit(1);
        }
        
        const collection = StellarSdk.scValToNative(collectionResult.result.retval);
        
        // Query total tokens in collection to get the next token ID
        const totalTokensTx = new StellarSdk.TransactionBuilder(dummyAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(
            contract.call('total_tokens_in_collection', StellarSdk.nativeToScVal(collectionId, {type: 'u32'}))
        )
        .setTimeout(30)
        .build();
        
        const totalTokensResult = await server.simulateTransaction(totalTokensTx);
        if (StellarSdk.rpc.Api.isSimulationError(totalTokensResult)) {
            console.error('❌ Failed to get token count:', totalTokensResult.error);
            process.exit(1);
        }
        
        const currentTokenCount = StellarSdk.scValToNative(totalTokensResult.result.retval);
        const nextTokenId = currentTokenCount;
        
        // Calculate what the auto-generated URI will be
        const expectedUri = collection.base_uri ? `${collection.base_uri}${nextTokenId}` : '';
        
        console.log('🎨 Minting NFT...');
        console.log(`🆔 Collection ID: ${collectionId}`);
        console.log(`📧 Recipient: ${recipientAddress}`);
        console.log(`📄 Auto-generated URI: ${expectedUri || '(no base URI set)'}`);
        console.log(`🎯 Expected Token ID: ${nextTokenId}`);
        console.log(`👤 Minter: ${minterKeypair.publicKey()}`);
        
        // Get account
        const account = await server.getAccount(minterKeypair.publicKey());
        
        // Contract instance already created above
        
        // Build transaction
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(
            contract.call(
                'mint_nft',
                StellarSdk.nativeToScVal(minterKeypair.publicKey(), {type: 'address'}),  // minter
                StellarSdk.nativeToScVal(collectionId, {type: 'u32'}),               // collection_id
                StellarSdk.nativeToScVal(recipientAddress, {type: 'address'})           // to
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
        prepared.sign(minterKeypair);
        
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
            console.log('✅ NFT minted successfully!');
            console.log(`🆔 Transaction Hash: ${result.hash}`);
            
            // Try to extract token ID from result
            if (getResponse.returnValue) {
                const tokenId = StellarSdk.scValToNative(getResponse.returnValue);
                console.log(`🎯 Token ID: ${tokenId}`);
            }
        } else {
            console.error('❌ Transaction failed:', getResponse);
        }

    } catch (error) {
        console.error('❌ Error minting NFT:', error.message);
        process.exit(1);
    }
}

mintNFT();