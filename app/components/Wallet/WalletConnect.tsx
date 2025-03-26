'use client';

import { useState, useEffect } from 'react';
import { useHarmonyWallet } from '../../hooks/useWallet';
import { useAuth } from '../../hooks/useAuth';

export default function WalletConnect() {
  const { 
    isWalletConnected, 
    isWalletLinked, 
    walletAddress, 
    balance, 
    loading, 
    error,
    linkWalletToAccount,
    connect,
    disconnect
  } = useHarmonyWallet();
  
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  
  // Format wallet address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Link wallet to account
  const handleLinkWallet = async () => {
    if (!user) {
      setLinkError('Please login first');
      return;
    }
    
    if (!isWalletConnected) {
      setLinkError('Please connect your wallet first');
      return;
    }
    
    setLinkError(null);
    const success = await linkWalletToAccount();
    
    if (success) {
      setShowModal(false);
    }
  };
  
  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };
  
  // Disconnect wallet
  const handleDisconnectWallet = () => {
    disconnect();
  };
  
  return (
    <div>
      {/* Wallet Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg transition"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5l-1.8-1.8A2 2 0 0012.2 2H7.8a2 2 0 00-1.4.6L4.5 4H4z" />
          <path d="M7 9a1 1 0 100-2 1 1 0 000 2zm2 2a1 1 0 110-2 1 1 0 010 2zm2-2a1 1 0 100-2 1 1 0 000 2zm2 2a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        <span>
          {isWalletConnected 
            ? isWalletLinked 
              ? `${formatAddress(walletAddress || '')} (${balance} HAI)` 
              : 'Link Wallet'
            : 'Connect Wallet'
          }
        </span>
      </button>
      
      {/* Wallet Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-zinc-900 rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Wallet Connection</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-zinc-400 hover:text-white"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {linkError && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4">
                {linkError}
              </div>
            )}
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400">Status:</span>
                <span className={`font-medium ${isWalletConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isWalletConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {isWalletConnected && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400">Address:</span>
                    <span className="font-medium text-zinc-200">{formatAddress(walletAddress || '')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400">Balance:</span>
                    <span className="font-medium text-blue-400">{balance} HAI</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Linked to Account:</span>
                    <span className={`font-medium ${isWalletLinked ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isWalletLinked ? 'Yes' : 'No'}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex flex-col space-y-3">
              {!isWalletConnected ? (
                <button
                  onClick={handleConnectWallet}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <>
                  {!isWalletLinked && user && (
                    <button
                      onClick={handleLinkWallet}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
                      disabled={loading}
                    >
                      {loading ? 'Linking...' : 'Link to My Account'}
                    </button>
                  )}
                  
                  <button
                    onClick={handleDisconnectWallet}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition"
                    disabled={loading}
                  >
                    Disconnect Wallet
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
