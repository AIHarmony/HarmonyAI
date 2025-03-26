/**
 * Solana utility functions
 */

/**
 * Truncate address display, keep the first few and last few characters
 */
export const truncateAddress = (address: string, startChars = 4, endChars = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format SOL amount display
 */
export const formatSolAmount = (lamports: number): string => {
  const sol = lamports / 1_000_000_000; // 1 SOL = 10^9 lamports
  return sol.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 9,
  });
};

/**
 * Format HAI token amount display
 */
export const formatHaiAmount = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}; 