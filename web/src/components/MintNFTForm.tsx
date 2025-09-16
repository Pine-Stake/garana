'use client';

import { useState } from 'react';
import { useNFTContract, MintResult } from '@/hooks/useNFTContract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MintNFTFormProps {
  onSuccess?: (result: MintResult) => void;
}

export default function MintNFTForm({ onSuccess }: MintNFTFormProps) {
  const [collectionId, setCollectionId] = useState('0');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [result, setResult] = useState<MintResult | null>(null);
  
  const { mintNFT, loading, error, clearError, getExplorerUrl } = useNFTContract();

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!recipientAddress.trim()) {
      alert('Please enter a recipient address');
      return;
    }

    const mintResult = await mintNFT(parseInt(collectionId), recipientAddress.trim());
    setResult(mintResult);
    
    if (mintResult.success && onSuccess) {
      onSuccess(mintResult);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Mint NFT</h2>
      
      <form onSubmit={handleMint} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Collection ID
          </label>
          <Input
            type="number"
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            min="0"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Recipient Address
          </label>
          <Input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="GXXXXX..."
            className="font-mono text-sm"
          />
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Minting...
            </>
          ) : (
            '🎨 Mint NFT'
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {result.success ? (
            <div>
              <div className="flex items-center mb-2">
                <span className="text-green-400 mr-2">✅</span>
                <p className="font-semibold">NFT minted successfully!</p>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Token ID:</span> {result.tokenId}</p>
                <p><span className="font-medium">URI:</span> {result.expectedUri}</p>
                <p>
                  <span className="font-medium">Transaction:</span>{' '}
                  <a 
                    href={getExplorerUrl(result.transactionHash!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Explorer
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex">
              <span className="text-red-400 mr-2">❌</span>
              <p className="text-sm">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}