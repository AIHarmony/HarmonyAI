import * as assert from 'assert';
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  initializeTokenMint,
  mintTokens,
  sendReward,
  getTokenBalance,
} from '../programs/HarmonyTokenProgram';

/**
 * HarmonyAI Token Program Tests
 * 
 * This file contains unit tests for the HarmonyAI token program.
 */

describe('HarmonyAI Token Program Tests', () => {
  // Test environment variables
  const connection = new Connection('http://localhost:8899', 'confirmed');
  let payer: Keypair;
  let recipient: Keypair;
  let tokenMint: PublicKey;

  // Set up test environment before running tests
  before(async () => {
    // Generate test keypairs
    payer = Keypair.generate();
    recipient = Keypair.generate();
    
    // Airdrop SOL to payer for transaction fees
    const signature = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature);
    
    console.log('Test environment setup complete');
  });

  // Test token mint initialization
  it('should initialize the token mint', async () => {
    try {
      tokenMint = await initializeTokenMint(connection, payer);
      
      assert.ok(
        tokenMint instanceof PublicKey,
        'Token mint was not created properly'
      );
      
      console.log(`Token mint created: ${tokenMint.toString()}`);
    } catch (error) {
      console.error('Failed to initialize token mint:', error);
      throw error;
    }
  });

  // Test minting tokens to a recipient
  it('should mint tokens to a recipient', async () => {
    try {
      // Initial balance should be 0
      const initialBalance = await getTokenBalance(
        connection,
        recipient.publicKey
      );
      assert.strictEqual(initialBalance, 0, 'Initial balance should be 0');
      
      // Mint 100 tokens to recipient
      const amount = 100;
      await mintTokens(connection, payer, recipient.publicKey, amount);
      
      // Verify new balance
      const newBalance = await getTokenBalance(
        connection,
        recipient.publicKey
      );
      assert.strictEqual(
        newBalance,
        amount,
        `Balance should be ${amount} after minting`
      );
      
      console.log(`Successfully minted ${amount} tokens to recipient`);
    } catch (error) {
      console.error('Failed to mint tokens:', error);
      throw error;
    }
  });

  // Test sending tokens between accounts
  it('should send tokens between accounts', async () => {
    try {
      // Create another recipient
      const recipient2 = Keypair.generate();
      
      // Get initial balances
      const initialBalance1 = await getTokenBalance(
        connection,
        recipient.publicKey
      );
      const initialBalance2 = await getTokenBalance(
        connection,
        recipient2.publicKey
      );
      
      // Send 50 tokens from recipient to recipient2
      const transferAmount = 50;
      await sendReward(
        connection,
        recipient,
        recipient2.publicKey,
        transferAmount
      );
      
      // Verify new balances
      const newBalance1 = await getTokenBalance(
        connection,
        recipient.publicKey
      );
      const newBalance2 = await getTokenBalance(
        connection,
        recipient2.publicKey
      );
      
      assert.strictEqual(
        newBalance1,
        initialBalance1 - transferAmount,
        'Sender balance incorrect after transfer'
      );
      assert.strictEqual(
        newBalance2,
        initialBalance2 + transferAmount,
        'Recipient balance incorrect after transfer'
      );
      
      console.log(`Successfully transferred ${transferAmount} tokens between accounts`);
    } catch (error) {
      console.error('Failed to transfer tokens:', error);
      throw error;
    }
  });
}); 