'use client';

import { useState } from 'react';
import { useSurvey } from '../../hooks/useSurvey';
import { SurveyCategory, QuestionType, Question } from '../../services/SurveyService';

interface SurveyFormProps {
  onSuccess?: (surveyId: string) => void;
}

export default function SurveyForm({ onSuccess }: SurveyFormProps) {
  const { createSurvey, loading, error } = useSurvey();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SurveyCategory>(SurveyCategory.TECHNOLOGY);
  const [rewardPerParticipant, setRewardPerParticipant] = useState(10);
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(5);
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [useAI, setUseAI] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Add a new question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      text: '',
      type: QuestionType.TEXT,
      options: []
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  // Remove a question
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };
  
  // Update a question
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    );
  };
  
  // Add an option to a multiple choice question
  const addOption = (questionId: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...(q.options || []), ''] } 
          : q
      )
    );
  };
  
  // Update an option
  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };
  
  // Remove an option
  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions.splice(optionIndex, 1);
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Basic validation
    if (!title) {
      setFormError('Title is required');
      return;
    }
    
    if (!description) {
      setFormError('Description is required');
      return;
    }
    
    if (rewardPerParticipant <= 0) {
      setFormError('Reward must be greater than 0');
      return;
    }
    
    if (maxParticipants <= 0) {
      setFormError('Maximum participants must be greater than 0');
      return;
    }
    
    // Validate questions if not using AI
    if (!useAI) {
      if (questions.length === 0) {
        setFormError('Please add at least one question');
        return;
      }
      
      // Check each question
      for (const q of questions) {
        if (!q.text) {
          setFormError('All questions must have text');
          return;
        }
        
        // Check options for multiple choice questions
        if (q.type === QuestionType.MULTI_CHOICE) {
          if (!q.options || q.options.length < 2) {
            setFormError('Multiple choice questions must have at least 2 options');
            return;
          }
          
          if (q.options.some(opt => !opt)) {
            setFormError('All options must have text');
            return;
          }
        }
      }
    }
    
    // Create survey
    const survey = await createSurvey({
      title,
      description,
      category,
      rewardPerParticipant,
      estimatedTimeMinutes,
      maxParticipants,
      questions: useAI ? [] : questions
    });
    
    if (survey && onSuccess) {
      onSuccess(survey.id);
    }
  };
  
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Create New Survey</h2>
      
      <form onSubmit={handleSubmit}>
        {(formError || error) && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4">
            {formError || error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-zinc-300 mb-1">Survey Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
            disabled={loading}
            placeholder="e.g. User Experience in Blockchain Applications"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-zinc-300 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
            rows={3}
            disabled={loading}
            placeholder="Describe the purpose of your survey"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="category" className="block text-zinc-300 mb-1">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as SurveyCategory)}
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              disabled={loading}
            >
              {Object.values(SurveyCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="reward" className="block text-zinc-300 mb-1">Reward per Participant (HAI)</label>
            <input
              id="reward"
              type="number"
              value={rewardPerParticipant}
              onChange={(e) => setRewardPerParticipant(Number(e.target.value))}
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              disabled={loading}
              min={1}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="time" className="block text-zinc-300 mb-1">Estimated Time (minutes)</label>
            <input
              id="time"
              type="number"
              value={estimatedTimeMinutes}
              onChange={(e) => setEstimatedTimeMinutes(Number(e.target.value))}
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              disabled={loading}
              min={1}
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="participants" className="block text-zinc-300 mb-1">Maximum Participants</label>
            <input
              id="participants"
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              disabled={loading}
              min={1}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="useAI"
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="mr-2"
              disabled={loading}
            />
            <label htmlFor="useAI" className="text-zinc-300">
              Generate questions using AI
            </label>
          </div>
          <p className="text-zinc-500 text-sm mt-1">
            AI will generate relevant questions based on your survey title and description.
          </p>
        </div>
        
        {!useAI && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-zinc-200">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-blue-600 text-white py-1 px-3 rounded text-sm"
                disabled={loading}
              >
                Add Question
              </button>
            </div>
            
            {questions.length === 0 && (
              <p className="text-zinc-500 italic">No questions added yet. Click "Add Question" to start.</p>
            )}
            
            {questions.map((question, index) => (
              <div key={question.id} className="mb-4 p-4 border border-zinc-700 rounded">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium text-zinc-300">Question {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-400 text-sm"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="mb-2">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                    className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
                    placeholder="Enter your question"
                    disabled={loading}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-zinc-400 mb-1 text-sm">Question Type</label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType })}
                    className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
                    disabled={loading}
                  >
                    <option value={QuestionType.TEXT}>Text Answer</option>
                    <option value={QuestionType.MULTI_CHOICE}>Multiple Choice</option>
                    <option value={QuestionType.RATING}>Rating</option>
                  </select>
                </div>
                
                {question.type === QuestionType.MULTI_CHOICE && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-zinc-400 text-sm">Options</label>
                      <button
                        type="button"
                        onClick={() => addOption(question.id)}
                        className="text-blue-400 text-sm"
                        disabled={loading}
                      >
                        Add Option
                      </button>
                    </div>
                    
                    {(!question.options || question.options.length === 0) && (
                      <p className="text-zinc-500 italic text-sm">No options added. Click "Add Option" to add.</p>
                    )}
                    
                    {question.options && question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                          className="flex-grow p-2 bg-zinc-800 border border-zinc-600 rounded"
                          placeholder={`Option ${optIndex + 1}`}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(question.id, optIndex)}
                          className="ml-2 text-red-400 text-sm"
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? 'Creating Survey...' : 'Create Survey'}
        </button>
      </form>
    </div>
  );
}
