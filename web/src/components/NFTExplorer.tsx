'use client';

import { useState, useEffect } from 'react';
import { useNFTContract } from '@/hooks/useNFTContract';
import { Button } from '@/components/ui/button';

interface Collection {
  owner: string;
  name: string;
  symbol: string;
  base_uri: string | null;
}

interface Token {
  owner: string;
  uri: string;
}

export default function NFTExplorer() {
  const [collections, setCollections] = useState<{ [key: number]: Collection }>({});
  const [tokens, setTokens] = useState<{ [key: string]: Token }>({});
  const [totalCollections, setTotalCollections] = useState<number>(0);
  const [selectedCollection, setSelectedCollection] = useState<number>(0);
  const [tokenCount, setTokenCount] = useState<number>(0);
  
  const { 
    getTotalCollections, 
    getCollection, 
    getTotalTokensInCollection,
    getToken,
    connectWallet,
    error 
  } = useNFTContract();

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    loadTotalCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection >= 0) {
      loadCollectionData(selectedCollection);
    }
  }, [selectedCollection]);

  const loadTotalCollections = async () => {
    const total = await getTotalCollections();
    if (total !== null) {
      setTotalCollections(total);
      // Load first few collections
      for (let i = 0; i < Math.min(total, 5); i++) {
        loadCollection(i);
      }
    }
  };

  const loadCollection = async (id: number) => {
    const collection = await getCollection(id);
    if (collection) {
      setCollections(prev => ({ ...prev, [id]: collection }));
    }
  };

  const loadCollectionData = async (collectionId: number) => {
    const count = await getTotalTokensInCollection(collectionId);
    if (count !== null) {
      setTokenCount(count);
      // Load first few tokens
      for (let i = 0; i < Math.min(count, 10); i++) {
        loadToken(collectionId, i);
      }
    }
  };

  const loadToken = async (collectionId: number, tokenId: number) => {
    try {
      const token = await getToken(collectionId, tokenId);
      if (token) {
        setTokens(prev => ({ ...prev, [`${collectionId}-${tokenId}`]: token }));
      }
    } catch (err) {
      // Token might not exist, that's ok
    }
  };

  const handleConnectWallet = async () => {
    try {
      const userInfo = await connectWallet();
      setWalletConnected(true);
      setWalletAddress(userInfo.publicKey);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">NFT Explorer</h2>
        <Button 
          onClick={handleConnectWallet}
          disabled={walletConnected}
          variant={walletConnected ? "secondary" : "default"}
        >
          {walletConnected ? `Connected: ${formatAddress(walletAddress)}` : 'Connect Wallet'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collections Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Collections ({totalCollections})</h3>
          
          <div className="space-y-3">
            {Array.from({ length: totalCollections }, (_, i) => i).map(collectionId => {
              const collection = collections[collectionId];
              return (
                <div
                  key={collectionId}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedCollection === collectionId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCollection(collectionId)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        Collection #{collectionId}
                      </h4>
                      {collection ? (
                        <div className="text-sm text-gray-600 mt-1">
                          <p><span className="font-medium">Name:</span> {collection.name}</p>
                          <p><span className="font-medium">Symbol:</span> {collection.symbol}</p>
                          {collection.base_uri && (
                            <p><span className="font-medium">Base URI:</span> {collection.base_uri}</p>
                          )}
                          <p><span className="font-medium">Owner:</span> {formatAddress(collection.owner)}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Loading...</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {totalCollections === 0 && (
              <p className="text-gray-500 text-center py-4">No collections found</p>
            )}
          </div>
        </div>

        {/* Tokens Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Tokens in Collection #{selectedCollection} ({tokenCount})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Array.from({ length: tokenCount }, (_, i) => i).map(tokenId => {
              const token = tokens[`${selectedCollection}-${tokenId}`];
              return (
                <div
                  key={tokenId}
                  className="p-3 border border-gray-200 rounded-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Token #{tokenId}</h4>
                      {token ? (
                        <div className="text-sm text-gray-600 mt-1">
                          <p><span className="font-medium">Owner:</span> {formatAddress(token.owner)}</p>
                          <p><span className="font-medium">URI:</span> 
                            <a 
                              href={token.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline ml-1"
                            >
                              {token.uri}
                            </a>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Loading...</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {tokenCount === 0 && (
              <p className="text-gray-500 text-center py-4">No tokens found</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="text-sm">Error: {error}</p>
        </div>
      )}
    </div>
  );
}