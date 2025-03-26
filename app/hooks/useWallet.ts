'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from './useAuth';
import { useBlockchain, isValidSolanaAddress } from '../utils/blockchain';

export const useHarmonyWallet = () => {
  const solanaWallet = useWallet();
  const { user, connectWallet } = useAuth();
  const blockchain = useBlockchain();
  
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if connected wallet matches user's wallet
  const isWalletConnected = !!solanaWallet.connected && !!solanaWallet.publicKey;
  const isWalletLinked = 
    !!user?.walletAddress && 
    isWalletConnected && 
    solanaWallet.publicKey?.toString() === user.walletAddress;
  
  // Load wallet balance
  const loadBalance = useCallback(async () => {
    if (!isWalletConnected) {
      setBalance(0);
      return;
    }
    
    setLoading(true);
    try {
      const balance = await blockchain.getHaiBalance();
      setBalance(balance);
    } catch (err: any) {
      setError(err.message || 'Failed to load balance');
      console.error('Error loading balance:', err);
    } finally {
      setLoading(false);
    }
  }, [blockchain, isWalletConnected]);
  
  // Connect currently selected wallet to user account
  const linkWalletToAccount = useCallback(async () => {
    if (!user) {
      setError('Please login first');
      return false;
    }
    
    if (!isWalletConnected) {
      setError('Please connect your wallet first');
      return false;
    }
    
    if (isWalletLinked) {
      setError('Wallet is already linked to your account');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const walletAddress = solanaWallet.publicKey!.toString();
      const success = await connectWallet(walletAddress);
      
      if (success) {
        // Reload balance after linking
        await loadBalance();
        return true;
      } else {
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to link wallet');
      console.error('Error linking wallet:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isWalletConnected, isWalletLinked, solanaWallet.publicKey, connectWallet, loadBalance]);
  
  // Send HAI tokens to another address
  const sendTokens = useCallback(async (recipientAddress: string, amount: number) => {
    if (!isWalletLinked) {
      setError('Please connect and link your wallet first');
      return null;
    }
    
    if (!isValidSolanaAddress(recipientAddress)) {
      setError('Invalid recipient address');
      return null;
    }
    
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return null;
    }
    
    if (amount > balance) {
      setError('Insufficient balance');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const txHash = await blockchain.sendReward(recipientAddress, amount);
      
      if (txHash) {
        // Reload balance after sending
        await loadBalance();
      }
      
      return txHash;
    } catch (err: any) {
      setError(err.message || 'Failed to send tokens');
      console.error('Error sending tokens:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isWalletLinked, balance, blockchain, loadBalance]);
  
  // Load balance when wallet is connected
  useEffect(() => {
    if (isWalletConnected) {
      loadBalance();
    }
  }, [isWalletConnected, loadBalance]);
  
  return {
    isWalletConnected,
    isWalletLinked,
    walletAddress: solanaWallet.publicKey?.toString(),
    balance,
    loading,
    error,
    linkWalletToAccount,
    loadBalance,
    sendTokens,
    select: solanaWallet.select,
    connect: solanaWallet.connect,
    disconnect: solanaWallet.disconnect
  };
};
