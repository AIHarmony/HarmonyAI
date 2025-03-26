'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSurvey } from '../../lib/context/SurveyContext';
import { useAuth } from '../../lib/context/AuthContext';
import { Question, Answer, Survey } from '../../lib/types';
import { formatDate, formatCurrency } from '../../lib/utils';
import Link from 'next/link';

export default function SurveyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;
  
  const { user, isLoggedIn } = useAuth();
  const { 
    currentSurvey, 
    loadSurveyDetails, 
    submitSurvey, 
    loading,
    error 
  } = useSurvey();
  
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load survey details when component mounts
  useEffect(() => {
    if (surveyId) {
      loadSurveyDetails(surveyId);
    }
  }, [surveyId, loadSurveyDetails]);

  // Check if current user already participated
  const hasParticipated = currentSurvey?.participations.some(
    p => p.userId === user?.id
  );

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: string | number | boolean) => {
    const answerIndex = answers.findIndex(a => a.questionId === questionId);
    
    if (answerIndex >= 0) {
      // Update existing answer
      const newAnswers = [...answers];
      newAnswers[answerIndex] = { questionId, value };
      setAnswers(newAnswers);
    } else {
      // Add new answer
      setAnswers([...answers, { questionId, value }]);
    }
    
    // Clear validation error for this question
    if (validationErrors[questionId]) {
      const newErrors = { ...validationErrors };
      delete newErrors[questionId];
      setValidationErrors(newErrors);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      router.push('/');
      return;
    }
    
    if (!currentSurvey) return;
    
    // Validate required questions are answered
    const errors: Record<string, string> = {};
    currentSurvey.questions.forEach(question => {
      if (question.required && !answers.some(a => a.questionId === question.id)) {
        errors[question.id] = 'This question is required';
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await submitSurvey(surveyId, answers);
      if (result) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error submitting survey:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading && !currentSurvey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading survey...</p>
      </div>
    );
  }

  // Error state
  if (error || !currentSurvey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Survey not found. It may have been removed or is no longer available.'}
          </p>
          <Link
            href="/surveys"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Other Surveys
          </Link>
        </div>
      </div>
    );
  }

  // Thank you screen after submission
  if (submitted || hasParticipated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-full">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your responses have been submitted successfully. You've earned{' '}
            <span className="font-medium text-green-600">
              {formatCurrency(currentSurvey.reward)}
            </span>{' '}
            for your participation.
          </p>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 justify-center">
            <Link
              href="/surveys"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Find More Surveys
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Creator viewing their own survey
  const isCreator = user?.id === currentSurvey.creatorId;
  if (isCreator) {
    return <CreatorView survey={currentSurvey} />;
  }

  // Survey is not active
  if (currentSurvey.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Survey Unavailable</h1>
          <p className="text-gray-600 mb-6">
            This survey is currently not accepting responses.
          </p>
          <Link
            href="/surveys"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Other Surveys
          </Link>
        </div>
      </div>
    );
  }

  // Non-authenticated user
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to participate in this survey and earn rewards.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Participant view of an active survey
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Survey header */}
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{currentSurvey.title}</h1>
            <p className="mt-2 text-blue-100">{currentSurvey.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full">
                {currentSurvey.category}
              </span>
              <span className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full">
                {currentSurvey.questions.length} Questions
              </span>
              <span className="bg-green-500 bg-opacity-50 px-3 py-1 rounded-full">
                Reward: {formatCurrency(currentSurvey.reward)}
              </span>
            </div>
          </div>

          {/* Survey form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {currentSurvey.questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">
                      {index + 1}. {question.text}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                  </div>
                  
                  {/* Question inputs based on type */}
                  <div className="mt-4">
                    {renderQuestionInput(question, answers, handleAnswerChange)}
                  </div>
                  
                  {/* Validation error */}
                  {validationErrors[question.id] && (
                    <p className="mt-2 text-sm text-red-600">
                      {validationErrors[question.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Submit button */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 text-white font-medium rounded-md shadow-sm ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Creator view component
function CreatorView({ survey }: { survey: Survey }) {
  const router = useRouter();
  
  const handleEditClick = () => {
    router.push(`/create?edit=${survey.id}`);
  };
  
  const handleAnalyzeClick = () => {
    router.push(`/surveys/${survey.id}/analyze`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Survey header */}
          <div className="bg-blue-600 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="text-white">
                <h1 className="text-2xl font-bold">{survey.title}</h1>
                <p className="mt-2 text-blue-100">{survey.description}</p>
                <div className="mt-2 flex items-center">
                  <span className={`px-2 py-1 text-xs text-white bg-blue-700 rounded-full`}>
                    {survey.status.toUpperCase()}
                  </span>
                  <span className="mx-2 text-blue-200">•</span>
                  <span className="text-blue-100">{formatDate(survey.createdAt)}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                >
                  Edit Survey
                </button>
                {survey.status === 'completed' && (
                  <button
                    onClick={handleAnalyzeClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Analyze Results
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Survey statistics */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Survey Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-lg font-medium text-gray-900">{survey.category}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Reward</p>
                <p className="text-lg font-medium text-gray-900">{formatCurrency(survey.reward)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Questions</p>
                <p className="text-lg font-medium text-gray-900">{survey.questions.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Participation</p>
                <p className="text-lg font-medium text-gray-900">
                  {survey.participations.length}/{survey.targetParticipants}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (survey.participations.length / survey.targetParticipants) * 100
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Survey questions preview */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Questions</h2>
            <div className="space-y-4">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    {index + 1}. {question.text}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Type: {formatQuestionType(question.type)}
                    {question.options && question.options.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        Options: {question.options.join(', ')}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render the appropriate input for each question type
function renderQuestionInput(
  question: Question,
  answers: Answer[],
  handleAnswerChange: (questionId: string, value: string | number | boolean) => void
) {
  const currentAnswer = answers.find(a => a.questionId === question.id);
  
  switch (question.type) {
    case 'text':
      return (
        <textarea
          id={question.id}
          value={currentAnswer?.value as string || ''}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      );
      
    case 'single_choice':
      return (
        <div className="mt-2 space-y-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                id={`${question.id}-${index}`}
                name={question.id}
                type="radio"
                value={option}
                checked={currentAnswer?.value === option}
                onChange={() => handleAnswerChange(question.id, option)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor={`${question.id}-${index}`}
                className="ml-3 block text-sm text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );
      
    case 'multiple_choice':
      return (
        <div className="mt-2 space-y-2">
          {question.options?.map((option, index) => {
            // For multiple choice, we store an array of selected options
            const selectedOptions = (currentAnswer?.value as string[]) || [];
            const isChecked = selectedOptions.includes(option);
            
            return (
              <div key={index} className="flex items-center">
                <input
                  id={`${question.id}-${index}`}
                  type="checkbox"
                  value={option}
                  checked={isChecked}
                  onChange={() => {
                    // Toggle the selection
                    const updatedSelection = isChecked
                      ? selectedOptions.filter(item => item !== option)
                      : [...selectedOptions, option];
                    handleAnswerChange(question.id, updatedSelection);
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`${question.id}-${index}`}
                  className="ml-3 block text-sm text-gray-700"
                >
                  {option}
                </label>
              </div>
            );
          })}
        </div>
      );
      
    case 'rating':
      return (
        <div className="mt-2">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-medium ${
                  currentAnswer?.value === rating
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>
      );
      
    case 'boolean':
      return (
        <div className="mt-2 flex space-x-4">
          <button
            type="button"
            onClick={() => handleAnswerChange(question.id, true)}
            className={`px-4 py-2 rounded-md ${
              currentAnswer?.value === true
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleAnswerChange(question.id, false)}
            className={`px-4 py-2 rounded-md ${
              currentAnswer?.value === false
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            No
          </button>
        </div>
      );
      
    default:
      return null;
  }
}

// Helper function to format question type for display
function formatQuestionType(type: string): string {
  switch (type) {
    case 'text':
      return 'Text Answer';
    case 'single_choice':
      return 'Single Choice';
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'rating':
      return 'Rating (1-5)';
    case 'boolean':
      return 'Yes/No';
    default:
      return type;
  }
}
