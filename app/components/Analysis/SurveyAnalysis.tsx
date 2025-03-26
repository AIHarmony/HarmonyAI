'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSurvey } from '../../hooks/useSurvey';
import { useAuth } from '../../hooks/useAuth';
import { QuestionType } from '../../services/SurveyService';

interface SurveyAnalysisProps {
  surveyId: string;
}

export default function SurveyAnalysis({ surveyId }: SurveyAnalysisProps) {
  const { loadSurveyDetails, analyzeSurvey, currentSurvey, loading, error } = useSurvey();
  const { user, isResearcher } = useAuth();
  
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Load survey details
  useEffect(() => {
    loadSurveyDetails(surveyId);
  }, [surveyId, loadSurveyDetails]);
  
  // Get response count statistics
  const getResponseStats = () => {
    if (!currentSurvey) return { total: 0, complete: 0, percentage: 0 };
    
    const total = currentSurvey.maxParticipants;
    const complete = currentSurvey.participations.length;
    const percentage = total > 0 ? Math.round((complete / total) * 100) : 0;
    
    return { total, complete, percentage };
  };
  
  // Run AI analysis
  const runAnalysis = useCallback(async () => {
    if (!currentSurvey || !user) return;
    
    // Check if user is authorized
    if (currentSurvey.creatorId !== user.id && !isResearcher) {
      setAnalysisError('You are not authorized to analyze this survey');
      return;
    }
    
    // Check if there are enough responses
    if (currentSurvey.participations.length < 1) {
      setAnalysisError('Not enough responses to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const result = await analyzeSurvey(surveyId);
      setAnalysis(result || 'No insights found.');
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to analyze survey');
      console.error('Error analyzing survey:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentSurvey, user, isResearcher, analyzeSurvey, surveyId]);
  
  // Count responses by question type
  const getResponseTypeBreakdown = () => {
    if (!currentSurvey) return {};
    
    const breakdown = {
      text: 0,
      multiChoice: 0,
      rating: 0,
    };
    
    currentSurvey.questions.forEach(q => {
      if (q.type === QuestionType.TEXT) breakdown.text++;
      else if (q.type === QuestionType.MULTI_CHOICE) breakdown.multiChoice++;
      else if (q.type === QuestionType.RATING) breakdown.rating++;
    });
    
    return breakdown;
  };
  
  // Create simplified data for visualizing multiple choice responses
  const getMultiChoiceData = () => {
    if (!currentSurvey) return [];
    
    return currentSurvey.questions
      .filter(q => q.type === QuestionType.MULTI_CHOICE && q.options)
      .map(question => {
        const optionCounts = {};
        
        // Initialize counts
        question.options?.forEach(opt => {
          optionCounts[opt] = 0;
        });
        
        // Count responses
        currentSurvey.participations.forEach(p => {
          const answer = p.answers.find(a => a.questionId === question.id);
          if (answer && Array.isArray(answer.response)) {
            answer.response.forEach(selectedOption => {
              if (optionCounts[selectedOption] !== undefined) {
                optionCounts[selectedOption]++;
              }
            });
          }
        });
        
        return {
          question: question.text,
          data: optionCounts,
        };
      });
  };
  
  // Calculate average ratings
  const getRatingAverages = () => {
    if (!currentSurvey) return [];
    
    return currentSurvey.questions
      .filter(q => q.type === QuestionType.RATING)
      .map(question => {
        let sum = 0;
        let count = 0;
        
        currentSurvey.participations.forEach(p => {
          const answer = p.answers.find(a => a.questionId === question.id);
          if (answer && typeof answer.response === 'number' && answer.response > 0) {
            sum += answer.response;
            count++;
          }
        });
        
        const average = count > 0 ? sum / count : 0;
        
        return {
          question: question.text,
          average: parseFloat(average.toFixed(1)),
          count,
        };
      });
  };
  
  const stats = getResponseStats();
  const typeBreakdown = getResponseTypeBreakdown();
  const multiChoiceData = getMultiChoiceData();
  const ratingAverages = getRatingAverages();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !currentSurvey) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-4">
        {error || 'Survey not found'}
      </div>
    );
  }
  
  // Check if user is authorized to view analysis
  const canViewAnalysis = currentSurvey.creatorId === user?.id || isResearcher;
  
  if (!canViewAnalysis) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded">
        You are not authorized to view this survey's analysis
      </div>
    );
  }
  
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Survey Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-zinc-200">Response Rate</h3>
          <div className="flex items-end">
            <div className="text-3xl font-bold text-blue-400">{stats.complete}</div>
            <div className="text-zinc-400 ml-2">/ {stats.total}</div>
          </div>
          <div className="mt-2 bg-zinc-700 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          <div className="text-sm text-zinc-400 mt-1">{stats.percentage}% complete</div>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-zinc-200">Question Types</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Text Responses:</span>
              <span className="font-medium text-zinc-300">{typeBreakdown.text}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Multiple Choice:</span>
              <span className="font-medium text-zinc-300">{typeBreakdown.multiChoice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Rating Questions:</span>
              <span className="font-medium text-zinc-300">{typeBreakdown.rating}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-zinc-200">Survey Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Status:</span>
              <span className={`font-medium ${currentSurvey.isActive ? 'text-green-400' : 'text-yellow-400'}`}>
                {currentSurvey.isActive ? 'Active' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Created:</span>
              <span className="font-medium text-zinc-300">
                {new Date(currentSurvey.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Reward:</span>
              <span className="font-medium text-zinc-300">{currentSurvey.rewardPerParticipant} HAI</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rating Data */}
      {ratingAverages.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4 text-zinc-200">Rating Questions</h3>
          <div className="bg-zinc-800 p-4 rounded-lg">
            {ratingAverages.map((item, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-300">{item.question}</span>
                  <span className="font-medium text-blue-400">{item.average}/5</span>
                </div>
                <div className="bg-zinc-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${(item.average / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-zinc-500 mt-1">{item.count} responses</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Multiple Choice Data */}
      {multiChoiceData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4 text-zinc-200">Multiple Choice Questions</h3>
          <div className="space-y-6">
            {multiChoiceData.map((item, qIndex) => (
              <div key={qIndex} className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="text-zinc-300 mb-3">{item.question}</h4>
                <div className="space-y-3">
                  {Object.entries(item.data).map(([option, count], oIndex) => (
                    <div key={oIndex}>
                      <div className="flex justify-between mb-1">
                        <span className="text-zinc-400">{option}</span>
                        <span className="text-zinc-300">{count as number}</span>
                      </div>
                      <div className="bg-zinc-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ 
                            width: `${currentSurvey.participations.length > 0 
                              ? ((count as number) / currentSurvey.participations.length) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* AI Analysis */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-zinc-200">AI Insights</h3>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing || currentSurvey.participations.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>
        
        {analysisError && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-4">
            {analysisError}
          </div>
        )}
        
        {currentSurvey.participations.length === 0 && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded mb-4">
            At least one response is required to generate insights
          </div>
        )}
        
        {analysis && (
          <div className="bg-zinc-800 p-5 rounded-lg">
            <h4 className="text-lg font-medium mb-3 text-zinc-200">AI Analysis Results</h4>
            <div className="prose prose-invert prose-zinc max-w-none">
              {analysis.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 text-zinc-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
