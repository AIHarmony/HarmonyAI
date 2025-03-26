'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form } from '../components/Form';
import { useAuth } from '../lib/context/AuthContext';
import { usernameValidation, emailValidation, passwordValidation } from '../lib/utils/validation';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (values: RegisterFormValues) => {
    await register(values);
    router.push('/dashboard');
  };

  const fields = [
    {
      name: 'username',
      label: 'Username',
      type: 'text' as const,
      value: '',
      validation: usernameValidation,
      required: true,
      placeholder: 'Choose a username'
    },
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
      placeholder: 'Create a password'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your account
            </Link>
          </p>
        </div>
        <Form<RegisterFormValues>
          fields={fields}
          onSubmit={handleSubmit}
          submitLabel="Create Account"
          className="mt-8 space-y-6"
        />
      </div>
    </div>
  );
} 