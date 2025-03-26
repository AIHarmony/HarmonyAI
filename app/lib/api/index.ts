import { 
  AuthResponse,
  LoginCredentials, 
  RegisterData, 
  Survey, 
  Participation, 
  Answer, 
  AIGeneratedQuestion,
  ApiResponse,
  User,
  Transaction
} from '../types';

// Mock survey data
const mockSurveys: Survey[] = [
  {
    id: '1',
    title: 'User Experience Survey',
    description: 'Help us improve our platform by sharing your experience',
    category: 'Product',
    reward: 50,
    creatorId: 'user1',
    questions: [
      {
        id: 'q1',
        surveyId: '1',
        text: 'How satisfied are you with our platform?',
        type: 'rating',
        required: true,
        order: 1
      },
      {
        id: 'q2',
        surveyId: '1',
        text: 'What features would you like to see in the future?',
        type: 'text',
        required: false,
        order: 2
      }
    ],
    participations: [],
    targetParticipants: 100,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Auth API
const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Mock implementation - in real app, this would call your backend
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, accept any email with a password
      if (credentials.email && credentials.password) {
        const mockUser: User = {
          id: 'user1',
          username: credentials.email.split('@')[0],
          email: credentials.email,
          reputation: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return {
          success: true,
          user: mockUser,
          token: 'mock-jwt-token'
        };
      }
      
      return {
        success: false,
        error: 'Invalid credentials'
      };
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred during login'
      };
    }
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Mock implementation
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (data.email && data.password && data.username) {
        const mockUser: User = {
          id: `user_${Date.now()}`,
          username: data.username,
          email: data.email,
          reputation: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return {
          success: true,
          user: mockUser,
          token: 'mock-jwt-token'
        };
      }
      
      return {
        success: false,
        error: 'Invalid registration data'
      };
    } catch (error) {
      return {
        success: false,
        error: 'An error occurred during registration'
      };
    }
  },
  
  logout: async (): Promise<ApiResponse> => {
    // Mock implementation
    return {
      success: true
    };
  },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    // Mock implementation
    const mockUser: User = {
      id: 'user1',
      username: 'demouser',
      email: 'demo@example.com',
      reputation: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockUser
    };
  }
};

