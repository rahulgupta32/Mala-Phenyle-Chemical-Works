'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles, PhoneCall } from 'lucide-react';

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-gray-50 to-emerald-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-brand-blue/5 blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-brand-green/5 blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto space-y-8 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex flex-col items-center group">
            <span className="text-3xl font-black text-brand-blue tracking-tight leading-none transition-transform duration-300 group-hover:scale-105">
              MALA PHENYLE
            </span>
            <span className="text-[11px] font-black text-brand-green tracking-[0.25em] mt-1.5 uppercase">
              Chemical Works
            </span>
          </Link>
          <div className="pt-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign in to your profile</h2>
            <p className="mt-2 text-xs font-semibold text-gray-500">
              Or{' '}
              <Link href="/register" className="font-bold text-brand-blue hover:text-brand-blue-hover underline transition-colors">
                create a new customer profile
              </Link>
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/90 backdrop-blur-md py-8 px-6 sm:px-10 border border-white/60 rounded-3xl shadow-xl shadow-brand-blue/5 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Top Gradient Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-blue-600 to-brand-green" />

          {error && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-800 flex gap-2.5 items-start animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder="ram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-55/55 border border-gray-200/80 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all duration-200"
                />
                <Mail size={15} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-brand-blue transition-colors duration-200" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-55/55 border border-gray-200/80 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 transition-all duration-200"
                />
                <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-brand-blue transition-colors duration-200" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-blue to-blue-800 hover:from-brand-blue-hover hover:to-blue-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-blue/15 hover:shadow-xl hover:shadow-brand-blue/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Guest Checkout Route if redirect parameter exists */}
          {redirect && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link href="/checkout" className="text-xs font-bold text-brand-green hover:text-brand-green-hover hover:underline transition-colors">
                Continue to checkout as a Guest &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Footer Support Badge */}
        <div className="bg-white/60 backdrop-blur-sm p-4 border border-gray-150 rounded-2xl flex items-center justify-between text-[11px] font-semibold text-gray-500 shadow-sm max-w-sm mx-auto">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" /> Need wholesale support?
          </span>
          <a href="tel:+9779855033186" className="flex items-center gap-1 text-brand-blue hover:text-brand-blue-hover font-bold transition-colors">
            <PhoneCall size={12} /> Call Us
          </a>
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
