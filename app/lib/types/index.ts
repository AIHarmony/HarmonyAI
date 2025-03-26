// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress?: string;
  reputation: number;
  createdAt: string;
  updatedAt: string;
  isAdmin?: boolean;
  isResearcher?: boolean;
}

// Auth related types
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Survey related types
export type SurveyCategory = 'Product' | 'Market Research' | 'Customer Satisfaction' | 'UX/UI' | 'Other';

export type SurveyStatus = 'draft' | 'active' | 'completed' | 'analyzed';

export type QuestionType = 'multiple_choice' | 'single_choice' | 'text' | 'rating' | 'boolean';

export interface Survey {
  id: string;
  title: string;
  description: string;
  category: SurveyCategory;
  reward: number;
  creatorId: string;
  creator?: User;
  questions: Question[];
  participations: Participation[];
  targetParticipants: number;
  status: SurveyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  surveyId: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  order: number;
}

export interface Answer {
  questionId: string;
  value: string | number | boolean;
}

export interface Participation {
  id: string;
  surveyId: string;
  userId: string;
  user?: User;
  answers: Answer[];
  completedAt: string;
  reward?: number;
}

export interface AIGeneratedQuestion {
  text: string;
  type: QuestionType;
  options?: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Wallet related types
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type TransactionType = 'reward' | 'withdrawal' | 'deposit';

export interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  timestamp: string;
  status: TransactionStatus;
  type: TransactionType;
}

export interface WalletInfo {
  address: string;
  balance: number;
  transactions: Transaction[];
}

// Constants
export const AUTH_TOKEN_KEY = 'harmony_auth_token';
export const AUTH_USER_KEY = 'harmony_user';
export const WALLET_ADDRESS_KEY = 'harmony_wallet_address';

// Form validation constants
export const MIN_PASSWORD_LENGTH = 8;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;
export const MIN_SURVEY_TITLE_LENGTH = 5;
export const MAX_SURVEY_TITLE_LENGTH = 100;
export const MIN_SURVEY_DESCRIPTION_LENGTH = 20;
export const MAX_SURVEY_DESCRIPTION_LENGTH = 500;
export const MIN_QUESTION_LENGTH = 5;
export const MAX_QUESTION_LENGTH = 200; 