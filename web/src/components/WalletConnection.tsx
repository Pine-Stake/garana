'use client';

import { useState } from 'react';
import { useNFTContract } from '@/hooks/useNFTContract';
import { Button } from '@/components/ui/button';

export default function WalletConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { connectWallet } = useNFTContract();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const userInfo = await connectWallet();
      setAddress(userInfo.publicKey);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-mono text-gray-600">
            {formatAddress(address)}
          </span>
        </div>
      ) : (
        <Button 
          onClick={handleConnect}
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
}