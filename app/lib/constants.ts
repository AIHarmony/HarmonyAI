// Authentication
export const AUTH_TOKEN_KEY = 'harmony_auth_token';
export const AUTH_USER_KEY = 'harmony_user';
export const WALLET_ADDRESS_KEY = 'harmony_wallet_address';

// Form validation
export const MIN_PASSWORD_LENGTH = 8;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;
export const MIN_SURVEY_TITLE_LENGTH = 5;
export const MAX_SURVEY_TITLE_LENGTH = 100;
export const MIN_SURVEY_DESCRIPTION_LENGTH = 20;
export const MAX_SURVEY_DESCRIPTION_LENGTH = 500;
export const MIN_QUESTION_LENGTH = 5;
export const MAX_QUESTION_LENGTH = 200;

// Survey categories
export const SURVEY_CATEGORIES = [
  'Product',
  'Market Research',
  'Customer Satisfaction',
  'UX/UI',
  'Other'
] as const;

// Question types
export const QUESTION_TYPES = [
  'multiple_choice',
  'single_choice',
  'text',
  'rating',
  'boolean'
] as const;

// Survey statuses
export const SURVEY_STATUSES = [
  'draft',
  'active',
  'completed',
  'analyzed'
] as const;

// Transaction types
export const TRANSACTION_TYPES = [
  'reward',
  'withdrawal',
  'deposit'
] as const;

// Transaction statuses
export const TRANSACTION_STATUSES = [
  'pending',
  'completed',
  'failed'
] as const;

// API endpoints
export const API_BASE_URL = '/api';
export const API_ROUTES = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    CURRENT_USER: `${API_BASE_URL}/auth/me`,
  },
  SURVEYS: {
    ALL: `${API_BASE_URL}/surveys`,
    BY_ID: (id: string) => `${API_BASE_URL}/surveys/${id}`,
    USER: `${API_BASE_URL}/surveys/user`,
    CREATE: `${API_BASE_URL}/surveys`,
    SUBMIT: (id: string) => `${API_BASE_URL}/surveys/${id}/submit`,
    ANALYZE: (id: string) => `${API_BASE_URL}/surveys/${id}/analyze`,
    GENERATE_QUESTIONS: `${API_BASE_URL}/surveys/generate-questions`,
  },
  WALLET: {
    INFO: `${API_BASE_URL}/wallet`,
    LINK: `${API_BASE_URL}/wallet/link`,
    WITHDRAW: `${API_BASE_URL}/wallet/withdraw`,
  },
};
