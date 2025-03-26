import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

// Solana Devnet network address
export const SOLANA_NETWORK = 'https://api.devnet.solana.com';

/**
 * Create Solana blockchain connection
 * @returns Solana connection object
 */
export const createConnection = (): Connection => {
  return new Connection(SOLANA_NETWORK);
};

/**
 * Generate mock transaction hash
 * @returns Random transaction hash
 */
export const generateMockTransactionHash = (): string => {
  return 'HAI' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Mock sending survey reward transaction
 * @param recipientAddress Recipient wallet address
 * @param amount Reward amount
 * @returns Transaction hash
 */
export const mockSendReward = async (
  recipientAddress: string,
  amount: number
): Promise<string> => {
  return new Promise<string>((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const txHash = generateMockTransactionHash();
      console.log(`Mock transaction: ${amount} HAI sent to ${recipientAddress}, Transaction ID: ${txHash}`);
      resolve(txHash);
    }, 1500);
  });
};

/**
 * Validate if Solana address is valid
 * @param address Solana address to validate
 * @returns Whether the address is valid
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get current HAI token balance (mock)
 * @param walletAddress Wallet address
 * @returns Mocked HAI token balance
 */
export const getMockHaiBalance = async (walletAddress: string): Promise<number> => {
  // In a real application, this would query the actual token balance
  // Here we use a fixed value + random value to simulate
  return 100 + Math.floor(Math.random() * 900);
};

/**
 * React Hook: Use blockchain functionality
 */
export const useBlockchain = () => {
  const wallet = useWallet();
  
  /**
   * Send survey reward
   * @param recipientAddress Recipient address
   * @param amount Reward amount
   * @returns Transaction hash or null
   */
  const sendReward = async (
    recipientAddress: string,
    amount: number
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      console.error('Please connect wallet first');
      return null;
    }
    
    try {
      // In a real application, this would build and send a real transaction
      // Now using mock function
      const txHash = await mockSendReward(recipientAddress, amount);
      console.log('Reward sent successfully');
      return txHash;
    } catch (error) {
      console.error('Failed to send reward:', error);
      return null;
    }
  };
  
  /**
   * Create new survey
   * @param surveyData Survey data
   * @param rewardPerParticipant Reward per participant
   * @param maxParticipants Maximum number of participants
   * @returns Transaction hash or null
   */
  const createSurvey = async (
    surveyData: any,
    rewardPerParticipant: number,
    maxParticipants: number
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      console.error('Please connect wallet first');
      return null;
    }
    
    try {
      // In a real application, this would build and send a real transaction
      // Now using mock function
      const txHash = generateMockTransactionHash();
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Survey created successfully');
      return txHash;
    } catch (error) {
      console.error('Failed to create survey:', error);
      return null;
    }
  };
  
  /**
   * Get current wallet's HAI token balance
   * @returns Token balance
   */
  const getHaiBalance = async (): Promise<number> => {
    if (!wallet.connected || !wallet.publicKey) {
      return 0;
    }
    
    try {
      return await getMockHaiBalance(wallet.publicKey.toString());
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  };
  
  return {
    sendReward,
    createSurvey,
    getHaiBalance,
    isConnected: wallet.connected,
    walletAddress: wallet.publicKey?.toString() || '',
  };
};
