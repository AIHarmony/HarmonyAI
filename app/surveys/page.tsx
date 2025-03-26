'use client';

import React, { useEffect, useState } from 'react';
import { useSurvey } from '../lib/context/SurveyContext';
import { useAuth } from '../lib/context/AuthContext';
import Link from 'next/link';
import { formatDate, formatCurrency } from '../lib/utils';
import { Survey, SurveyCategory } from '../lib/types';
import { SURVEY_CATEGORIES } from '../lib/constants';

export default function SurveysPage() {
  const { surveys, loadSurveys, loading } = useSurvey();
  const { isLoggedIn } = useAuth();
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SurveyCategory | 'All'>('All');

  // Load surveys when component mounts
  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  // Filter surveys based on search term and category
  useEffect(() => {
    let result = [...surveys];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        survey => 
          survey.title.toLowerCase().includes(term) || 
          survey.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(survey => survey.category === selectedCategory);
    }
    
    // Filter out drafts for non-creators
    result = result.filter(survey => 
      survey.status !== 'draft' || (isLoggedIn && survey.creatorId === 'user1') // Assuming current user is 'user1' for demo
    );
    
    setFilteredSurveys(result);
  }, [surveys, searchTerm, selectedCategory, isLoggedIn]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Surveys</h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse and participate in research surveys to earn rewards
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {/* Search */}
            <div className="col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Category filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SurveyCategory | 'All')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Categories</option>
                {SURVEY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Survey list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-lg text-gray-600">Loading surveys...</p>
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No surveys found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your filters to find more surveys'
                : 'There are no active surveys at the moment'}
            </p>
            {isLoggedIn && (
              <Link
                href="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create New Survey
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SurveyCard({ survey }: { survey: Survey }) {
  const { isLoggedIn } = useAuth();
  const isCreator = isLoggedIn && survey.creatorId === 'user1'; // Assuming current user is 'user1' for demo
  
  // Calculate participation rate for progress bar
  const participationRate = Math.min(
    100,
    Math.round((survey.participations.length / survey.targetParticipants) * 100)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {survey.title}
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(survey.status)}`}>
            {survey.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-3 mb-4">
          {survey.description}
        </p>
        
        {/* Category */}
        <div className="mb-4">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs font-medium text-blue-700">
            {survey.category}
          </span>
        </div>
        
        {/* Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reward:</span>
            <span className="font-medium text-gray-900">{formatCurrency(survey.reward)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Questions:</span>
            <span className="font-medium text-gray-900">{survey.questions.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Created:</span>
            <span className="font-medium text-gray-900">{formatDate(survey.createdAt)}</span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Participation:</span>
              <span className="font-medium text-gray-900">
                {survey.participations.length}/{survey.targetParticipants}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${participationRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        {isCreator ? (
          <div className="flex justify-between">
            <Link
              href={`/surveys/${survey.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View Details
            </Link>
            {survey.status === 'completed' && (
              <Link
                href={`/surveys/${survey.id}/analyze`}
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                Analyze Results
              </Link>
            )}
          </div>
        ) : (
          <Link
            href={`/surveys/${survey.id}`}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Participate
          </Link>
        )}
      </div>
    </div>
  );
}

// Helper function to get status color
function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'analyzed':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
