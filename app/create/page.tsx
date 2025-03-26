'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSurvey } from '../lib/context/SurveyContext';
import { useAuth } from '../lib/context/AuthContext';
import {
  Question,
  QuestionType,
  SurveyCategory,
  Survey
} from '../lib/types';
import {
  SURVEY_CATEGORIES,
  QUESTION_TYPES,
  MIN_SURVEY_TITLE_LENGTH,
  MAX_SURVEY_TITLE_LENGTH,
  MIN_SURVEY_DESCRIPTION_LENGTH,
  MAX_SURVEY_DESCRIPTION_LENGTH,
  MIN_QUESTION_LENGTH,
  MAX_QUESTION_LENGTH
} from '../lib/constants';
import { generateId } from '../lib/utils';
import Link from 'next/link';

export default function CreateSurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  
  const { isLoggedIn, user } = useAuth();
  const {
    currentSurvey,
    loadSurveyDetails,
    createSurvey,
    generateQuestions,
    loading,
    error: surveyError
  } = useSurvey();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SurveyCategory>('Product');
  const [reward, setReward] = useState(50);
  const [targetParticipants, setTargetParticipants] = useState(100);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Load survey for editing
  useEffect(() => {
    if (editId) {
      loadSurveyDetails(editId);
      setIsEditing(true);
    } else {
      // Initialize with one empty question for new surveys
      setQuestions([createEmptyQuestion()]);
    }
  }, [editId, loadSurveyDetails]);

  // Populate form with survey data for editing
  useEffect(() => {
    if (isEditing && currentSurvey) {
      setTitle(currentSurvey.title);
      setDescription(currentSurvey.description);
      setCategory(currentSurvey.category);
      setReward(currentSurvey.reward);
      setTargetParticipants(currentSurvey.targetParticipants);
      setQuestions(currentSurvey.questions);
    }
  }, [isEditing, currentSurvey]);

  // Create an empty question
  const createEmptyQuestion = (): Question => ({
    id: generateId(),
    surveyId: '',
    text: '',
    type: 'text',
    required: true,
    order: questions.length
  });

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };

  // Remove a question
  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    } else {
      setError('A survey must have at least one question');
    }
  };

  // Update a question
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
    
    // Clear validation errors for this question
    if (formErrors[`question_${id}`]) {
      const newErrors = { ...formErrors };
      delete newErrors[`question_${id}`];
      setFormErrors(newErrors);
    }
  };

  // Generate questions using AI
  const handleGenerateQuestions = async () => {
    if (!aiPrompt) {
      setError('Please enter a prompt for AI-generated questions');
      return;
    }
    
    setGeneratingQuestions(true);
    setError(null);
    
    try {
      const aiQuestions = await generateQuestions(aiPrompt, category, 3);
      
      if (aiQuestions.length) {
        // Convert AI generated questions to the Question format
        const newQuestions = aiQuestions.map((q, index) => ({
          id: generateId(),
          surveyId: '',
          text: q.text,
          type: q.type,
          options: q.options,
          required: true,
          order: questions.length + index
        }));
        
        setQuestions([...questions, ...newQuestions]);
        setAiPrompt('');
      }
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate title
    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length < MIN_SURVEY_TITLE_LENGTH) {
      errors.title = `Title must be at least ${MIN_SURVEY_TITLE_LENGTH} characters`;
    } else if (title.length > MAX_SURVEY_TITLE_LENGTH) {
      errors.title = `Title must be at most ${MAX_SURVEY_TITLE_LENGTH} characters`;
    }
    
    // Validate description
    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.length < MIN_SURVEY_DESCRIPTION_LENGTH) {
      errors.description = `Description must be at least ${MIN_SURVEY_DESCRIPTION_LENGTH} characters`;
    } else if (description.length > MAX_SURVEY_DESCRIPTION_LENGTH) {
      errors.description = `Description must be at most ${MAX_SURVEY_DESCRIPTION_LENGTH} characters`;
    }
    
    // Validate reward
    if (reward <= 0) {
      errors.reward = 'Reward must be greater than 0';
    }
    
    // Validate target participants
    if (targetParticipants <= 0) {
      errors.targetParticipants = 'Target participants must be greater than 0';
    }
    
    // Validate questions
    questions.forEach((question, index) => {
      if (!question.text.trim()) {
        errors[`question_${question.id}`] = 'Question text is required';
      } else if (question.text.length < MIN_QUESTION_LENGTH) {
        errors[`question_${question.id}`] = `Question must be at least ${MIN_QUESTION_LENGTH} characters`;
      } else if (question.text.length > MAX_QUESTION_LENGTH) {
        errors[`question_${question.id}`] = `Question must be at most ${MAX_QUESTION_LENGTH} characters`;
      }
      
      // Validate that multiple choice and single choice questions have options
      if ((question.type === 'multiple_choice' || question.type === 'single_choice') && 
          (!question.options || question.options.length < 2)) {
        errors[`question_${question.id}_options`] = 'At least 2 options are required';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      router.push('/');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    const surveyData: Partial<Survey> = {
      id: isEditing ? currentSurvey?.id : undefined,
      title,
      description,
      category,
      reward,
      targetParticipants,
      questions: questions.map((q, index) => ({
        ...q,
        order: index
      })),
      status: 'draft'
    };
    
    try {
      const createdSurvey = await createSurvey(surveyData);
      
      if (createdSurvey) {
        router.push(`/surveys/${createdSurvey.id}`);
      }
    } catch (err) {
      setError('Failed to create survey. Please try again.');
    }
  };

  // Show login required message
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to create a survey.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Survey' : 'Create New Survey'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {isEditing
              ? 'Update your survey details and questions'
              : 'Design your research survey and earn insights'}
          </p>
        </div>

        {/* Survey form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200 mb-8">
            {/* Survey details */}
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Survey Details</h2>
              
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`block w-full rounded-md shadow-sm ${
                    formErrors.title 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`block w-full rounded-md shadow-sm ${
                    formErrors.description 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>
              
              {/* Category */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SurveyCategory)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {SURVEY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Reward and target participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-1">
                    Reward (tokens) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="reward"
                    value={reward}
                    onChange={(e) => setReward(Number(e.target.value))}
                    min="0"
                    className={`block w-full rounded-md shadow-sm ${
                      formErrors.reward 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.reward && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.reward}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="targetParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Participants <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="targetParticipants"
                    value={targetParticipants}
                    onChange={(e) => setTargetParticipants(Number(e.target.value))}
                    min="1"
                    className={`block w-full rounded-md shadow-sm ${
                      formErrors.targetParticipants 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.targetParticipants && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.targetParticipants}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* AI question generation */}
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Generate Questions with AI</h2>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you want to learn from your survey..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={generatingQuestions || !aiPrompt}
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                    generatingQuestions || !aiPrompt
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {generatingQuestions ? 'Generating...' : 'Generate Questions'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Let AI help you generate professional survey questions based on your research goals
              </p>
            </div>
            
            {/* Questions */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-900">Questions</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
                >
                  Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No questions yet. Add a question or generate with AI.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div 
                      key={question.id} 
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Question {index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove question"
                        >
                          <svg 
                            className="h-5 w-5" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M6 18L18 6M6 6l12 12" 
                            />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Question text */}
                      <div className="mb-4">
                        <label 
                          htmlFor={`question-${question.id}`} 
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Question text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id={`question-${question.id}`}
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                          rows={2}
                          className={`block w-full rounded-md shadow-sm ${
                            formErrors[`question_${question.id}`] 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {formErrors[`question_${question.id}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors[`question_${question.id}`]}
                          </p>
                        )}
                      </div>
                      
                      {/* Question type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label 
                            htmlFor={`question-type-${question.id}`} 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Question type
                          </label>
                          <select
                            id={`question-type-${question.id}`}
                            value={question.type}
                            onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            {QUESTION_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {formatQuestionType(type)}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`question-required-${question.id}`}
                            checked={question.required}
                            onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`question-required-${question.id}`}
                            className="ml-2 block text-sm text-gray-700"
                          >
                            Required question
                          </label>
                        </div>
                      </div>
                      
                      {/* Question options for multiple choice or single choice */}
                      {(question.type === 'multiple_choice' || question.type === 'single_choice') && (
                        <div className="mb-4">
                          <label 
                            htmlFor={`question-options-${question.id}`} 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Options <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(question.options || [])];
                                    newOptions[optionIndex] = e.target.value;
                                    updateQuestion(question.id, { options: newOptions });
                                  }}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOptions = [...(question.options || [])];
                                    newOptions.splice(optionIndex, 1);
                                    updateQuestion(question.id, { options: newOptions });
                                  }}
                                  className="ml-2 text-red-600 hover:text-red-800"
                                  title="Remove option"
                                >
                                  <svg 
                                    className="h-5 w-5" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth={2} 
                                      d="M6 18L18 6M6 6l12 12" 
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = [...(question.options || []), ''];
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              + Add Option
                            </button>
                          </div>
                          {formErrors[`question_${question.id}_options`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors[`question_${question.id}_options`]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {(error || surveyError) && (
            <div className="mb-6 bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{error || surveyError}</p>
            </div>
          )}

          {/* Form actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-md shadow-sm font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading
                ? 'Saving...'
                : isEditing
                ? 'Update Survey'
                : 'Create Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
