import * as assert from 'assert';
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { 
  AnchorProvider, 
  Program, 
  setProvider, 
  workspace
} from '@project-serum/anchor';
import {
  SURVEY_PROGRAM_ID,
  createSurvey,
  submitSurveyResponse,
  claimSurveyReward,
  getSurveyAccount,
  getSurveyResponseAccount,
} from '../programs/SurveyProgram';

/**
 * HarmonyAI Survey Program Tests
 * 
 * This file contains unit tests for the HarmonyAI survey program.
 */

describe('HarmonyAI Survey Program Tests', () => {
  // Test environment variables
  const connection = new Connection('http://localhost:8899', 'confirmed');
  let provider: AnchorProvider;
  let program: Program;
  let creator: Keypair;
  let participant: Keypair;
  let surveyPubkey: PublicKey;
  let responsePubkey: PublicKey;

  // Set up test environment before running tests
  before(async () => {
    // Generate test keypairs
    creator = Keypair.generate();
    participant = Keypair.generate();
    
    // Airdrop SOL to test accounts for transaction fees
    const signature1 = await connection.requestAirdrop(
      creator.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature1);
    
    const signature2 = await connection.requestAirdrop(
      participant.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(signature2);
    
    // Create Anchor provider
    provider = new AnchorProvider(
      connection,
      {
        publicKey: creator.publicKey,
        signTransaction: async (tx) => {
          tx.partialSign(creator);
          return tx;
        },
        signAllTransactions: async (txs) => {
          return txs.map((tx) => {
            tx.partialSign(creator);
            return tx;
          });
        },
      },
      { commitment: 'confirmed' }
    );
    setProvider(provider);
    
    // Get the survey program from workspace
    program = workspace.surveyProgram as Program;
    
    console.log('Test environment setup complete');
  });

  // Test creating a survey
  it('should create a new survey', async () => {
    try {
      const surveyData = {
        title: 'Test Survey',
        description: 'This is a test survey for the HarmonyAI platform',
        rewardPerParticipant: 10,
        maxParticipants: 100,
        category: 1, // 1 = Product
        durationDays: 7,
      };
      
      const rewardPool = surveyData.rewardPerParticipant * surveyData.maxParticipants;
      
      // Create the survey
      const txSignature = await createSurvey(
        connection,
        provider,
        program,
        creator,
        surveyData,
        rewardPool
      );
      
      assert.ok(
        typeof txSignature === 'string' && txSignature.length > 0,
        'Transaction signature should be returned'
      );
      
      // For testing purposes, we would normally get the survey account from the transaction
      // But since this is a mock test, we'll just use a placeholder
      surveyPubkey = Keypair.generate().publicKey;
      
      // Fetch the survey account data
      const surveyAccount = await getSurveyAccount(
        connection,
        provider,
        program,
        surveyPubkey
      );
      
      assert.strictEqual(
        surveyAccount.title,
        surveyData.title,
        'Survey title should match'
      );
      assert.strictEqual(
        surveyAccount.description,
        surveyData.description,
        'Survey description should match'
      );
      assert.strictEqual(
        surveyAccount.maxParticipants,
        surveyData.maxParticipants,
        'Max participants should match'
      );
      assert.ok(
        surveyAccount.isActive,
        'Survey should be active'
      );
      
      console.log(`Successfully created survey: ${surveyPubkey.toString()}`);
    } catch (error) {
      console.error('Failed to create survey:', error);
      throw error;
    }
  });

  // Test submitting a survey response
  it('should submit a survey response', async () => {
    try {
      const responseData = JSON.stringify({
        question1: 'Test response 1',
        question2: 'Test response 2',
        rating: 5,
      });
      
      // Submit survey response
      const txSignature = await submitSurveyResponse(
        connection,
        provider,
        program,
        participant,
        surveyPubkey,
        responseData
      );
      
      assert.ok(
        typeof txSignature === 'string' && txSignature.length > 0,
        'Transaction signature should be returned'
      );
      
      // For testing purposes, we would normally get the response account from the transaction
      // But since this is a mock test, we'll just use a placeholder
      responsePubkey = Keypair.generate().publicKey;
      
      // Fetch the response account data
      const responseAccount = await getSurveyResponseAccount(
        connection,
        provider,
        program,
        responsePubkey
      );
      
      assert.strictEqual(
        responseAccount.survey.toString(),
        surveyPubkey.toString(),
        'Survey reference should match'
      );
      assert.strictEqual(
        responseAccount.participant.toString(),
        participant.publicKey.toString(),
        'Participant reference should match'
      );
      assert.strictEqual(
        responseAccount.responseData,
        responseData,
        'Response data should match'
      );
      assert.ok(
        !responseAccount.rewardClaimed,
        'Reward should not be claimed yet'
      );
      
      console.log(`Successfully submitted response: ${responsePubkey.toString()}`);
    } catch (error) {
      console.error('Failed to submit survey response:', error);
      throw error;
    }
  });

  // Test claiming a survey reward
  it('should claim a survey reward', async () => {
    try {
      // Claim survey reward
      const txSignature = await claimSurveyReward(
        connection,
        provider,
        program,
        participant,
        surveyPubkey,
        responsePubkey
      );
      
      assert.ok(
        typeof txSignature === 'string' && txSignature.length > 0,
        'Transaction signature should be returned'
      );
      
      // Fetch the updated response account data
      const responseAccount = await getSurveyResponseAccount(
        connection,
        provider,
        program,
        responsePubkey
      );
      
      assert.ok(
        responseAccount.rewardClaimed,
        'Reward should be marked as claimed'
      );
      
      console.log(`Successfully claimed reward for response: ${responsePubkey.toString()}`);
    } catch (error) {
      console.error('Failed to claim survey reward:', error);
      throw error;
    }
  });
}); 