/**
 * Generate a unique ID
 * @returns A unique string ID
 */
export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Format date for display
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format currency for display
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Truncate wallet address for display
 * @param address Full wallet address
 * @returns Truncated address string
 */
export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array or object)
 * @param value Value to check
 * @returns True if the value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Create a delay promise
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Local storage wrapper
 */
export const storage = {
  /**
   * Get a value from local storage
   * @param key Storage key
   * @param defaultValue Default value if not found
   * @returns Stored value or default
   */
  get: <T>(key: string, defaultValue: T | null = null): T | null => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage`, error);
      return defaultValue;
    }
  },
  
  /**
   * Set a value in local storage
   * @param key Storage key
   * @param value Value to store
   */
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage`, error);
    }
  },
  
  /**
   * Remove a value from local storage
   * @param key Storage key
   */
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage`, error);
    }
  },
  
  /**
   * Clear all values from local storage
   */
  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
}; 