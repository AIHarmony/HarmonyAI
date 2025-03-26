'use client';

import { useState, useCallback } from 'react';
import { 
  surveyService, 
  Survey, 
  SurveyCategory, 
  Question, 
  QuestionType, 
  Answer 
} from '../services/SurveyService';
import { useAuth } from './useAuth';
import { analyzeSurveyResponses } from '../utils/ai';

export const useSurvey = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load all available surveys
  const loadSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allSurveys = await surveyService.getActiveSurveys();
      setSurveys(allSurveys);
    } catch (err: any) {
      setError(err.message || 'Failed to load surveys');
      console.error('Error loading surveys:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load user created surveys
  const loadUserSurveys = useCallback(async () => {
    if (!user) {
      setError('Please login first');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const userSurveys = await surveyService.getUserCreatedSurveys(user.id);
      setSurveys(userSurveys);
    } catch (err: any) {
      setError(err.message || 'Failed to load your surveys');
      console.error('Error loading user surveys:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Load survey details
  const loadSurveyDetails = useCallback(async (surveyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const survey = await surveyService.getSurvey(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }
      setCurrentSurvey(survey);
      return survey;
    } catch (err: any) {
      setError(err.message || 'Failed to load survey details');
      console.error('Error loading survey details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Create new survey
  const createSurvey = useCallback(async (data: {
    title: string;
    description: string;
    category: SurveyCategory;
    rewardPerParticipant: number;
    estimatedTimeMinutes: number;
    questions?: Question[];
    maxParticipants: number;
  }) => {
    if (!user) {
      setError('Please login first');
      return null;
    }
    
    setLoading(true);
    setError(null);
    try {
      const newSurvey = await surveyService.createSurvey({
        ...data,
        creatorId: user.id
      });
      
      return newSurvey;
    } catch (err: any) {
      setError(err.message || 'Failed to create survey');
      console.error('Error creating survey:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Submit survey answers
  const submitSurvey = useCallback(async (surveyId: string, answers: Answer[]) => {
    if (!user) {
      setError('Please login first');
      return null;
    }
    
    setLoading(true);
    setError(null);
    try {
      const participation = await surveyService.submitSurveyAnswers({
        userId: user.id,
        surveyId,
        answers
      });
      
      return participation;
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey');
      console.error('Error submitting survey:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Close a survey
  const closeSurvey = useCallback(async (surveyId: string) => {
    if (!user) {
      setError('Please login first');
      return null;
    }
    
    setLoading(true);
    setError(null);
    try {
      const updatedSurvey = await surveyService.closeSurvey(surveyId, user.id);
      return updatedSurvey;
    } catch (err: any) {
      setError(err.message || 'Failed to close survey');
      console.error('Error closing survey:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Analyze survey responses
  const analyzeSurvey = useCallback(async (surveyId: string) => {
    if (!user) {
      setError('Please login first');
      return null;
    }
    
    setLoading(true);
    setError(null);
    try {
      const survey = await surveyService.getSurvey(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }
      
      // Check if user is authorized to analyze this survey
      if (survey.creatorId !== user.id) {
        throw new Error('You are not authorized to analyze this survey');
      }
      
      // Transform participations data for AI analysis
      const analyzeData = survey.participations.map(p => ({
        participantId: p.userId,
        answers: p.answers.map(a => {
          const question = survey.questions.find(q => q.id === a.questionId);
          return {
            questionText: question?.text || 'Unknown question',
            questionType: question?.type || 'text',
            response: a.response
          };
        })
      }));
      
      // Use AI to analyze the data
      const analysis = await analyzeSurveyResponses(analyzeData);
      return analysis;
    } catch (err: any) {
      setError(err.message || 'Failed to analyze survey');
      console.error('Error analyzing survey:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  return {
    surveys,
    currentSurvey,
    loading,
    error,
    loadSurveys,
    loadUserSurveys,
    loadSurveyDetails,
    createSurvey,
    submitSurvey,
    closeSurvey,
    analyzeSurvey
  };
};
