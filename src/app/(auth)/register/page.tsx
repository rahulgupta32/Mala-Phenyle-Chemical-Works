'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from 'src/context/AuthContext';
import { Mail, Lock, User, Phone, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !phone) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    const result = await register({ name, email, password, phone });
    if (!result.success) {
      setError(result.error || 'Registration failed');
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
          <h2 className="mt-6 text-xl font-black text-gray-900">Create a new profile</h2>
          <p className="mt-1.5 text-xs font-semibold text-gray-550">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-brand-blue hover:text-brand-blue-hover underline">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Register Card */}
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
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ram Bahadur"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <User size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="ram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98550xxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <Phone size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
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
                  placeholder="Min. 6 characters"
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
                {loading ? 'Creating Account...' : 'Register Profile'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
