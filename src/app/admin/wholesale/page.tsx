'use client';

import React, { useState, useEffect } from 'react';
import { Award, Check, X, ShieldAlert, AlertTriangle, UserCheck } from 'lucide-react';

export default function AdminWholesalePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('PENDING');
  const [reviewingApp, setReviewingApp] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [minOrderVal, setMinOrderVal] = useState('10000');
  const [modalLoading, setModalLoading] = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFilter !== 'ALL') params.append('status', selectedFilter);
      const res = await fetch(`/api/admin/wholesale?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error('Failed to load applications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [selectedFilter]);

  const openReviewModal = (app: any) => {
    setReviewingApp(app);
    setReviewNotes(app.adminNotes || '');
    setReviewModalOpen(true);
  };

  const handleReviewAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewingApp) return;

    setModalLoading(true);
    try {
      const res = await fetch('/api/admin/wholesale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: reviewingApp.id,
          status,
          adminNotes: reviewNotes,
          minOrderValue: status === 'APPROVED' ? Number(minOrderVal) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Application has been ${status.toLowerCase()} successfully!`);
        setReviewModalOpen(false);
        loadApplications(); // Refresh list
      } else {
        alert(data.error || 'Failed to review application');
      }
    } catch (err) {
      alert('Network error occurred.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Wholesale Applications</h1>
        <p className="text-gray-555 text-xs mt-1 font-semibold">Review company profiles, verify PAN registrations, and approve B2B accounts.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white p-4 border border-gray-150 rounded-2xl shadow-sm gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedFilter(status)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition border ${
              selectedFilter === status
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
          Loading wholesale applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl text-gray-400 font-bold text-xs">
          No applications registered under status &quot;{selectedFilter}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-blue/20 transition"
            >
              <div className="space-y-3 text-xs font-semibold text-gray-600">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <h3 className="text-sm font-black text-gray-900 leading-snug">{app.companyName}</h3>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    app.status === 'APPROVED' ? 'bg-emerald-50 text-brand-green border border-emerald-100' :
                    app.status === 'REJECTED' ? 'bg-red-50 text-red-750 border border-red-100' :
                    'bg-amber-50 text-brand-gold border border-amber-100'
                  }`}>
                    {app.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-450 block">PAN / VAT Number</span>
                    <span className="text-gray-900 font-bold">{app.panNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-455 block">Business Category</span>
                    <span className="text-gray-900 font-bold">{app.businessType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 block">Authorized Person</span>
                    <span className="text-gray-900 font-bold">{app.user.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 block">Contact Phone</span>
                    <span className="text-gray-900 font-bold">{app.user.phone || 'No phone'}</span>
                  </div>
                </div>

                {app.adminNotes && (
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px]">
                    <span className="text-gray-400 font-bold uppercase block mb-0.5">Admin Notes</span>
                    <p className="text-gray-600 font-semibold">{app.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {app.status === 'PENDING' && (
                <div className="pt-2">
                  <button
                    onClick={() => openReviewModal(app)}
                    className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <UserCheck size={14} /> Review B2B application
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Dialog */}
      {reviewModalOpen && reviewingApp && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative text-xs font-semibold text-gray-650">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-gray-900">Review Wholesale Request</h2>
              <button onClick={() => setReviewModalOpen(false)} className="p-1.5 hover:bg-gray-50 rounded-full transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5">
                <p className="text-gray-900 font-black text-sm">{reviewingApp.companyName}</p>
                <p>PAN Number: {reviewingApp.panNumber}</p>
                <p>Type: {reviewingApp.businessType}</p>
                <p>Authorized Person: {reviewingApp.user.name}</p>
              </div>

              {/* Set Minimum Order Value limit */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">
                  Minimum Order Value Limit (Rs.)
                </label>
                <input
                  type="number"
                  value={minOrderVal}
                  onChange={(e) => setMinOrderVal(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">
                  Administrative Review Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Verify company registration status..."
                  className="w-full bg-gray-55 border border-gray-200 rounded-xl py-3 px-4 text-xs focus:outline-none"
                />
              </div>

              {/* Approve/Reject Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={() => handleReviewAction('REJECTED')}
                  className="w-1/2 py-3 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <X size={14} /> Reject Request
                </button>
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={() => handleReviewAction('APPROVED')}
                  className="w-1/2 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Check size={14} /> Approve B2B Account
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
