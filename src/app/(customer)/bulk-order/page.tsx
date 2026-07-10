'use client';

import React, { useState } from 'react';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { Send, CheckCircle, ShieldCheck, Mail, Phone, Factory } from 'lucide-react';

export default function BulkOrderPage() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [requirements, setRequirements] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate submission (Phase 2 connects this to /api/wholesale/quotations)
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Request Factory Quotation</h1>
          <p className="text-gray-550 text-sm max-w-lg mx-auto font-semibold">
            Planning a bulk purchase for school sanitizing, hospital disinfectants, or municipal cleaning? Fill in your details below for custom pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Form */}
          <div className="md:col-span-7 bg-white border border-gray-150 p-6 sm:p-8 rounded-3xl shadow-sm">
            {success ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle size={40} className="text-brand-green mx-auto" />
                <h3 className="text-lg font-black text-gray-800">Quotation Request Submitted</h3>
                <p className="text-xs text-gray-500 font-semibold max-w-xs mx-auto">
                  We have logged your quotation request. Sunil Gupta and the Birgunj factory sales desk will call you shortly at **{mobile}** with custom pricing options.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-gray-650">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Company Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Sagarmatha School"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98550xxxxx"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. mail@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Describe Chemical Volumes Needed *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. 50 cans of White Phenyle 5L, 20 bottles of Toilet Cleaner 1L, etc."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-200 rounded-xl py-3 px-4 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Special Instructions / Shipping Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Requires delivery to Pokhara terminal"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-200 rounded-xl py-3 px-4 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Send size={14} /> {loading ? 'Sending Request...' : 'Send Quotation Request'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Guidelines Sidebar */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-brand-blue to-primary-800 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1">
                <Factory size={16} /> Direct Factory logistics
              </h3>
              <p className="text-xs text-gray-300 font-semibold leading-relaxed">
                By purchasing in bulk (above 50 liters or carton packages), we arrange direct chemical container logistics from our Birgunj production site to any major transportation hub in Nepal.
              </p>
              <div className="space-y-2.5 text-xs text-gray-200 border-t border-white/10 pt-4">
                <p className="flex items-center gap-2 font-bold"><Phone size={14} className="text-brand-green" /> Tel: +977 9855033186</p>
                <p className="flex items-center gap-2 font-bold"><Mail size={14} className="text-brand-gold" /> Sunilgupta335566@gmail.com</p>
              </div>
            </div>

            <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-sm text-xs font-semibold text-gray-500 space-y-3">
              <h4 className="text-gray-900 font-bold uppercase border-b border-gray-100 pb-2">Wholesale Rules</h4>
              <p>1. Minimum B2B order value: Rs. 10,000.</p>
              <p>2. Direct tax invoices (PAN/VAT receipt) generated for corporate audits.</p>
              <p>3. Flexible credit terms available for verified, long-term distributors.</p>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}
