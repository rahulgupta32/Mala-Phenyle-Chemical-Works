'use client';

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Info, Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportPhoneAlternative, setSupportPhoneAlternative] = useState('');
  const [whatsappViber, setWhatsappViber] = useState('');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [minWholesaleOrderAmount, setMinWholesaleOrderAmount] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [codEnabled, setCodEnabled] = useState(true);
  const [esewaEnabled, setEsewaEnabled] = useState(false);
  const [khaltiEnabled, setKhaltiEnabled] = useState(false);
  const [fonepayEnabled, setFonepayEnabled] = useState(false);
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        
        // Populate inputs
        setBusinessName(data.businessName || '');
        setBusinessAddress(data.businessAddress || '');
        setSupportEmail(data.supportEmail || '');
        setSupportPhone(data.supportPhone || '');
        setSupportPhoneAlternative(data.supportPhoneAlternative || '');
        setWhatsappViber(data.whatsappViber || '');
        setFreeDeliveryThreshold(String(data.freeDeliveryThreshold || '2000'));
        setMinWholesaleOrderAmount(String(data.minWholesaleOrderAmount || '10000'));
        setAnnouncementText(data.announcementText || '');
        setCodEnabled(data.codEnabled !== undefined ? data.codEnabled : true);
        setEsewaEnabled(data.esewaEnabled !== undefined ? data.esewaEnabled : false);
        setKhaltiEnabled(data.khaltiEnabled !== undefined ? data.khaltiEnabled : false);
        setFonepayEnabled(data.fonepayEnabled !== undefined ? data.fonepayEnabled : false);
        setFacebookUrl(data.facebookUrl || '');
        setInstagramUrl(data.instagramUrl || '');
      }
    } catch (e) {
      console.error('Failed to fetch settings in dashboard settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/shop-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessAddress,
          supportEmail,
          supportPhone,
          supportPhoneAlternative,
          whatsappViber,
          freeDeliveryThreshold: Number(freeDeliveryThreshold),
          minWholesaleOrderAmount: Number(minWholesaleOrderAmount),
          announcementText,
          codEnabled,
          esewaEnabled,
          khaltiEnabled,
          fonepayEnabled,
          facebookUrl,
          instagramUrl,
        }),
      });

      if (res.ok) {
        alert('Settings updated successfully!');
        loadSettings(); // Reload to sync
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save settings');
      }
    } catch (err) {
      alert('Network error. Settings not saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Shop Configurations</h1>
        <p className="text-gray-555 text-xs mt-1 font-semibold">Customize business details, announcement banners, and payment methods.</p>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
          Loading shop settings...
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-xs font-semibold text-gray-650">
          
          {/* Section 1: Business Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1">
              General Identity Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Location Address *</label>
                <input
                  type="text"
                  required
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Announcement Banner Text</label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Contact Numbers & Viber */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">
              Customer Support Contacts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Primary Phone *</label>
                <input
                  type="text"
                  required
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Alternative Phone</label>
                <input
                  type="text"
                  value={supportPhoneAlternative}
                  onChange={(e) => setSupportPhoneAlternative(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">WhatsApp / Viber Number *</label>
                <input
                  type="text"
                  required
                  value={whatsappViber}
                  onChange={(e) => setWhatsappViber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Support Email *</label>
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery and wholesale thresholds */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">
              Delivery & Order Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Free Delivery Threshold (Rs.) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 font-semibold block mt-1">Retail orders above this subtotal qualify for Rs. 0 delivery charge.</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Minimum Wholesale Order Value (Rs.) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={minWholesaleOrderAmount}
                  onChange={(e) => setMinWholesaleOrderAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 font-semibold block mt-1">Enforced threshold limit for wholesale account checkouts.</span>
              </div>
            </div>
          </div>

          {/* Section 4: Payment Gateways Configuration */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <span>Fulfillment & Payment Gateways</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 p-3 bg-gray-55 border border-gray-150 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                />
                <span className="text-xs font-bold text-gray-800">Cash on Delivery (COD)</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-gray-55 border border-gray-150 rounded-xl cursor-pointer opacity-70">
                <input
                  type="checkbox"
                  checked={esewaEnabled}
                  onChange={(e) => setEsewaEnabled(e.target.checked)}
                />
                <div className="text-xs font-bold text-gray-800">
                  <p>eSewa Wallet</p>
                  <span className="inline-block text-[9px] bg-amber-50 text-amber-700 font-black px-1.5 rounded mt-0.5 uppercase border border-amber-100">Placeholder</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 bg-gray-55 border border-gray-150 rounded-xl cursor-pointer opacity-70">
                <input
                  type="checkbox"
                  checked={khaltiEnabled}
                  onChange={(e) => setKhaltiEnabled(e.target.checked)}
                />
                <div className="text-xs font-bold text-gray-800">
                  <p>Khalti Wallet</p>
                  <span className="inline-block text-[9px] bg-amber-50 text-amber-700 font-black px-1.5 rounded mt-0.5 uppercase border border-amber-100">Placeholder</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 bg-gray-55 border border-gray-150 rounded-xl cursor-pointer opacity-70">
                <input
                  type="checkbox"
                  checked={fonepayEnabled}
                  onChange={(e) => setFonepayEnabled(e.target.checked)}
                />
                <div className="text-xs font-bold text-gray-800">
                  <p>Fonepay Scan</p>
                  <span className="inline-block text-[9px] bg-amber-50 text-amber-700 font-black px-1.5 rounded mt-0.5 uppercase border border-amber-100">Placeholder</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 5: Social Links */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">
              Social Media Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Facebook Page Link</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-2">Instagram Link</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-black rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Save size={14} /> {saving ? 'Saving Settings...' : 'Save Configurations'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
