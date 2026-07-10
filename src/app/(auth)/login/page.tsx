'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import { Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

function LoginContent() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const errorParam = searchParams.get('error') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
        router.push('/admin');
      } else if (user.role === 'DELIVERY') {
        router.push('/delivery');
      } else {
        router.push(redirect ? decodeURIComponent(redirect) : '/my-account');
      }
    }
  }, [user, redirect, router]);

  // Set error from URL param
  useEffect(() => {
    if (errorParam === 'unauthorized') {
      setError('Please log in with admin privileges to view that page.');
    } else if (errorParam === 'delivery-unauthorized') {
      setError('Please log in with delivery staff credentials to view that page.');
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const result = await login({ email, password });
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Header Branding */}
        <div className="text-center">
          <Link href="/" className="inline-block flex flex-col">
            <span className="text-2xl font-black text-brand-blue tracking-tight leading-none">
              MALA PHENYLE
            </span>
            <span className="text-[10px] font-bold text-brand-green tracking-widest mt-1">
              CHEMICAL WORKS
            </span>
          </Link>
          <h2 className="mt-6 text-xl font-black text-gray-900">Sign in to your account</h2>
          <p className="mt-1.5 text-xs font-semibold text-gray-550">
            Or{' '}
            <Link href="/register" className="font-bold text-brand-blue hover:text-brand-blue-hover underline">
              create a new customer profile
            </Link>
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white py-8 px-6 sm:px-10 border border-gray-150 rounded-3xl shadow-sm">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-800 flex gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <Lock size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-blue/10 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Guest Checkout Route if redirect parameter exists */}
          {redirect && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link href="/checkout" className="text-xs font-bold text-brand-green hover:underline">
                Continue to checkout as a Guest &rarr;
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-xs">
        Loading login gate...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
