import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { 
  Program, 
  AnchorProvider, 
  web3, 
  BN,
  Idl 
} from '@project-serum/anchor';
import { Buffer } from 'buffer';

/**
 * HarmonyAI Survey Program
 * 
 * This program manages the lifecycle of surveys on the HarmonyAI platform.
 * It includes functionality for creating surveys, participating in surveys,
 * and distributing rewards to participants.
 */

// Program ID for the Survey Program
export const SURVEY_PROGRAM_ID = new PublicKey(
  'SuRVEYzQvHZ3bzDkZKkpY1z1BsCN3K8PdVV7ANs7W4t'
);

// Survey account data structure
export interface SurveyAccount {
  creator: PublicKey;
  title: string;
  description: string;
  rewardPerParticipant: BN;
  maxParticipants: number;
  currentParticipants: number;
  totalRewardPool: BN;
  isActive: boolean;
  endTimestamp: BN;
  category: number;
  responses: PublicKey[];
}

// Survey response account data structure
export interface SurveyResponseAccount {
  survey: PublicKey;
  participant: PublicKey;
  responseData: string;
  submittedAt: BN;
  rewardClaimed: boolean;
}

/**
 * Create a new survey
 * @param connection Solana connection
 * @param provider Anchor provider
 * @param program Anchor program
 * @param creator Survey creator keypair
 * @param surveyData Survey data
 * @param rewardPool Total reward pool amount
 * @returns Transaction signature
 */
export async function createSurvey(
  connection: Connection,
  provider: AnchorProvider,
  program: Program,
  creator: Keypair,
  surveyData: {
    title: string;
    description: string;
    rewardPerParticipant: number;
    maxParticipants: number;
    category: number;
    durationDays: number;
  },
  rewardPool: number
): Promise<string> {
  // Generate a new keypair for the survey account
  const surveyKeypair = Keypair.generate();
  
  // Calculate the end timestamp
  const now = Math.floor(Date.now() / 1000);
  const endTimestamp = now + (surveyData.durationDays * 24 * 60 * 60);
  
  // Prepare the instruction data
  const tx = await program.methods
    .createSurvey(
      surveyData.title,
      surveyData.description,
      new BN(surveyData.rewardPerParticipant),
      surveyData.maxParticipants,
      new BN(endTimestamp),
      surveyData.category
    )
    .accounts({
      survey: surveyKeypair.publicKey,
      creator: creator.publicKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([creator, surveyKeypair])
    .rpc();
  
  console.log(`Survey created with ID: ${surveyKeypair.publicKey.toString()}`);
  console.log(`Transaction signature: ${tx}`);
  
  return tx;
}

/**
 * Submit a response to a survey
 * @param connection Solana connection
 * @param provider Anchor provider
 * @param program Anchor program
 * @param participant Participant keypair
 * @param surveyPubkey Survey public key
 * @param responseData Survey response data (usually a JSON string)
 * @returns Transaction signature
 */
export async function submitSurveyResponse(
  connection: Connection,
  provider: AnchorProvider,
  program: Program,
  participant: Keypair,
  surveyPubkey: PublicKey,
  responseData: string
): Promise<string> {
  // Generate a new keypair for the response account
  const responseKeypair = Keypair.generate();
  
  // Prepare the instruction data
  const tx = await program.methods
    .submitResponse(responseData)
    .accounts({
      survey: surveyPubkey,
      response: responseKeypair.publicKey,
      participant: participant.publicKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([participant, responseKeypair])
    .rpc();
  
  console.log(`Survey response submitted for survey: ${surveyPubkey.toString()}`);
  console.log(`Response ID: ${responseKeypair.publicKey.toString()}`);
  console.log(`Transaction signature: ${tx}`);
  
  return tx;
}

/**
 * Claim reward for a survey response
 * @param connection Solana connection
 * @param provider Anchor provider
 * @param program Anchor program
 * @param participant Participant keypair
 * @param surveyPubkey Survey public key
 * @param responsePubkey Response public key
 * @returns Transaction signature
 */
export async function claimSurveyReward(
  connection: Connection,
  provider: AnchorProvider,
  program: Program,
  participant: Keypair,
  surveyPubkey: PublicKey,
  responsePubkey: PublicKey
): Promise<string> {
  // Prepare the instruction data
  const tx = await program.methods
    .claimReward()
    .accounts({
      survey: surveyPubkey,
      response: responsePubkey,
      participant: participant.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([participant])
    .rpc();
  
  console.log(`Reward claimed for response: ${responsePubkey.toString()}`);
  console.log(`Transaction signature: ${tx}`);
  
  return tx;
}

/**
 * Get a survey account data
 * @param connection Solana connection
 * @param provider Anchor provider
 * @param program Anchor program
 * @param surveyPubkey Survey public key
 * @returns Survey account data
 */
export async function getSurveyAccount(
  connection: Connection,
  provider: AnchorProvider,
  program: Program,
  surveyPubkey: PublicKey
): Promise<SurveyAccount> {
  const account = await program.account.survey.fetch(surveyPubkey);
  return account as unknown as SurveyAccount;
}

/**
 * Get a survey response account data
 * @param connection Solana connection
 * @param provider Anchor provider
 * @param program Anchor program
 * @param responsePubkey Response public key
 * @returns Survey response account data
 */
export async function getSurveyResponseAccount(
  connection: Connection,
  provider: AnchorProvider,
  program: Program,
  responsePubkey: PublicKey
): Promise<SurveyResponseAccount> {
  const account = await program.account.surveyResponse.fetch(responsePubkey);
  return account as unknown as SurveyResponseAccount;
} 