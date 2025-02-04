'use client';

import AulasName from '@/components/AulasName';
import { Button } from '@/components/ui/button';
import { loginAction } from '@/lib/actions/login.action';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams to get query params
import React from 'react';

const LoginPage = () => {
  const searchParams = useSearchParams(); // Get the query parameters
  const error = searchParams.get('error'); // Extract the 'error' parameter

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100">
      <AulasName />
      <form
        action={loginAction} 
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-indigo-900">Log In</h2>



        <div className="mb-4">
          <label htmlFor="email" className="block text-indigo-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-indigo-700">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            Error: {error}
          </div>
        )}
        <Button type="submit" className="bg-indigo-800">Log In</Button>
        <p className="mt-4 text-sm text-neutral-500">
          You don't have an account?{' '}
          <a href="/register" className="text-blue-600">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;