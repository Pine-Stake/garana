'use client';

import { useState, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { NFTContract, Collection } from '../lib/stellar/nft-contract';
import { FreighterWallet } from '../lib/stellar/freighter';
import { STELLAR_CONFIG, STELLAR_EXPLORER_URL } from '../lib/stellar/config';

export interface MintResult {
  success: boolean;
  transactionHash?: string;
  tokenId?: number;
  expectedUri?: string;
  collectionId?: number;
  error?: string;
}

export interface CreateCollectionResult {
  success: boolean;
  transactionHash?: string;
  collectionId?: number;
  error?: string;
}

export function useNFTContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const nftContract = new NFTContract();
  const wallet = new FreighterWallet();

  const mintNFT = useCallback(async (collectionId: number, recipientAddress: string): Promise<MintResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Freighter is available
      if (!(await wallet.isAvailable())) {
        throw new Error('Freighter wallet not found. Please install Freighter extension.');
      }

      // Connect wallet
      const userInfo = await wallet.connect();
      const minterPublicKey = userInfo.publicKey;

      console.log('🎨 Preparing to mint NFT...');
      console.log(`🆔 Collection ID: ${collectionId}`);
      console.log(`📧 Recipient: ${recipientAddress}`);
      console.log(`👤 Minter: ${minterPublicKey}`);

      // Build transaction
      const { transaction, expectedTokenId, expectedUri } = await nftContract.buildMintTransaction(
        minterPublicKey,
        collectionId,
        recipientAddress
      );

      console.log(`🎯 Expected Token ID: ${expectedTokenId}`);
      console.log(`📄 Expected URI: ${expectedUri}`);

      // Simulate transaction
      console.log('🔍 Simulating transaction...');
      const server = new StellarSdk.rpc.Server(STELLAR_CONFIG.RPC_URL);
      const simulated = await server.simulateTransaction(transaction);
      
      if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
        throw new Error(`Simulation failed: ${simulated.error}`);
      }

      // Prepare transaction
      const prepared = await server.prepareTransaction(transaction);
      
      // Sign with Freighter
      console.log('✍️ Please sign the transaction in Freighter...');
      const signed = await wallet.signTransaction(prepared);
      
      // Submit transaction
      console.log('📡 Submitting transaction...');
      const transactionHash = await nftContract.submitTransaction(signed);
      
      console.log('✅ NFT minted successfully!');
      
      return {
        success: true,
        transactionHash,
        tokenId: expectedTokenId,
        expectedUri,
        collectionId
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error minting NFT:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollection = useCallback(async (
    name: string, 
    symbol: string, 
    baseUri?: string
  ): Promise<CreateCollectionResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Freighter is available
      if (!(await wallet.isAvailable())) {
        throw new Error('Freighter wallet not found. Please install Freighter extension.');
      }

      // Connect wallet
      const userInfo = await wallet.connect();
      const creatorPublicKey = userInfo.publicKey;

      console.log('🚀 Creating collection...');
      console.log(`📝 Name: ${name}`);
      console.log(`🔤 Symbol: ${symbol}`);
      console.log(`🔗 Base URI: ${baseUri || 'None'}`);
      console.log(`👤 Creator: ${creatorPublicKey}`);

      // Build transaction
      const { transaction, expectedCollectionId } = await nftContract.buildCreateCollectionTransaction(
        creatorPublicKey,
        name,
        symbol,
        baseUri
      );

      console.log(`🎯 Expected Collection ID: ${expectedCollectionId}`);

      // Simulate transaction
      console.log('🔍 Simulating transaction...');
      const server = new StellarSdk.rpc.Server(STELLAR_CONFIG.RPC_URL);
      const simulated = await server.simulateTransaction(transaction);
      
      if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
        throw new Error(`Simulation failed: ${simulated.error}`);
      }

      // Prepare transaction
      const prepared = await server.prepareTransaction(transaction);
      
      // Sign with Freighter
      console.log('✍️ Please sign the transaction in Freighter...');
      const signed = await wallet.signTransaction(prepared);
      
      // Submit transaction
      console.log('📡 Submitting transaction...');
      const transactionHash = await nftContract.submitTransaction(signed);
      
      console.log('✅ Collection created successfully!');
      
      return {
        success: true,
        transactionHash,
        collectionId: expectedCollectionId
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error creating collection:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getCollection = useCallback(async (collectionId: number): Promise<Collection | null> => {
    try {
      return await nftContract.getCollection(collectionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    }
  }, []);

  const getToken = useCallback(async (collectionId: number, tokenId: number) => {
    try {
      return await nftContract.getToken(collectionId, tokenId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getTotalCollections = useCallback(async (): Promise<number | null> => {
    try {
      return await nftContract.getTotalCollections();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    }
  }, []);

  const getTotalTokensInCollection = useCallback(async (collectionId: number): Promise<number | null> => {
    try {
      return await nftContract.getTotalTokensInCollection(collectionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setError(null);
      
      if (!(await wallet.isAvailable())) {
        throw new Error('Freighter wallet not found. Please install Freighter extension.');
      }
      
      return await wallet.connect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getExplorerUrl = useCallback((txHash: string) => {
    return `${STELLAR_EXPLORER_URL}/tx/${txHash}`;
  }, []);

  return {
    mintNFT,
    createCollection,
    getCollection,
    getToken,
    getTotalCollections,
    getTotalTokensInCollection,
    connectWallet,
    getExplorerUrl,
    loading,
    error,
    clearError: () => setError(null)
  };
}