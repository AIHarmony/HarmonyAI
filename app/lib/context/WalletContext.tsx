'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { walletApi, userApi } from '../api';
import { delay } from '../utils';
import { Transaction } from '../types';

interface WalletContextType {
  isWalletConnected: boolean;
  isWalletLinked: boolean;
  walletAddress: string | null;
  balance: number;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  linkWalletToAccount: () => Promise<boolean>;
  loadBalance: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  sendTokens: (recipient: string, amount: number) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType>({
  isWalletConnected: false,
  isWalletLinked: false,
  walletAddress: null,
  balance: 0,
  transactions: [],
  loading: false,
  error: null,
  connect: async () => false,
  disconnect: () => {},
  linkWalletToAccount: async () => false,
  loadBalance: async () => {},
  loadTransactions: async () => {},
  sendTokens: async () => false,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Authentication context
  const { user, updateUser } = useAuth();

  // State management
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // For the MVP, we're using a mock implementation
  // In a real implementation, this would interact with a Solana wallet adapter
  const connect = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock wallet connection delay
      await delay(1000);
      
      // Mock successful connection with a random wallet address
      const mockAddress = `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 10)}`;
      setWalletAddress(mockAddress);
      setIsWalletConnected(true);
      
      // Load initial balance for the connected wallet
      await loadBalance();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const disconnect = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setBalance(0);
    setTransactions([]);
  };
  
  const linkWalletToAccount = async (): Promise<boolean> => {
    if (!user || !walletAddress) {
      setError('User is not logged in or wallet is not connected');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await userApi.linkWallet(walletAddress);
      
      if (response.success && response.data) {
        // Update the user data with the linked wallet
        updateUser({ walletAddress });
        return true;
      } else {
        setError(response.error || 'Failed to link wallet');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to link wallet');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const loadBalance = async (): Promise<void> => {
    if (!isWalletConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await walletApi.getBalance();
      
      if (response.success && response.data) {
        setBalance(response.data.balance);
      } else {
        setError(response.error || 'Failed to load balance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  };
  
  const loadTransactions = async (): Promise<void> => {
    if (!isWalletConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await walletApi.getTransactions();
      
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        setError(response.error || 'Failed to load transactions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };
  
  const sendTokens = async (recipient: string, amount: number): Promise<boolean> => {
    if (!isWalletConnected) {
      setError('Wallet is not connected');
      return false;
    }
    
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    
    if (amount > balance) {
      setError('Insufficient balance');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await walletApi.transferTokens(recipient, amount);
      
      if (response.success) {
        // Update balance after successful transfer
        await loadBalance();
        await loadTransactions();
        return true;
      } else {
        setError(response.error || 'Failed to send tokens');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send tokens');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Check if the wallet is linked to the current user
  const isWalletLinked = !!user?.walletAddress && user.walletAddress === walletAddress;
  
  // Auto-connect wallet if user has a linked wallet
  useEffect(() => {
    if (user?.walletAddress && !isWalletConnected) {
      connect().then(() => {
        // If successful, set the wallet address to the linked address
        setWalletAddress(user.walletAddress);
      });
    }
  }, [user]);
  
  const value = {
    isWalletConnected,
    isWalletLinked,
    walletAddress,
    balance,
    transactions,
    loading,
    error,
    connect,
    disconnect,
    linkWalletToAccount,
    loadBalance,
    loadTransactions,
    sendTokens,
  };
  
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWallet = () => useContext(WalletContext);

export default WalletContext;
