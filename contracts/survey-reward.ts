import {
  Keypair,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// 模拟的 HAI 代币地址
const HAI_TOKEN_MINT = new PublicKey('HAiTokenMintPlaceholderXXXXXXXXXXXXXXXXX');

/**
 * 发放调研奖励给参与者
 * @param connection Solana 连接对象
 * @param payerKeypair 支付者钱包的密钥对
 * @param participantAddress 参与者钱包地址
 * @param amount 奖励金额（以最小单位表示）
 * @returns 交易哈希
 */
export async function sendSurveyReward(
  connection: Connection,
  payerKeypair: Keypair,
  participantAddress: PublicKey,
  amount: number
): Promise<string> {
  try {
    // 初始化 HAI 代币对象
    const haiToken = new Token(
      connection,
      HAI_TOKEN_MINT,
      TOKEN_PROGRAM_ID,
      payerKeypair
    );

    // 获取发送者的代币账户
    const payerTokenAccount = await haiToken.getOrCreateAssociatedAccountInfo(
      payerKeypair.publicKey
    );

    // 获取或创建接收者的代币账户
    const receiverTokenAccount = await haiToken.getOrCreateAssociatedAccountInfo(
      participantAddress
    );

    // 创建转账指令
    const transferInstruction = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      payerTokenAccount.address,
      receiverTokenAccount.address,
      payerKeypair.publicKey,
      [],
      amount
    );

    // 创建交易并添加指令
    const transaction = new Transaction().add(transferInstruction);
    
    // 设置最近的区块哈希
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    
    // 设置交易费用支付者
    transaction.feePayer = payerKeypair.publicKey;
    
    // 签名并发送交易
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payerKeypair]
    );
    
    console.log(`调研奖励转账成功: ${signature}`);
    return signature;
  } catch (error) {
    console.error('调研奖励转账失败:', error);
    throw error;
  }
}

/**
 * 记录调研完成和奖励发放事件
 * @param connection Solana 连接对象
 * @param payerKeypair 支付者钱包的密钥对
 * @param surveyId 调研ID
 * @param participantAddress 参与者钱包地址
 * @param rewardAmount 奖励金额
 * @param surveyData 调研数据哈希
 * @returns 交易哈希
 */
export async function recordSurveyCompletion(
  connection: Connection,
  payerKeypair: Keypair,
  surveyId: string,
  participantAddress: PublicKey,
  rewardAmount: number,
  surveyData: string
): Promise<string> {
  try {
    // 创建一个自定义的指令数据
    const dataBuffer = Buffer.from(
      JSON.stringify({
        action: 'survey_completion',
        surveyId,
        participant: participantAddress.toBase58(),
        reward: rewardAmount,
        data: surveyData,
        timestamp: new Date().getTime(),
      })
    );

    // 创建一个存储指令
    // 注意：这里应该是实际程序的公钥，这里使用System Program作为示例
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: participantAddress, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: SystemProgram.programId,
      data: dataBuffer,
    });

    // 创建交易并添加指令
    const transaction = new Transaction().add(instruction);
    
    // 设置最近的区块哈希
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    
    // 设置交易费用支付者
    transaction.feePayer = payerKeypair.publicKey;
    
    // 签名并发送交易
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payerKeypair]
    );
    
    console.log(`调研完成记录成功: ${signature}`);
    return signature;
  } catch (error) {
    console.error('调研完成记录失败:', error);
    throw error;
  }
}

/**
 * 创建新调研
 * @param connection Solana 连接对象
 * @param creatorKeypair 创建者钱包的密钥对
 * @param surveyId 调研ID
 * @param surveyMetadata 调研元数据
 * @param rewardPerParticipant 每位参与者的奖励金额
 * @param maxParticipants 最大参与人数
 * @returns 交易哈希
 */
export async function createSurvey(
  connection: Connection,
  creatorKeypair: Keypair,
  surveyId: string,
  surveyMetadata: string,
  rewardPerParticipant: number,
  maxParticipants: number
): Promise<string> {
  try {
    // 创建一个自定义的指令数据
    const dataBuffer = Buffer.from(
      JSON.stringify({
        action: 'create_survey',
        surveyId,
        creator: creatorKeypair.publicKey.toBase58(),
        metadata: surveyMetadata,
        rewardPerParticipant,
        maxParticipants,
        totalBudget: rewardPerParticipant * maxParticipants,
        timestamp: new Date().getTime(),
      })
    );

    // 创建一个存储指令
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: creatorKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: SystemProgram.programId,
      data: dataBuffer,
    });

    // 创建交易并添加指令
    const transaction = new Transaction().add(instruction);
    
    // 设置最近的区块哈希
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    
    // 设置交易费用支付者
    transaction.feePayer = creatorKeypair.publicKey;
    
    // 签名并发送交易
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [creatorKeypair]
    );
    
    console.log(`调研创建成功: ${signature}`);
    return signature;
  } catch (error) {
    console.error('调研创建失败:', error);
    throw error;
  }
}
