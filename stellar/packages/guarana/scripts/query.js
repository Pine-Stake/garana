#!/usr/bin/env node

import * as StellarSdk from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = process.env.CONTRACT_ID;

if (!CONTRACT_ID) {
    console.error('❌ CONTRACT_ID environment variable is required');
    process.exit(1);
}

async function queryContract() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.error('Usage: node query.js <command> [params...]');
        console.error('');
        console.error('Available commands:');
        console.error('  collection <collection-id>                    - Get collection info');
        console.error('  token <collection-id> <token-id>             - Get token info');
        console.error('  owner <collection-id> <token-id>             - Get token owner');
        console.error('  tokens <owner-address>                       - Get tokens owned by address');
        console.error('  total-collections                            - Get total number of collections');
        console.error('  total-tokens <collection-id>                 - Get total tokens in collection');
        console.error('');
        console.error('Examples:');
        console.error('  node query.js collection 0');
        console.error('  node query.js token 0 1');
        console.error('  node query.js owner 0 1');
        console.error('  node query.js tokens GXXX...');
        console.error('  node query.js total-collections');
        console.error('  node query.js total-tokens 0');
        process.exit(1);
    }

    const [command, ...params] = args;

    try {
        const server = new StellarSdk.rpc.Server(RPC_URL);
        const contract = new StellarSdk.Contract(CONTRACT_ID);

        console.log(`🔍 Querying contract: ${command}`);
        
        // Create a dummy account for simulation
        const dummyKeypair = StellarSdk.Keypair.random();
        const dummyAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');
        
        let result;
        
        switch (command) {
            case 'collection':
                if (params.length < 1) {
                    console.error('❌ Collection ID required');
                    process.exit(1);
                }
                const collectionTx = new StellarSdk.TransactionBuilder(dummyAccount, {
                    fee: StellarSdk.BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                .addOperation(
                    contract.call('get_collection', StellarSdk.nativeToScVal(parseInt(params[0]), {type: 'u32'}))
                )
                .setTimeout(30)
                .build();
                
                result = await server.simulateTransaction(collectionTx);
                break;
                
            case 'token':
                if (params.length < 2) {
                    console.error('❌ Collection ID and Token ID required');
                    process.exit(1);
                }
                const collectionId = parseInt(params[0]);
                const tokenId = parseInt(params[1]);
                
                // First get the token info
                const tokenTx = new StellarSdk.TransactionBuilder(dummyAccount, {
                    fee: StellarSdk.BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                .addOperation(
                    contract.call('get_token', StellarSdk.nativeToScVal(collectionId, {type: 'u32'}), StellarSdk.nativeToScVal(tokenId, {type: 'u32'}))
                )
                .setTimeout(30)
                .build();
                
                result = await server.simulateTransaction(tokenTx);
                
                // If successful, also get collection info to construct full URI
                if (!StellarSdk.rpc.Api.isSimulationError(result)) {
                    const tokenData = StellarSdk.scValToNative(result.result.retval);
                    
                    // Get collection info
                    const collectionQueryTx = new StellarSdk.TransactionBuilder(dummyAccount, {
                        fee: StellarSdk.BASE_FEE,
                        networkPassphrase: StellarSdk.Networks.TESTNET,
                    })
                    .addOperation(
                        contract.call('get_collection', StellarSdk.nativeToScVal(collectionId, {type: 'u32'}))
                    )
                    .setTimeout(30)
                    .build();
                    
                    const collectionResult = await server.simulateTransaction(collectionQueryTx);
                    if (!StellarSdk.rpc.Api.isSimulationError(collectionResult)) {
                        const collectionData = StellarSdk.scValToNative(collectionResult.result.retval);
                        
                        // Construct full URI: base_uri + token_id
                        const fullUri = collectionData.base_uri ? `${collectionData.base_uri}${tokenId}` : tokenData.uri;
                        
                        // Return modified token data with full URI
                        const enhancedResult = {
                            ...result,
                            result: {
                                ...result.result,
                                retval: StellarSdk.nativeToScVal({
                                    ...tokenData,
                                    uri: fullUri
                                })
                            }
                        };
                        result = enhancedResult;
                    }
                }
                break;
                
            case 'owner':
                if (params.length < 2) {
                    console.error('❌ Collection ID and Token ID required');
                    process.exit(1);
                }
                const ownerTx = new StellarSdk.TransactionBuilder(dummyAccount, {
                    fee: StellarSdk.BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                .addOperation(
                    contract.call('owner_of', StellarSdk.nativeToScVal(parseInt(params[0]), {type: 'u32'}), StellarSdk.nativeToScVal(parseInt(params[1]), {type: 'u32'}))
                )
                .setTimeout(30)
                .build();
                
                result = await server.simulateTransaction(ownerTx);
                break;
                
            case 'tokens':
                if (params.length < 1) {
                    console.error('❌ Owner address required');
                    process.exit(1);
                }
                const tokensTx = new StellarSdk.TransactionBuilder(dummyAccount, {
                    fee: StellarSdk.BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                .addOperation(
                    contract.call('tokens_of', StellarSdk.nativeToScVal(params[0], {type: 'address'}))
                )
                .setTimeout(30)
                .build();
                
                result = await server.simulateTransaction(tokensTx);
                break;
                
            case 'total-collections':
                const totalCollectionsTx = new StellarSdk.TransactionBuilder(dummyAccount, {
                    fee: StellarSdk.BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                .addOperation(
                    contract.call('total_collections')
                )
                .setTimeout(30)
                .build();
                
                result = await server.simulateTransaction(totalCollectionsTx);
                break;
                
            case 'total-tokens':
                if (params.length < 1) {
                    console.error('❌ Collection ID required');
                    process.exit(1);
                }
                const totalTokensTx = new StellarSdk.TransactionBuilder(dummyAccount, {
                    fee: StellarSdk.BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                .addOperation(
                    contract.call('total_tokens_in_collection', StellarSdk.nativeToScVal(parseInt(params[0]), {type: 'u32'}))
                )
                .setTimeout(30)
                .build();
                
                result = await server.simulateTransaction(totalTokensTx);
                break;
                
            default:
                console.error(`❌ Unknown command: ${command}`);
                process.exit(1);
        }

        if (StellarSdk.rpc.Api.isSimulationError(result)) {
            console.error('❌ Query failed:', result.error);
            process.exit(1);
        }

        if (result.result) {
            console.log('✅ Result:');
            try {
                const nativeResult = StellarSdk.scValToNative(result.result.retval);
                console.log(JSON.stringify(nativeResult, null, 2));
            } catch (error) {
                console.log('Raw result:', JSON.stringify(result.result.retval, null, 2));
            }
        } else {
            console.log('❌ No result returned');
        }

    } catch (error) {
        console.error('❌ Error querying contract:', error.message);
        process.exit(1);
    }
}

queryContract();