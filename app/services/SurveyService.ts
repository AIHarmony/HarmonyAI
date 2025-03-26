import { generateSurveyQuestions } from '../utils/ai';
import { generateMockTransactionHash, mockSendReward } from '../utils/blockchain';

// Survey categories
export enum SurveyCategory {
  TECHNOLOGY = 'Technology',
  FINANCE = 'Finance',
  HEALTH = 'Health',
  EDUCATION = 'Education',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other'
}

// Survey question types
export enum QuestionType {
  TEXT = 'text',
  MULTI_CHOICE = 'multiChoice',
  RATING = 'rating'
}

// Survey question interface
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

// Survey answer interface
export interface Answer {
  questionId: string;
  response: string | string[] | number;
}

// Survey participation record
export interface Participation {
  userId: string;
  surveyId: string;
  completedAt: Date;
  answers: Answer[];
  rewardAmount: number;
  transactionId: string;
}

// Survey details
export interface Survey {
  id: string;
  title: string;
  description: string;
  category: SurveyCategory;
  creatorId: string;
  createdAt: Date;
  rewardPerParticipant: number;
  estimatedTimeMinutes: number;
  questions: Question[];
  participations: Participation[];
  maxParticipants: number;
  isActive: boolean;
  transactionId?: string;
}

// Mock database
class MockDatabase {
  private surveys: Map<string, Survey> = new Map();
  private participations: Map<string, Participation[]> = new Map();
  
  // Save survey
  saveSurvey(survey: Survey): void {
    this.surveys.set(survey.id, survey);
  }
  
  // Get survey
  getSurvey(id: string): Survey | undefined {
    return this.surveys.get(id);
  }
  
  // Get all surveys
  getAllSurveys(): Survey[] {
    return Array.from(this.surveys.values());
  }
  
  // Get surveys created by user
  getUserCreatedSurveys(userId: string): Survey[] {
    return this.getAllSurveys().filter(survey => survey.creatorId === userId);
  }
  
  // Get surveys participated by user
  getUserParticipatedSurveys(userId: string): Participation[] {
    return this.participations.get(userId) || [];
  }
  
  // Save participation record
  saveParticipation(participation: Participation): void {
    const userParticipations = this.participations.get(participation.userId) || [];
    userParticipations.push(participation);
    this.participations.set(participation.userId, userParticipations);
    
    // Update survey participation records
    const survey = this.getSurvey(participation.surveyId);
    if (survey) {
      survey.participations.push(participation);
      this.saveSurvey(survey);
    }
  }
}

// Survey service class
export class SurveyService {
  private db = new MockDatabase();
  
  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  // Create new survey
  async createSurvey(data: {
    title: string;
    description: string;
    category: SurveyCategory;
    creatorId: string;
    rewardPerParticipant: number;
    estimatedTimeMinutes: number;
    questions?: Question[];
    maxParticipants: number;
  }): Promise<Survey> {
    // If no questions provided, use AI to generate questions
    let questions = data.questions || [];
    if (questions.length === 0) {
      questions = await generateSurveyQuestions(data.title);
    }
    
    // Ensure each question has an ID
    questions = questions.map(q => ({
      ...q,
      id: q.id || this.generateId(),
    }));
    
    // Create new survey
    const survey: Survey = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      category: data.category,
      creatorId: data.creatorId,
      createdAt: new Date(),
      rewardPerParticipant: data.rewardPerParticipant,
      estimatedTimeMinutes: data.estimatedTimeMinutes,
      questions: questions,
      participations: [],
      maxParticipants: data.maxParticipants,
      isActive: true,
      transactionId: generateMockTransactionHash(),
    };
    
    // Save to database
    this.db.saveSurvey(survey);
    
    return survey;
  }
  
  // Get survey details
  getSurvey(id: string): Survey | undefined {
    return this.db.getSurvey(id);
  }
  
  // Get all surveys
  getAllSurveys(): Survey[] {
    return this.db.getAllSurveys();
  }
  
  // Get active surveys
  getActiveSurveys(): Survey[] {
    return this.db.getAllSurveys().filter(survey => survey.isActive);
  }
  
  // Get surveys created by user
  getUserCreatedSurveys(userId: string): Survey[] {
    return this.db.getUserCreatedSurveys(userId);
  }
  
  // Get surveys participated by user
  getUserParticipatedSurveys(userId: string): Participation[] {
    return this.db.getUserParticipatedSurveys(userId);
  }
  
  // Submit survey answers
  async submitSurveyAnswers(data: {
    userId: string;
    surveyId: string;
    answers: Answer[];
  }): Promise<Participation> {
    const survey = this.getSurvey(data.surveyId);
    
    if (!survey) {
      throw new Error('Survey does not exist');
    }
    
    if (!survey.isActive) {
      throw new Error('Survey is closed');
    }
    
    if (survey.participations.length >= survey.maxParticipants) {
      throw new Error('Maximum number of participants reached');
    }
    
    // Verify that all questions have been answered
    const answeredQuestionIds = data.answers.map(a => a.questionId);
    const allQuestionIds = survey.questions.map(q => q.id);
    
    if (!allQuestionIds.every(id => answeredQuestionIds.includes(id))) {
      throw new Error('Please answer all questions');
    }
    
    // Create participation record
    const participation: Participation = {
      userId: data.userId,
      surveyId: data.surveyId,
      completedAt: new Date(),
      answers: data.answers,
      rewardAmount: survey.rewardPerParticipant,
      transactionId: '', // Leave empty, will fill after sending reward
    };
    
    // Send reward
    try {
      const tx = await mockSendReward(data.userId, survey.rewardPerParticipant);
      participation.transactionId = tx;
    } catch (error) {
      console.error('Failed to send reward:', error);
      throw new Error('Failed to send reward, please try again later');
    }
    
    // Save participation record
    this.db.saveParticipation(participation);
    
    // If the number of participants reaches the maximum, automatically close the survey
    if (survey.participations.length >= survey.maxParticipants) {
      survey.isActive = false;
      this.db.saveSurvey(survey);
    }
    
    return participation;
  }
  
  // Close survey
  closeSurvey(surveyId: string, userId: string): Survey {
    const survey = this.getSurvey(surveyId);
    
    if (!survey) {
      throw new Error('Survey does not exist');
    }
    
    if (survey.creatorId !== userId) {
      throw new Error('Only the survey creator can close the survey');
    }
    
    survey.isActive = false;
    this.db.saveSurvey(survey);
    
    return survey;
  }
  
  // Delete survey
  deleteSurvey(surveyId: string, userId: string): void {
    const survey = this.getSurvey(surveyId);
    
    if (!survey) {
      throw new Error('Survey does not exist');
    }
    
    if (survey.creatorId !== userId) {
      throw new Error('Only the survey creator can delete the survey');
    }
    
    // In a real application, this might not be a real delete, but rather a flag as deleted
    survey.isActive = false;
    this.db.saveSurvey(survey);
  }
}

// Create singleton instance
export const surveyService = new SurveyService();
