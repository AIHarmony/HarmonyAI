import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToInstruction,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  getMint,
  getAccount,
  createMint,
  mintTo,
  transfer,
} from '@solana/spl-token';

/**
 * HarmonyAI Token Program
 * 
 * This program handles all token-related operations for the HarmonyAI platform.
 * It includes functions for minting HAI tokens, transferring tokens for survey
 * rewards, and checking token balances.
 */

export class HarmonyTokenProgram {
  private connection: Connection;
  private mintKeypair: Keypair | null = null;
  private mintAuthority: Keypair | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Initialize a new token mint for the HarmonyAI platform
   * @returns The public key of the created mint
   */
  async initializeTokenMint(): Promise<PublicKey> {
    try {
      // Generate a new mint keypair
      this.mintKeypair = Keypair.generate();
      this.mintAuthority = Keypair.generate();

      // Request airdrop for mint authority to pay for transactions
      const airdropSignature = await this.connection.requestAirdrop(
        this.mintAuthority.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await this.connection.confirmTransaction(airdropSignature);

      // Create the mint account
      const lamports = await this.connection.getMinimumBalanceForRentExemption(82);
      const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey: this.mintAuthority.publicKey,
        newAccountPubkey: this.mintKeypair.publicKey,
        lamports,
        space: 82,
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialize the mint
      const initMintIx = createInitializeMintInstruction(
        this.mintKeypair.publicKey,
        9, // 9 decimals
        this.mintAuthority.publicKey,
        null, // Freeze authority (null = no freeze authority)
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction()
        .add(createMintAccountIx)
        .add(initMintIx);

      await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.mintAuthority, this.mintKeypair]
      );

      return this.mintKeypair.publicKey;
    } catch (error) {
      console.error('Error initializing token mint:', error);
      throw new Error('Failed to initialize token mint');
    }
  }

  /**
   * Mint tokens to a specified recipient
   * @param recipientAddress The public key of the recipient
   * @param amount The amount of tokens to mint
   */
  async mintTokens(recipientAddress: PublicKey, amount: number): Promise<string> {
    if (!this.mintKeypair || !this.mintAuthority) {
      throw new Error('Token mint not initialized');
    }

    try {
      // Request airdrop for recipient to pay for token account creation
      const airdropSignature = await this.connection.requestAirdrop(
        recipientAddress,
        LAMPORTS_PER_SOL
      );
      await this.connection.confirmTransaction(airdropSignature);

      // Get or create the recipient's token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.mintAuthority,
        this.mintKeypair.publicKey,
        recipientAddress
      );

      // Mint tokens to the recipient
      await mintTo(
        this.connection,
        this.mintAuthority,
        this.mintKeypair.publicKey,
        recipientTokenAccount.address,
        this.mintAuthority,
        amount * Math.pow(10, 9) // Convert to smallest unit
      );

      return recipientTokenAccount.address.toBase58();
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw new Error('Failed to mint tokens');
    }
  }

  /**
   * Send tokens as a reward for completing a survey
   * @param fromAddress The public key of the sender
   * @param toAddress The public key of the recipient
   * @param amount The amount of tokens to send
   * @param senderKeypair The keypair of the sender for signing the transaction
   */
  async sendReward(
    fromAddress: PublicKey,
    toAddress: PublicKey,
    amount: number,
    senderKeypair: Keypair
  ): Promise<string> {
    if (!this.mintKeypair) {
      throw new Error('Token mint not initialized');
    }

    try {
      // Request airdrop for recipient to pay for token account creation
      const airdropSignature = await this.connection.requestAirdrop(
        toAddress,
        LAMPORTS_PER_SOL
      );
      await this.connection.confirmTransaction(airdropSignature);

      // Get the sender's token account
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        senderKeypair,
        this.mintKeypair.publicKey,
        fromAddress
      );

      // Get or create the recipient's token account
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        senderKeypair,
        this.mintKeypair.publicKey,
        toAddress
      );

      // Transfer tokens
      await transfer(
        this.connection,
        senderKeypair,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromAddress,
        amount * Math.pow(10, 9) // Convert to smallest unit
      );

      return toTokenAccount.address.toBase58();
    } catch (error) {
      console.error('Error sending reward:', error);
      throw new Error('Failed to send reward');
    }
  }

  /**
   * Get the token balance for a specified wallet address
   * @param walletAddress The public key of the wallet
   * @returns The token balance
   */
  async getTokenBalance(walletAddress: PublicKey): Promise<number> {
    if (!this.mintKeypair) {
      throw new Error('Token mint not initialized');
    }

    try {
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.mintAuthority!,
        this.mintKeypair.publicKey,
        walletAddress
      );

      const accountInfo = await getAccount(this.connection, tokenAccount.address);
      return Number(accountInfo.amount) / Math.pow(10, 9); // Convert from smallest unit
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }

  /**
   * Get the mint public key
   * @returns The public key of the token mint
   */
  getMintPublicKey(): PublicKey | null {
    return this.mintKeypair?.publicKey || null;
  }
} 