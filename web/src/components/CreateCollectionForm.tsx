'use client';

import { useState } from 'react';
import { useNFTContract, CreateCollectionResult } from '@/hooks/useNFTContract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateCollectionFormProps {
  onSuccess?: (result: CreateCollectionResult) => void;
}

export default function CreateCollectionForm({ onSuccess }: CreateCollectionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    baseUri: ''
  });
  const [result, setResult] = useState<CreateCollectionResult | null>(null);
  
  const { createCollection, loading, error, clearError, getExplorerUrl } = useNFTContract();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!formData.name.trim() || !formData.symbol.trim()) {
      alert('Please enter both name and symbol');
      return;
    }

    const createResult = await createCollection(
      formData.name.trim(),
      formData.symbol.trim(),
      formData.baseUri.trim() || undefined
    );
    
    setResult(createResult);
    
    if (createResult.success) {
      // Reset form on success
      setFormData({ name: '', symbol: '', baseUri: '' });
      
      if (onSuccess) {
        onSuccess(createResult);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Collection</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Collection Name *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="My NFT Collection"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Symbol *
          </label>
          <Input
            type="text"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value)}
            placeholder="MNC"
            maxLength={10}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Base URI
          </label>
          <Input
            type="url"
            value={formData.baseUri}
            onChange={(e) => handleInputChange('baseUri', e.target.value)}
            placeholder="https://api.myart.com/"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. NFT URIs will be: base_uri + token_id
          </p>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Creating...
            </>
          ) : (
            '🚀 Create Collection'
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
                <p className="font-semibold">Collection created successfully!</p>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Collection ID:</span> {result.collectionId}</p>
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