// Survey API
const surveyApi = {
  getAllSurveys: async (): Promise<ApiResponse<Survey[]>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: mockSurveys
    };
  },
  
  getUserSurveys: async (): Promise<ApiResponse<Survey[]>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter surveys created by the current user
    const userSurveys = mockSurveys.filter(survey => survey.creatorId === 'user1');
    
    return {
      success: true,
      data: userSurveys
    };
  },
  
  getSurveyById: async (surveyId: string): Promise<ApiResponse<Survey>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const survey = mockSurveys.find(s => s.id === surveyId);
    
    if (survey) {
      return {
        success: true,
        data: survey
      };
    }
    
    return {
      success: false,
      error: 'Survey not found'
    };
  },
  
  createSurvey: async (surveyData: Partial<Survey>): Promise<ApiResponse<Survey>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const newSurvey: Survey = {
      id: `survey_${Date.now()}`,
      title: surveyData.title || 'Untitled Survey',
      description: surveyData.description || '',
      category: surveyData.category || 'Other',
      reward: surveyData.reward || 0,
      creatorId: surveyData.creatorId || 'user1',
      questions: surveyData.questions || [],
      participations: [],
      targetParticipants: surveyData.targetParticipants || 50,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock surveys
    mockSurveys.push(newSurvey);
    
    return {
      success: true,
      data: newSurvey
    };
  },
  
  submitSurvey: async (surveyId: string, answers: Answer[]): Promise<ApiResponse<Participation>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const survey = mockSurveys.find(s => s.id === surveyId);
    
    if (!survey) {
      return {
        success: false,
        error: 'Survey not found'
      };
    }
    
    const newParticipation: Participation = {
      id: `participation_${Date.now()}`,
      surveyId,
      userId: 'user1',
      answers,
      completedAt: new Date().toISOString(),
      reward: survey.reward
    };
    
    // Add participation to survey
    survey.participations.push(newParticipation);
    
    return {
      success: true,
      data: newParticipation
    };
  },
  
  generateQuestions: async (
    prompt: string, 
    category: string, 
    count: number
  ): Promise<ApiResponse<AIGeneratedQuestion[]>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock questions based on category
    const questions: AIGeneratedQuestion[] = [];
    
    const categoryQuestionTemplates: Record<string, AIGeneratedQuestion[]> = {
      'Product': [
        {
          text: 'How likely are you to recommend our product to a friend?',
          type: 'rating'
        },
        {
          text: 'Which features do you use most often?',
          type: 'multiple_choice',
          options: ['Feature A', 'Feature B', 'Feature C', 'Feature D']
        },
        {
          text: 'What improvements would you like to see in the next update?',
          type: 'text'
        }
      ],
      'Market Research': [
        {
          text: 'How often do you use products in this category?',
          type: 'single_choice',
          options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
        },
        {
          text: 'What factors influence your purchasing decisions the most?',
          type: 'multiple_choice',
          options: ['Price', 'Quality', 'Brand reputation', 'Recommendations', 'Features']
        },
        {
          text: 'Would you be willing to pay more for eco-friendly alternatives?',
          type: 'boolean'
        }
      ],
      'Customer Satisfaction': [
        {
          text: 'How satisfied are you with our customer service?',
          type: 'rating'
        },
        {
          text: 'Did you face any issues during your last interaction with us?',
          type: 'boolean'
        },
        {
          text: 'How could we improve your experience?',
          type: 'text'
        }
      ]
    };
    
    // Use category templates or generate generic questions
    const templates = categoryQuestionTemplates[category] || [
      {
        text: 'How would you rate your experience?',
        type: 'rating'
      },
      {
        text: 'What are your thoughts on this topic?',
        type: 'text'
      },
      {
        text: 'Which option do you prefer?',
        type: 'single_choice',
        options: ['Option A', 'Option B', 'Option C']
      }
    ];
    
    // Generate requested number of questions
    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      questions.push({
        ...template,
        text: `${template.text} ${prompt ? `(Regarding ${prompt})` : ''}`
      });
    }
    
    return {
      success: true,
      data: questions
    };
  },
  
  analyzeSurvey: async (surveyId: string): Promise<ApiResponse<string>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const survey = mockSurveys.find(s => s.id === surveyId);
    
    if (!survey) {
      return {
        success: false,
        error: 'Survey not found'
      };
    }
    
    if (survey.participations.length === 0) {
      return {
        success: false,
        error: 'No participations to analyze'
      };
    }
    
    // Generate mock analysis
    const analysisText = `
## Survey Analysis: ${survey.title}

### Overview
- Total participants: ${survey.participations.length}
- Target participants: ${survey.targetParticipants}
- Completion rate: ${Math.round((survey.participations.length / survey.targetParticipants) * 100)}%

### Key Insights
1. Participants showed strong engagement with questions related to product features
2. There is significant interest in future improvements to the user interface
3. Customer satisfaction rating averages 4.2 out of 5

### Recommendations
- Consider implementing the most requested features in the next product update
- Address the common pain points identified in the feedback
- Use the positive testimonials in marketing materials
    `;
    
    return {
      success: true,
      data: analysisText
    };
  }
};

// Wallet API
const walletApi = {
  linkWallet: async (walletAddress: string): Promise<ApiResponse> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true
    };
  },
  
  getWalletInfo: async (): Promise<ApiResponse<{ balance: number, transactions: Transaction[] }>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockTransactions: Transaction[] = [
      {
        id: 'tx1',
        fromAddress: 'system',
        toAddress: 'user_wallet',
        amount: 50,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        type: 'reward'
      },
      {
        id: 'tx2',
        fromAddress: 'system',
        toAddress: 'user_wallet',
        amount: 25,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        type: 'reward'
      }
    ];
    
    return {
      success: true,
      data: {
        balance: 75,
        transactions: mockTransactions
      }
    };
  },
  
  withdrawTokens: async (amount: number): Promise<ApiResponse<Transaction>> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (amount <= 0) {
      return {
        success: false,
        error: 'Invalid amount'
      };
    }
    
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      fromAddress: 'user_wallet',
      toAddress: 'external_wallet',
      amount,
      timestamp: new Date().toISOString(),
      status: 'completed',
      type: 'withdrawal'
    };
    
    return {
      success: true,
      data: transaction
    };
  }
};

export {
  authApi,
  surveyApi,
  walletApi
}; 