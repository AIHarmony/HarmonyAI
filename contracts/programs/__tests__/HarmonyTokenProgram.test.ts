import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { HarmonyTokenProgram } from '../HarmonyTokenProgram';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('HarmonyTokenProgram', () => {
  let connection: Connection;
  let program: HarmonyTokenProgram;
  let testWallet: Keypair;

  beforeAll(async () => {
    // Connect to Solana local network
    connection = new Connection('http://localhost:8899', 'confirmed');
    program = new HarmonyTokenProgram(connection);
    testWallet = Keypair.generate();

    // Initialize token mint before running tests
    try {
      await program.initializeTokenMint();
    } catch (error: any) {
      console.warn('Token mint initialization failed:', error);
    }
  });

  it('should initialize token mint', async () => {
    const mintPublicKey = program.getMintPublicKey();
    expect(mintPublicKey).toBeDefined();
    expect(mintPublicKey?.toBase58()).toBeTruthy();
  });

  it('should mint tokens to a recipient', async () => {
    const recipient = Keypair.generate();
    const amount = 100;
    
    try {
      const tokenAccount = await program.mintTokens(recipient.publicKey, amount);
      expect(tokenAccount).toBeTruthy();
      
      const balance = await program.getTokenBalance(recipient.publicKey);
      expect(balance).toBe(amount);
    } catch (error: any) {
      // Skip test if airdrop limit is reached
      if (error.message?.includes('airdrop limit')) {
        console.warn('Skipping test due to airdrop limit');
        return;
      }
      throw error;
    }
  });

  it('should send tokens as reward', async () => {
    const sender = Keypair.generate();
    const recipient = Keypair.generate();
    const amount = 50;
    
    try {
      // First mint some tokens to the sender
      await program.mintTokens(sender.publicKey, amount);
      
      // Then send tokens as reward
      const recipientTokenAccount = await program.sendReward(
        sender.publicKey,
        recipient.publicKey,
        amount,
        sender
      );
      
      expect(recipientTokenAccount).toBeTruthy();
      
      const recipientBalance = await program.getTokenBalance(recipient.publicKey);
      expect(recipientBalance).toBe(amount);
    } catch (error: any) {
      // Skip test if airdrop limit is reached
      if (error.message?.includes('airdrop limit')) {
        console.warn('Skipping test due to airdrop limit');
        return;
      }
      throw error;
    }
  });

  it('should handle errors gracefully', async () => {
    const invalidAddress = new PublicKey('11111111111111111111111111111111');
    
    await expect(program.getTokenBalance(invalidAddress))
      .rejects
      .toThrow('Failed to get token balance');
  });

  afterAll(async () => {
    // Clean up any resources if needed
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
}); 