'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { useAuth } from 'src/context/AuthContext';
import { User, ClipboardList, MapPin, Award, LogOut } from 'lucide-react';

export default function MyAccountPage() {
  const { user, logout } = useAuth();
  
  // Default mock address for demonstration
  const [address, setAddress] = useState<any>({
    name: user?.name || 'Ram Bahadur',
    mobile: user?.phone || '+977 9800000001',
    province: 'Madhesh Province',
    district: 'Parsa',
    municipality: 'Birgunj Metropolitan City',
    ward: '8',
    street: 'Maisthan Tole',
    landmark: 'Near Maisthan Temple',
  });

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight font-sans">My Account</h1>
          <p className="text-gray-550 text-sm mt-1 font-semibold">Manage your profile, shipping addresses, and order history.</p>
        </div>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Left Sidebar Menu */}
            <div className="md:col-span-1 bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="text-center py-4 border-b border-gray-100 space-y-2">
                <div className="w-14 h-14 rounded-full bg-brand-blue/5 text-brand-blue flex items-center justify-center mx-auto">
                  <User size={24} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{user.name}</h3>
                <p className="text-xs text-gray-400 font-semibold">{user.email}</p>
                {user.role === 'WHOLESALE' && (
                  <span className="inline-flex items-center gap-1 text-[9px] bg-amber-50 text-amber-700 font-black px-2 py-0.5 rounded-full border border-amber-100">
                    <Award size={10} /> Wholesale Approved
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 text-xs font-bold text-gray-600">
                <Link href="/my-account" className="px-4 py-2.5 bg-gray-50 text-brand-blue rounded-xl">
                  Dashboard Summary
                </Link>
                <Link href="/my-account/orders" className="px-4 py-2.5 hover:bg-gray-50 hover:text-brand-blue rounded-xl transition">
                  My Orders
                </Link>
                <Link href="/wholesale-register" className="px-4 py-2.5 hover:bg-gray-50 hover:text-brand-blue rounded-xl transition">
                  B2B Wholesale Application
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>

            {/* Right Account Summary */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Profile Details */}
              <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Account Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Full Name</span>
                    <span className="text-gray-900 font-bold">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Mobile Number</span>
                    <span className="text-gray-900 font-bold">{user.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Email Address</span>
                    <span className="text-gray-900 font-bold">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Account Role</span>
                    <span className="text-brand-blue font-bold uppercase">{user.role}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address Summary */}
              <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center justify-between">
                  <span>Saved Shipping Address</span>
                  <MapPin size={16} className="text-brand-blue" />
                </h3>
                <div className="text-xs font-semibold text-gray-600 space-y-1">
                  <p className="font-bold text-gray-900">{address.name}</p>
                  <p>Mobile: {address.mobile}</p>
                  <p>{address.street}, Ward {address.ward}</p>
                  <p>{address.municipality}, {address.district}</p>
                  <p>{address.province}, Nepal</p>
                  {address.landmark && <p className="text-gray-400">Landmark: {address.landmark}</p>}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
            Loading dashboard session...
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
