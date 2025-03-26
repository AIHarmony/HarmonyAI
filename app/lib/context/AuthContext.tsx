'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Authentication interface definitions
interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (credentials: AuthCredentials) => Promise<boolean>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Here you can check localStorage or send a request to the server to verify user status
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials: AuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate login API call
      // In a real application, this would be a call to a backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful response
      const userData: User = {
        id: '123456',
        username: 'user123',
        email: credentials.email
      };
      
      // Store user information
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (credentials: AuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate username exists
      if (!credentials.username) {
        setError('Username is required');
        return false;
      }
      
      // Simulate register API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful response
      const userData: User = {
        id: '123456',
        username: credentials.username,
        email: credentials.email
      };
      
      // Store user information
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } catch (err) {
      setError('Registration failed. Please try again later.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create custom hook for easier usage
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
