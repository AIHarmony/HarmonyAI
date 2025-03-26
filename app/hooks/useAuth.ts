'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { userService, User, UserRole } from '../services/UserService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  connectWallet: (walletAddress: string) => Promise<boolean>;
  isResearcher: boolean;
  isAdmin: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check for stored user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('harmonyUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('harmonyUser');
      }
    }
    setIsLoading(false);
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loggedInUser = await userService.login(email, password);
      setUser(loggedInUser);
      localStorage.setItem('harmonyUser', JSON.stringify(loggedInUser));
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('harmonyUser');
  };
  
  // Register function
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newUser = await userService.register({ username, email, password });
      setUser(newUser);
      localStorage.setItem('harmonyUser', JSON.stringify(newUser));
      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Connect wallet function
  const connectWallet = async (walletAddress: string): Promise<boolean> => {
    if (!user) {
      setError('Please login first');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await userService.connectWallet(user.id, walletAddress);
      setUser(updatedUser);
      localStorage.setItem('harmonyUser', JSON.stringify(updatedUser));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Role checks
  const isResearcher = user?.role === UserRole.RESEARCHER || user?.role === UserRole.ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        error, 
        login, 
        logout, 
        register, 
        connectWallet, 
        isResearcher, 
        isAdmin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
