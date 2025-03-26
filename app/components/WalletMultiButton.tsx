'use client';

import { FC, useCallback, useMemo } from 'react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton as BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { truncateAddress } from '@/utils/solana';

const WalletMultiButton: FC = () => {
  const { publicKey, wallet, disconnect } = useWallet();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const content = useMemo(() => {
    if (publicKey) {
      return truncateAddress(base58 || '');
    }
    if (wallet) {
      return wallet.adapter.name;
    }
    return '连接钱包';
  }, [publicKey, wallet, base58]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
  }, [disconnect]);

  return (
    <BaseWalletMultiButton
      className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
    />
  );
};

export default WalletMultiButton; 