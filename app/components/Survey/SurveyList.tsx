'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSurvey } from '../../hooks/useSurvey';
import { Survey, SurveyCategory } from '../../services/SurveyService';
import { useAuth } from '../../hooks/useAuth';

interface SurveyListProps {
  type?: 'all' | 'user' | 'active';
  limit?: number;
  showCategory?: boolean;
  showCreator?: boolean;
}

export default function SurveyList({ 
  type = 'active', 
  limit,
  showCategory = true,
  showCreator = false 
}: SurveyListProps) {
  const { surveys, loading, error, loadSurveys, loadUserSurveys } = useSurvey();
  const { user } = useAuth();
  
  useEffect(() => {
    if (type === 'user' && user) {
      loadUserSurveys();
    } else {
      loadSurveys();
    }
  }, [type, user, loadSurveys, loadUserSurveys]);
  
  const displaySurveys = limit ? surveys.slice(0, limit) : surveys;
  
  const getCategoryColor = (category: SurveyCategory): string => {
    const colors = {
      [SurveyCategory.TECHNOLOGY]: 'bg-blue-500',
      [SurveyCategory.FINANCE]: 'bg-green-500',
      [SurveyCategory.HEALTH]: 'bg-red-500',
      [SurveyCategory.EDUCATION]: 'bg-purple-500',
      [SurveyCategory.ENTERTAINMENT]: 'bg-yellow-500',
      [SurveyCategory.OTHER]: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };
  
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded mb-4">
        {error}
      </div>
    );
  }
  
  if (displaySurveys.length === 0) {
    return (
      <div className="bg-zinc-800 rounded-lg p-6 text-center">
        <p className="text-zinc-400">
          {type === 'user' 
            ? "You haven't created any surveys yet." 
            : "No surveys available at the moment."}
        </p>
        {type === 'user' && (
          <Link href="/create" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
            Create Your First Survey
          </Link>
        )}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {displaySurveys.map((survey: Survey) => (
        <Link 
          key={survey.id} 
          href={`/surveys/${survey.id}`}
          className="block bg-zinc-800 hover:bg-zinc-700 transition rounded-lg overflow-hidden shadow-md"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-white">{survey.title}</h3>
              {showCategory && (
                <span 
                  className={`text-xs text-white px-2 py-1 rounded ${getCategoryColor(survey.category)}`}
                >
                  {survey.category}
                </span>
              )}
            </div>
            
            <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{survey.description}</p>
            
            <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {survey.estimatedTimeMinutes} min
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {survey.rewardPerParticipant} HAI
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {survey.participations.length}/{survey.maxParticipants}
              </div>
              
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(survey.createdAt)}
              </div>
            </div>
            
            {showCreator && (
              <div className="mt-3 pt-3 border-t border-zinc-700">
                <div className="flex items-center text-sm">
                  <span className="text-zinc-500">Created by:</span>
                  <span className="ml-2 text-blue-400">{survey.creatorId}</span>
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
