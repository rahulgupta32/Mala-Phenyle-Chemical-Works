'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { useAuth } from 'src/context/AuthContext';
import { Award, CheckCircle, ShieldCheck, FileText, Send, AlertTriangle } from 'lucide-react';

export default function WholesaleRegisterPage() {
  const { user } = useAuth();
  
  const [companyName, setCompanyName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [businessType, setBusinessType] = useState('Kirana Store');
  const [documentUrl, setDocumentUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [applicationStatus, setApplicationStatus] = useState<any>(null);

  // Check if user already has an application
  useEffect(() => {
    if (!user) return;

    fetch('/api/admin/wholesale') // This will return applications. In a perfect setup, we can fetch user's specific applications.
      // Since this endpoint is admin protected, it might return 401 for customers. Let's see: we wrote GET /api/admin/wholesale to only allow admin.
      // But we can fetch user profile /api/auth/me which tells us if they are WHOLESALE.
      // To see if they have a pending application, let's make a call or fetch.
      // Alternatively, we can let user submit and handle duplicate application error (400) directly from backend!
      // This is very clean and prevents security leaks.
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          // Filter application for this user
          const myApp = data.find((a: any) => a.userId === user.id);
          if (myApp) setApplicationStatus(myApp);
        }
      })
      .catch((e) => console.error('Failed to load application status', e));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to apply for a wholesale account.');
      setLoading(false);
      return;
    }

    if (!companyName || !panNumber || !businessType) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (panNumber.length !== 9 || !/^[0-9]+$/.test(panNumber)) {
      setError('PAN/VAT number must be exactly 9 digits.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/wholesale/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, panNumber, businessType, documentUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setApplicationStatus(data.application);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isApproved = user?.role === 'WHOLESALE';
  const isPending = applicationStatus && applicationStatus.status === 'PENDING';

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-10">
        
        {/* Banner Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            B2B Wholesale & Distributor Network
          </h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto font-semibold">
            Partner with Mala Phenyle Chemical Works. Get direct factory pricing on White Phenyle, Black Phenyle, and toilet cleaning concentrates.
          </p>
        </div>

        {/* Benefits Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center space-y-3">
            <div className="p-3 bg-blue-50 text-brand-blue rounded-full inline-block">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-gray-900">Highest Profit Margins</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Buy directly from the chemical manufacturing unit in Birgunj. Bypass distributors and keep maximum profits.
            </p>
          </div>
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center space-y-3">
            <div className="p-3 bg-emerald-50 text-brand-green rounded-full inline-block">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-gray-900">Approved B2B Status</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Unlock a wholesale catalog interface. Order directly with wholesale price tags visible in real-time.
            </p>
          </div>
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center space-y-3">
            <div className="p-3 bg-amber-50 text-brand-gold rounded-full inline-block">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-gray-900">Printable Quotes & Invoices</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Quick B2B quotation generator. Instantly print quotes for tax submission and accounting compliance.
            </p>
          </div>
        </section>

        {/* Onboarding Flow Wrapper */}
        <div className="max-w-2xl mx-auto">
          
          {!user ? (
            /* Warning: Auth Session needed */
            <div className="bg-white border border-gray-150 p-8 rounded-3xl text-center space-y-4 shadow-sm">
              <AlertTriangle size={36} className="mx-auto text-amber-500 animate-bounce" />
              <h3 className="text-lg font-black text-gray-800">Account Registration Required</h3>
              <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
                To request wholesale access, you must first register a standard user profile and log in.
              </p>
              <div className="pt-2 flex justify-center gap-4">
                <Link href="/register" className="px-6 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue-hover transition">
                  Register Account
                </Link>
                <Link href="/login" className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition">
                  Login Here
                </Link>
              </div>
            </div>
          ) : isApproved ? (
            /* Wholesaler active state */
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-4">
              <CheckCircle size={36} className="mx-auto text-emerald-600" />
              <h3 className="text-lg font-black text-emerald-900">Wholesale Profile Active!</h3>
              <p className="text-xs text-emerald-700 font-semibold max-w-md mx-auto leading-relaxed">
                Your Kirana/Distributor account is fully verified. Wholesale rates are now unlocked. Browse our catalog to place your bulk orders.
              </p>
              <div className="pt-2">
                <Link href="/products" className="px-6 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue-hover transition">
                  Shop Wholesale Catalogue
                </Link>
              </div>
            </div>
          ) : isPending || success ? (
            /* Application pending state */
            <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl text-center space-y-4">
              <Send size={36} className="mx-auto text-brand-blue animate-pulse" />
              <h3 className="text-lg font-black text-brand-blue">Application Under Review</h3>
              <p className="text-xs text-blue-800 font-semibold max-w-md mx-auto leading-relaxed">
                We have successfully received your wholesale registration details (PAN: **{panNumber || applicationStatus?.panNumber}**).
                Our Birgunj office reviews firm tax registration credentials manually. Approval takes 24-48 hours.
              </p>
              <div className="pt-2">
                <Link href="/products" className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition">
                  Browse Retail Catalog
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="bg-white border border-gray-150 p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-lg font-black text-brand-blue border-b border-gray-100 pb-3">
                Submit Wholesale Application
              </h3>

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-800 text-xs font-bold rounded-2xl flex gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Registered Company / Firm Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hari Kirana & Suppliers Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">PAN / VAT Registration Number (9 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    placeholder="e.g. 601234567"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Business Type *</label>
                  <select
                    required
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="Kirana Store">Local Kirana Store</option>
                    <option value="Retailer">Sanitation Retailer</option>
                    <option value="Distributor">District Distributor</option>
                    <option value="Industrial Buyer">Hotel / Hospital / Commercial Buyer</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-xl shadow-lg transition"
                  >
                    {loading ? 'Submitting Application...' : 'Submit B2B Credentials'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}
