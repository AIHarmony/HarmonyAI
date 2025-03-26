/**
 * Core types for the HarmonyAI platform
 * This file contains TypeScript interfaces and types shared across the application
 */

// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  isResearcher: boolean;
  reputation: number;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  surveysCreated: number;
  surveysParticipated: number;
  totalEarned: number;
  totalSpent: number;
  reputationLevel: 'Beginner' | 'Intermediate' | 'Expert';
}

// Survey related types
export enum SurveyCategory {
  TECHNOLOGY = 'Technology',
  FINANCE = 'Finance',
  HEALTH = 'Health',
  EDUCATION = 'Education',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other'
}

export enum QuestionType {
  TEXT = 'text',
  MULTI_CHOICE = 'multi_choice',
  RATING = 'rating'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

export interface Answer {
  questionId: string;
  response: string | string[] | number;
}

export interface Participation {
  id: string;
  surveyId: string;
  userId: string;
  answers: Answer[];
  completedAt: Date;
  rewardPaid: boolean;
  transactionHash?: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  category: SurveyCategory;
  questions: Question[];
  creatorId: string;
  maxParticipants: number;
  participations: Participation[];
  rewardPerParticipant: number;
  estimatedTimeMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Wallet and blockchain related types
export interface TokenBalance {
  amount: number;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

export interface Transaction {
  id: string;
  hash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'reward' | 'payment' | 'transfer';
  surveyId?: string;
}

// AI and analytics related types
export interface AIAnalysisResult {
  summary: string;
  insights: string[];
  sentimentScore?: number;
  keywordFrequency?: Record<string, number>;
  recommendations?: string[];
  visualizationData?: any;
}

export interface AIGeneratedQuestion {
  text: string;
  type: QuestionType;
  options?: string[];
}

// Authentication types
export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  confirmPassword: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
