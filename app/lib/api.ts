/**
 * API client for HarmonyAI backend services
 * Handles authentication, requests, and response parsing
 */

import { ApiResponse, LoginCredentials, RegisterData, User, Survey, Participation } from './types';
import { API_BASE_URL, API_VERSION, AUTH_TOKEN_KEY } from './constants';

/**
 * Constructs the full API URL for a given endpoint
 */
const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/api/${API_VERSION}/${endpoint}`;
};

/**
 * Gets the authentication token from local storage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Sets the authentication token in local storage
 */
const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Removes the authentication token from local storage
 */
const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Generic request handler with authentication and error handling
 */
async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  requiresAuth: boolean = true
): Promise<ApiResponse<T>> {
  const url = getApiUrl(endpoint);
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (requiresAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'An error occurred',
        message: result.message || 'Request failed',
      };
    }
    
    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to the server',
    };
  }
}

// Auth endpoints
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await request<{ user: User; token: string }>('auth/login', 'POST', credentials, false);
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },
  
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await request<{ user: User; token: string }>('auth/register', 'POST', data, false);
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },
  
  /**
   * Get the current user profile
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return request<User>('auth/me', 'GET');
  },
  
  /**
   * Logout the current user
   */
  logout: (): void => {
    removeAuthToken();
  },
};

// Survey endpoints
export const surveyApi = {
  /**
   * Get all available surveys
   */
  getAllSurveys: async (): Promise<ApiResponse<Survey[]>> => {
    return request<Survey[]>('surveys', 'GET');
  },
  
  /**
   * Get surveys created by the current user
   */
  getUserSurveys: async (): Promise<ApiResponse<Survey[]>> => {
    return request<Survey[]>('surveys/user', 'GET');
  },
  
  /**
   * Get a single survey by ID
   */
  getSurveyById: async (id: string): Promise<ApiResponse<Survey>> => {
    return request<Survey>(`surveys/${id}`, 'GET');
  },
  
  /**
   * Create a new survey
   */
  createSurvey: async (surveyData: Partial<Survey>): Promise<ApiResponse<Survey>> => {
    return request<Survey>('surveys', 'POST', surveyData);
  },
  
  /**
   * Submit answers to a survey
   */
  submitSurvey: async (surveyId: string, answers: any[]): Promise<ApiResponse<Participation>> => {
    return request<Participation>(`surveys/${surveyId}/submit`, 'POST', { answers });
  },
  
  /**
   * Generate AI analysis for a survey
   */
  analyzeSurvey: async (surveyId: string): Promise<ApiResponse<any>> => {
    return request<any>(`surveys/${surveyId}/analyze`, 'GET');
  },
  
  /**
   * Generate survey questions using AI
   */
  generateQuestions: async (prompt: string, category: string, count: number): Promise<ApiResponse<any>> => {
    return request<any>('surveys/generate-questions', 'POST', { prompt, category, count });
  },
};

// User endpoints
export const userApi = {
  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    return request<User>('users/profile', 'PUT', userData);
  },
  
  /**
   * Link wallet address to user
   */
  linkWallet: async (walletAddress: string): Promise<ApiResponse<User>> => {
    return request<User>('users/link-wallet', 'POST', { walletAddress });
  },
  
  /**
   * Get user stats
   */
  getUserStats: async (): Promise<ApiResponse<any>> => {
    return request<any>('users/stats', 'GET');
  },
};

// Wallet and transaction endpoints
export const walletApi = {
  /**
   * Get user's token balance
   */
  getBalance: async (): Promise<ApiResponse<{ balance: number }>> => {
    return request<{ balance: number }>('wallet/balance', 'GET');
  },
  
  /**
   * Get transaction history
   */
  getTransactions: async (): Promise<ApiResponse<any[]>> => {
    return request<any[]>('wallet/transactions', 'GET');
  },
  
  /**
   * Transfer tokens to another user
   */
  transferTokens: async (recipient: string, amount: number): Promise<ApiResponse<any>> => {
    return request<any>('wallet/transfer', 'POST', { recipient, amount });
  },
};

export default {
  auth: authApi,
  surveys: surveyApi,
  users: userApi,
  wallet: walletApi,
};
