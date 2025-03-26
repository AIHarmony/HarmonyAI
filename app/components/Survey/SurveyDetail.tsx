'use client';

import { useState, useEffect } from 'react';
import { useSurvey } from '../../hooks/useSurvey';
import { useAuth } from '../../hooks/useAuth';
import { QuestionType, Question, Answer, Survey } from '../../services/SurveyService';

interface SurveyDetailProps {
  surveyId: string;
  onSubmitSuccess?: () => void;
}

export default function SurveyDetail({ surveyId, onSubmitSuccess }: SurveyDetailProps) {
  const { loadSurveyDetails, submitSurvey, currentSurvey, loading, error } = useSurvey();
  const { user } = useAuth();
  
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Load survey details
  useEffect(() => {
    loadSurveyDetails(surveyId);
  }, [surveyId, loadSurveyDetails]);
  
  // Initialize answers when survey is loaded
  useEffect(() => {
    if (currentSurvey && currentSurvey.questions) {
      const initialAnswers: Answer[] = currentSurvey.questions.map(q => ({
        questionId: q.id,
        response: q.type === QuestionType.MULTI_CHOICE ? [] : q.type === QuestionType.RATING ? 0 : '',
      }));
      setAnswers(initialAnswers);
    }
  }, [currentSurvey]);
  
  // Check if user has already participated
  const hasParticipated = currentSurvey?.participations.some(p => p.userId === user?.id) || false;
  
  // Check if survey is available for participation
  const canParticipate = 
    !!currentSurvey &&
    currentSurvey.isActive &&
    !hasParticipated &&
    currentSurvey.participations.length < currentSurvey.maxParticipants;
  
  // Update an answer
  const updateAnswer = (questionId: string, value: string | string[] | number) => {
    setAnswers(
      answers.map(a => 
        a.questionId === questionId ? { ...a, response: value } : a
      )
    );
  };
  
  // Handle text input change
  const handleTextChange = (questionId: string, value: string) => {
    updateAnswer(questionId, value);
  };
  
  // Handle multi-choice selection
  const handleMultiChoiceChange = (questionId: string, value: string, checked: boolean) => {
    const answer = answers.find(a => a.questionId === questionId);
    
    if (!answer) return;
    
    const currentValues = Array.isArray(answer.response) ? answer.response : [];
    
    if (checked) {
      updateAnswer(questionId, [...currentValues, value]);
    } else {
      updateAnswer(questionId, currentValues.filter(v => v !== value));
    }
  };
  
  // Handle rating change
  const handleRatingChange = (questionId: string, value: number) => {
    updateAnswer(questionId, value);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setFormError('Please login to participate in this survey');
      return;
    }
    
    if (!canParticipate) {
      setFormError('You cannot participate in this survey');
      return;
    }
    
    // Validate answers
    let isValid = true;
    let errorMessage = '';
    
    answers.forEach((answer, index) => {
      const question = currentSurvey?.questions[index];
      
      if (!question) return;
      
      if (question.type === QuestionType.TEXT && (!answer.response || answer.response === '')) {
        isValid = false;
        errorMessage = 'Please answer all questions';
      } else if (question.type === QuestionType.MULTI_CHOICE && 
                (!Array.isArray(answer.response) || answer.response.length === 0)) {
        isValid = false;
        errorMessage = 'Please select at least one option for each multiple choice question';
      } else if (question.type === QuestionType.RATING && 
                (typeof answer.response !== 'number' || answer.response === 0)) {
        isValid = false;
        errorMessage = 'Please provide a rating for all rating questions';
      }
    });
    
    if (!isValid) {
      setFormError(errorMessage);
      return;
    }
    
    // Submit answers
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const participation = await submitSurvey(surveyId, answers);
      
      if (participation) {
        setIsSubmitted(true);
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit survey');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
  
  if (isSubmitted) {
    return (
      <div className="bg-green-500/20 border border-green-500 text-green-200 p-6 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Thank You!</h3>
        <p>Your response has been submitted successfully.</p>
        <p className="mt-4">
          You've earned {currentSurvey.rewardPerParticipant} HAI tokens for your participation.
          The tokens have been transferred to your wallet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 text-white">{currentSurvey.title}</h2>
        <p className="text-zinc-400 mb-6">{currentSurvey.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-6 text-sm text-zinc-500">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estimated time: {currentSurvey.estimatedTimeMinutes} minutes
          </div>
          
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Reward: {currentSurvey.rewardPerParticipant} HAI
          </div>
          
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Participants: {currentSurvey.participations.length}/{currentSurvey.maxParticipants}
          </div>
        </div>
        
        {!canParticipate && !hasParticipated && !currentSurvey.isActive && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded mb-6">
            This survey is no longer active.
          </div>
        )}
        
        {!canParticipate && !hasParticipated && currentSurvey.participations.length >= currentSurvey.maxParticipants && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 p-4 rounded mb-6">
            This survey has reached its maximum number of participants.
          </div>
        )}
        
        {!canParticipate && hasParticipated && (
          <div className="bg-blue-500/20 border border-blue-500 text-blue-200 p-4 rounded mb-6">
            You have already participated in this survey.
          </div>
        )}
      </div>
      
      {canParticipate && (
        <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-6">
          {formError && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-6">
              {formError}
            </div>
          )}
          
          <h3 className="text-xl font-semibold mb-6 text-white">Survey Questions</h3>
          
          {currentSurvey.questions.map((question, qIndex) => (
            <div key={question.id} className="mb-8 pb-6 border-b border-zinc-800 last:border-0 last:mb-0 last:pb-0">
              <h4 className="text-lg font-medium mb-3 text-white">
                {qIndex + 1}. {question.text}
              </h4>
              
              {question.type === QuestionType.TEXT && (
                <textarea
                  value={answers[qIndex]?.response as string || ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Type your answer here..."
                  disabled={isSubmitting}
                />
              )}
              
              {question.type === QuestionType.MULTI_CHOICE && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, oIndex) => (
                    <label key={oIndex} className="flex items-start space-x-3 cursor-pointer text-zinc-300">
                      <input
                        type="checkbox"
                        checked={Array.isArray(answers[qIndex]?.response) && 
                                 (answers[qIndex]?.response as string[]).includes(option)}
                        onChange={(e) => handleMultiChoiceChange(question.id, option, e.target.checked)}
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === QuestionType.RATING && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-zinc-500 text-sm">Low</span>
                    <span className="text-zinc-500 text-sm">High</span>
                  </div>
                  <div className="flex justify-between space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(question.id, rating)}
                        className={`flex-1 py-2 rounded-md transition ${
                          (answers[qIndex]?.response as number) === rating
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                        disabled={isSubmitting}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !canParticipate}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
