'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './lib/context/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const { isLoggedIn, login, register, error: authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showRegister = searchParams.get('register') === 'true';
  
  const [isRegistering, setIsRegistering] = useState(showRegister);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if user is already logged in
  if (isLoggedIn) {
    router.push('/dashboard');
    return null;
  }

  const validateForm = (): boolean => {
    setError(null);
    
    if (isRegistering) {
      // Registration validation
      if (!username.trim()) {
        setError('Username is required');
        return false;
      }
      
      if (!email.trim()) {
        setError('Email is required');
        return false;
      }
      
      if (!password.trim()) {
        setError('Password is required');
        return false;
      }
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    } else {
      // Login validation
      if (!email.trim()) {
        setError('Email is required');
        return false;
      }
      
      if (!password.trim()) {
        setError('Password is required');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let success = false;
      
      if (isRegistering) {
        // Handle registration
        success = await register({
          username,
          email,
          password
        });
      } else {
        // Handle login
        success = await login({
          email,
          password
        });
      }
      
      if (success) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                HarmonyAI: Decentralized User Research Platform
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Revolutionizing user research with AI and blockchain. Create surveys, earn rewards, and gain valuable insights.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/surveys"
                  className="bg-white text-blue-700 px-6 py-3 rounded-md font-medium hover:bg-blue-50"
                >
                  Browse Surveys
                </Link>
                {!isRegistering && (
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
            
            {/* Auth Form */}
            <div className="md:w-5/12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between mb-6">
                  <button
                    onClick={() => setIsRegistering(false)}
                    className={`text-lg font-medium ${
                      !isRegistering
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsRegistering(true)}
                    className={`text-lg font-medium ${
                      isRegistering
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Register
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {isRegistering && (
                    <div className="mb-4">
                      <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {isRegistering && (
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  
                  {(error || authError) && (
                    <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
                      {error || authError}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading
                      ? 'Processing...'
                      : isRegistering
                      ? 'Create Account'
                      : 'Login'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Enhanced Surveys</h3>
              <p className="text-gray-600">
                Leverage artificial intelligence to create professional surveys and analyze responses with advanced natural language processing.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-md flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Token Rewards</h3>
              <p className="text-gray-600">
                Earn tokens for participating in surveys and research studies. Creators can incentivize quality responses with token rewards.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Decentralized</h3>
              <p className="text-gray-600">
                Built on Solana blockchain to ensure data integrity, transparency, and secure token transactions for all platform activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">
                Register and connect your Solana wallet to start using the platform.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create or Join Surveys</h3>
              <p className="text-gray-600">
                Create research surveys with AI assistance or participate in existing ones.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Earn Rewards</h3>
              <p className="text-gray-600">
                Get token rewards for quality participation or collect insights as a researcher.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Analyze Results</h3>
              <p className="text-gray-600">
                Use AI-powered analytics to gain valuable insights from survey responses.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
