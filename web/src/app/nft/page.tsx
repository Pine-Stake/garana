'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MintNFTForm from '@/components/MintNFTForm';
import CreateCollectionForm from '@/components/CreateCollectionForm';
import NFTExplorer from '@/components/NFTExplorer';
import Header from '@/components/Header';

type Tab = 'explorer' | 'create-collection' | 'mint-nft';

export default function NFTDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('explorer');

  const tabs = [
    { id: 'explorer' as Tab, label: '🔍 Explorer', description: 'Browse collections and tokens' },
    { id: 'create-collection' as Tab, label: '🚀 Create Collection', description: 'Create a new NFT collection' },
    { id: 'mint-nft' as Tab, label: '🎨 Mint NFT', description: 'Mint new NFTs' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Soroban NFT Platform</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create collections, mint NFTs, and explore the ecosystem on Stellar&apos;s Soroban network.
            All NFT metadata URIs are automatically generated using the collection&apos;s base URI + token ID.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg shadow-sm p-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="m-1 flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'explorer' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">NFT Explorer</h2>
                <p className="text-gray-600">Browse all collections and tokens on the platform</p>
              </div>
              <NFTExplorer />
            </div>
          )}

          {activeTab === 'create-collection' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Collection</h2>
                <p className="text-gray-600">Create a new NFT collection with automatic URI generation</p>
              </div>
              <CreateCollectionForm 
                onSuccess={(result) => {
                  console.log('Collection created:', result);
                  // Optionally switch to explorer or show success message
                }}
              />
            </div>
          )}

          {activeTab === 'mint-nft' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Mint NFT</h2>
                <p className="text-gray-600">Mint new NFTs with automatically generated metadata URIs</p>
              </div>
              <MintNFTForm 
                onSuccess={(result) => {
                  console.log('NFT minted:', result);
                  // Optionally switch to explorer or show success message
                }}
              />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">How it Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="font-semibold mb-2">1. Create Collection</h4>
              <p className="text-gray-600">
                Set up a new NFT collection with a name, symbol, and base URI for metadata.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold mb-2">2. Mint NFTs</h4>
              <p className="text-gray-600">
                Mint NFTs in any collection. URIs are automatically generated as base_uri + token_id.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <h4 className="font-semibold mb-2">3. Explore & Trade</h4>
              <p className="text-gray-600">
                Browse collections, view token metadata, and track ownership on the blockchain.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold mb-2 text-blue-800">🔧 Technical Details</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Network:</strong> Stellar Testnet (Soroban)</li>
            <li>• <strong>Contract ID:</strong> <code className="bg-blue-100 px-1 rounded">{process.env.NEXT_PUBLIC_CONTRACT_ID}</code></li>
            <li>• <strong>Wallet:</strong> Freighter wallet integration</li>
            <li>• <strong>URI Generation:</strong> Automatic (collection base_uri + token_id)</li>
            <li>• <strong>Features:</strong> Collection creation, NFT minting, ownership tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}