'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form } from '../components/Form';
import { useAuth } from '../lib/context/AuthContext';
import { emailValidation, passwordValidation } from '../lib/utils/validation';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (values: LoginFormValues) => {
    await login(values);
    router.push('/dashboard');
  };

  const fields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      value: '',
      validation: emailValidation,
      required: true,
      placeholder: 'Enter your email'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      value: '',
      validation: passwordValidation,
      required: true,
      placeholder: 'Enter your password'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        <Form<LoginFormValues>
          fields={fields}
          onSubmit={handleSubmit}
          submitLabel="Sign in"
          className="mt-8 space-y-6"
        />
      </div>
    </div>
  );
} 