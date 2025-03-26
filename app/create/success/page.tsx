'use client';

import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

const CreateSuccessPage: FC = () => {
  const [transactionHash, setTransactionHash] = useState<string>('');
  
  useEffect(() => {
    // 生成模拟的交易哈希
    const mockTxHash = 'HAI' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setTransactionHash(mockTxHash);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto card text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-solana rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">调研已成功创建!</h1>
        <p className="text-gray-300 mb-6">
          您的调研已成功发布到Solana区块链，现在可以开始接收用户的反馈。
        </p>
        
        <div className="bg-dark-lighter rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">调研详情</h2>
          <div className="flex justify-between items-center mb-2">
            <span>状态:</span>
            <span className="text-solana font-semibold">已发布</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span>交易ID:</span>
            <a
              href={`https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm truncate ml-2 max-w-[200px]"
            >
              {transactionHash}
            </a>
          </div>
          <div className="bg-dark p-4 rounded-lg text-center">
            <p className="mb-2">您可以使用以下链接分享此调研</p>
            <p className="text-primary bg-dark-lighter p-2 rounded text-sm truncate">
              https://harmonyai.io/surveys/latest
            </p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link href="/dashboard" className="btn-primary">
            查看我的调研
          </Link>
          <Link href="/create" className="btn-secondary">
            创建新调研
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreateSuccessPage; 