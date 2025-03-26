'use client';

import React, { createContext, useState, useContext } from 'react';
import { Survey, Question, Answer, Participation, AIGeneratedQuestion } from '../types';
import { surveyApi } from '../api';
import { useAuth } from './AuthContext';
import { generateId } from '../utils';

interface SurveyContextType {
  surveys: Survey[];
  currentSurvey: Survey | null;
  loading: boolean;
  error: string | null;
  loadSurveys: () => Promise<void>;
  loadUserSurveys: () => Promise<void>;
  loadSurveyDetails: (surveyId: string) => Promise<void>;
  createSurvey: (surveyData: Partial<Survey>) => Promise<Survey | null>;
  submitSurvey: (surveyId: string, answers: Answer[]) => Promise<Participation | null>;
  generateQuestions: (prompt: string, category: string, count: number) => Promise<AIGeneratedQuestion[]>;
  analyzeSurvey: (surveyId: string) => Promise<string>;
}

const SurveyContext = createContext<SurveyContextType>({
  surveys: [],
  currentSurvey: null,
  loading: false,
  error: null,
  loadSurveys: async () => {},
  loadUserSurveys: async () => {},
  loadSurveyDetails: async () => {},
  createSurvey: async () => null,
  submitSurvey: async () => null,
  generateQuestions: async () => [],
  analyzeSurvey: async () => '',
});

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadSurveys = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await surveyApi.getAllSurveys();
      
      if (response.success && response.data) {
        setSurveys(response.data);
      } else {
        setError(response.error || 'Failed to load surveys');
      }
    } catch (err: any) {
      console.error('Error loading surveys:', err);
      setError(err.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };
  
  const loadUserSurveys = async (): Promise<void> => {
    if (!user) {
      setError('User is not logged in');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await surveyApi.getUserSurveys();
      
      if (response.success && response.data) {
        setSurveys(response.data);
      } else {
        setError(response.error || 'Failed to load your surveys');
      }
    } catch (err: any) {
      console.error('Error loading user surveys:', err);
      setError(err.message || 'Failed to load your surveys');
    } finally {
      setLoading(false);
    }
  };
  
  const loadSurveyDetails = async (surveyId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await surveyApi.getSurveyById(surveyId);
      
      if (response.success && response.data) {
        setCurrentSurvey(response.data);
      } else {
        setError(response.error || 'Failed to load survey details');
      }
    } catch (err: any) {
      console.error('Error loading survey details:', err);
      setError(err.message || 'Failed to load survey details');
    } finally {
      setLoading(false);
    }
  };
  
  const createSurvey = async (surveyData: Partial<Survey>): Promise<Survey | null> => {
    if (!user) {
      setError('User is not logged in');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Add creator ID and generate IDs for questions if needed
      const preparedData = {
        ...surveyData,
        creatorId: user.id,
        questions: surveyData.questions?.map(q => ({
          ...q,
          id: q.id || generateId(),
        })),
      };
      
      const response = await surveyApi.createSurvey(preparedData);
      
      if (response.success && response.data) {
        // Add the new survey to the surveys list
        setSurveys(prev => [response.data, ...prev]);
        return response.data;
      } else {
        setError(response.error || 'Failed to create survey');
        return null;
      }
    } catch (err: any) {
      console.error('Error creating survey:', err);
      setError(err.message || 'Failed to create survey');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const submitSurvey = async (surveyId: string, answers: Answer[]): Promise<Participation | null> => {
    if (!user) {
      setError('User is not logged in');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await surveyApi.submitSurvey(surveyId, answers);
      
      if (response.success && response.data) {
        // If we have the current survey loaded, update its participations
        if (currentSurvey && currentSurvey.id === surveyId) {
          setCurrentSurvey(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              participations: [...prev.participations, response.data],
            };
          });
        }
        
        return response.data;
      } else {
        setError(response.error || 'Failed to submit survey');
        return null;
      }
    } catch (err: any) {
      console.error('Error submitting survey:', err);
      setError(err.message || 'Failed to submit survey');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const generateQuestions = async (
    prompt: string, 
    category: string, 
    count: number
  ): Promise<AIGeneratedQuestion[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await surveyApi.generateQuestions(prompt, category, count);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to generate questions');
        return [];
      }
    } catch (err: any) {
      console.error('Error generating questions:', err);
      setError(err.message || 'Failed to generate questions');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const analyzeSurvey = async (surveyId: string): Promise<string> => {
    if (!user) {
      setError('User is not logged in');
      return '';
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await surveyApi.analyzeSurvey(surveyId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to analyze survey');
        return '';
      }
    } catch (err: any) {
      console.error('Error analyzing survey:', err);
      setError(err.message || 'Failed to analyze survey');
      return '';
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    surveys,
    currentSurvey,
    loading,
    error,
    loadSurveys,
    loadUserSurveys,
    loadSurveyDetails,
    createSurvey,
    submitSurvey,
    generateQuestions,
    analyzeSurvey,
  };
  
  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
}

export const useSurvey = () => useContext(SurveyContext);

export default SurveyContext;
