'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import { Mail, Lock, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

function AdminLoginContent() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in as Admin
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
      router.push('/admin');
    }
  }, [user, router]);

  useEffect(() => {
    if (errorParam === 'unauthorized') {
      setError('Administrative access required. Please authenticate.');
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
      setError(result.error || 'Invalid admin credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Logo and branding */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-brand-gold/10 text-brand-gold rounded-full border border-brand-gold/20 mb-3">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase">
            MALA PHENYLE
          </h2>
          <span className="text-[10px] font-bold text-brand-green tracking-widest block mt-1 uppercase">
            Admin Operations Panel
          </span>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 border border-white/10 py-8 px-6 sm:px-10 rounded-3xl shadow-xl text-white">
          {error && (
            <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-bold text-red-300 flex gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@malachemicals.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Operational Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-gold hover:bg-amber-600 text-brand-charcoal font-black text-xs rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Enter Admin Panel'} <ArrowRight size={14} />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-brand-gold transition font-bold">
              &larr; Back to Customer Storefront
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-12">
        <div className="text-center font-bold text-gray-500 animate-pulse">Loading Admin Gate...</div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
