'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatHaiAmount } from '@/utils/solana';

const SurveyCompletePage: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reward = searchParams.get('reward') || '0';
  
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // 模拟区块链交易处理
    setTimeout(() => {
      // 生成模拟的交易哈希
      const mockTxHash = 'HAI' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setTransactionHash(mockTxHash);
      setLoading(false);
    }, 2000);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto card text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-solana rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">调研已完成!</h1>
        <p className="text-gray-300 mb-8">
          非常感谢您的参与和宝贵反馈。您的意见将帮助我们改进产品和服务。
        </p>
        
        <div className="bg-dark-lighter rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">奖励详情</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3">处理中...</span>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-solana mb-2">
                {formatHaiAmount(Number(reward))} HAI
              </div>
              <p className="text-xs text-gray-400 mb-4">已发送到您的钱包</p>
              
              <div className="text-xs text-gray-400 truncate">
                交易ID: <a href={`https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{transactionHash}</a>
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link href="/surveys" className="btn-primary">
            探索更多调研
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            查看我的奖励
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyCompletePage; 