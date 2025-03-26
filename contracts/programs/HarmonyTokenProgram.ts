import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToInstruction,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  getMint,
  getAccount,
} from '@solana/spl-token';

/**
 * HarmonyAI Token Program
 * 
 * This program handles all token-related operations for the HarmonyAI platform.
 * It includes functions for minting HAI tokens, transferring tokens for survey
 * rewards, and checking token balances.
 */

// Harmony Token mint authority
let mintAuthority: Keypair;

// HAI token mint
let tokenMint: PublicKey;

/**
 * Initialize the HAI token mint
 * @param connection Solana connection
 * @param payer Fee payer for the transaction
 * @returns Token mint public key
 */
export async function initializeTokenMint(
  connection: Connection,
  payer: Keypair
): Promise<PublicKey> {
  // Generate a new mint keypair
  const tokenMintKeypair = Keypair.generate();
  tokenMint = tokenMintKeypair.publicKey;
  
  // Generate mint authority
  mintAuthority = Keypair.generate();
  
  // Minimum balance for rent exemption
  const lamports = await connection.getMinimumBalanceForRentExemption(82);
  
  // Create transaction for token mint account
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: tokenMint,
      space: 82,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    // Initialize mint instruction
    createInitializeMintInstruction(
      tokenMint,
      6, // 6 decimals
      mintAuthority.publicKey,
      null, // Freeze authority (null = no freeze authority)
      TOKEN_PROGRAM_ID
    )
  );
  
  // Send and confirm transaction
  await sendAndConfirmTransaction(connection, transaction, [
    payer,
    tokenMintKeypair,
  ]);
  
  console.log(`Token Mint created: ${tokenMint.toString()}`);
  
  return tokenMint;
}

/**
 * Mint HAI tokens to a recipient
 * @param connection Solana connection
 * @param payer Fee payer for the transaction
 * @param recipient Recipient wallet address
 * @param amount Amount of tokens to mint (in base units)
 * @returns Transaction signature
 */
export async function mintTokens(
  connection: Connection,
  payer: Keypair,
  recipient: PublicKey,
  amount: number
): Promise<string> {
  // Get or create an associated token account for the recipient
  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    tokenMint,
    recipient
  );
  
  // Create mint instruction
  const transaction = new Transaction().add(
    createMintToInstruction(
      tokenMint,
      recipientTokenAccount.address,
      mintAuthority.publicKey,
      amount * Math.pow(10, 6) // Convert to base units with 6 decimals
    )
  );
  
  // Send and confirm transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintAuthority]
  );
  
  console.log(`Minted ${amount} tokens to ${recipient.toString()}`);
  console.log(`Transaction signature: ${signature}`);
  
  return signature;
}

/**
 * Send HAI tokens as survey reward
 * @param connection Solana connection
 * @param sender Sender keypair
 * @param recipient Recipient wallet address
 * @param amount Amount of tokens to send (in base units)
 * @returns Transaction signature
 */
export async function sendReward(
  connection: Connection,
  sender: Keypair,
  recipient: PublicKey,
  amount: number
): Promise<string> {
  // Get or create token accounts
  const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMint,
    sender.publicKey
  );
  
  const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMint,
    recipient
  );
  
  // Create transfer instruction
  const transaction = new Transaction().add(
    createTransferInstruction(
      senderTokenAccount.address,
      recipientTokenAccount.address,
      sender.publicKey,
      amount * Math.pow(10, 6) // Convert to base units with 6 decimals
    )
  );
  
  // Send and confirm transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [sender]
  );
  
  console.log(`Sent ${amount} tokens to ${recipient.toString()}`);
  console.log(`Transaction signature: ${signature}`);
  
  return signature;
}

/**
 * Get HAI token balance
 * @param connection Solana connection
 * @param owner Wallet address to check
 * @returns Token balance
 */
export async function getTokenBalance(
  connection: Connection,
  owner: PublicKey
): Promise<number> {
  try {
    // Find the associated token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Temporary keypair just for query
      tokenMint,
      owner,
      true // Allow owner off curve
    );
    
    // Get account info
    const accountInfo = await getAccount(connection, tokenAccount.address);
    
    // Convert from base units to token amount
    const balance = Number(accountInfo.amount) / Math.pow(10, 6);
    
    return balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
} 