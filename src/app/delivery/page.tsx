'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from 'src/context/AuthContext';
import { Truck, MapPin, ClipboardList, LogOut, ChevronRight } from 'lucide-react';

export default function DeliveryDashboardPage() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Fetch orders assigned to the delivery agent
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setAssignments(data.orders);
      })
      .catch((e) => console.error('Failed to load delivery assignments', e))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Mobile-optimized Header */}
      <header className="bg-brand-charcoal text-white py-4 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <Truck className="text-brand-green animate-pulse" size={20} />
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase leading-none">Mala Phenyle</h1>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Delivery Portal</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs font-bold text-red-400 flex items-center gap-1 hover:text-red-300 transition"
        >
          <LogOut size={14} /> Exit
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6 space-y-6">
        
        {/* Welcome Block */}
        {user && (
          <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Welcome Back</p>
            <h2 className="text-base font-black text-gray-900 leading-snug">{user.name}</h2>
            <p className="text-[10px] text-brand-green font-bold uppercase tracking-wider">Courier Dispatch Staff</p>
          </div>
        )}

        {/* Assigned Orders List Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">
            My Assigned Orders
          </h3>

          {loading ? (
            <div className="h-40 bg-white border border-gray-150 rounded-2xl animate-pulse flex items-center justify-center text-gray-450 font-bold text-xs">
              Loading courier assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-150 rounded-2xl text-gray-400 text-xs font-bold">
              No delivery jobs assigned to you today.
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((ord) => (
                <Link
                  key={ord.id}
                  href={`/delivery/${ord.id}`}
                  className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm hover:border-brand-blue/20 transition flex items-center justify-between gap-4 block group"
                >
                  <div className="space-y-2 text-xs font-semibold text-gray-650 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="inline-block bg-brand-blue/5 text-brand-blue px-2 py-0.5 rounded text-[10px] font-bold">
                        {ord.orderNumber}
                      </span>
                      <span className={`inline-block text-[9px] font-black uppercase ${
                        ord.orderStatus === 'DELIVERED' ? 'text-brand-green' : 
                        ord.orderStatus === 'CANCELLED' ? 'text-red-650' : 'text-brand-blue'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-1 text-gray-500 font-medium">
                      <p className="font-bold text-gray-900 text-sm">{ord.address.name}</p>
                      <p className="flex items-center gap-1"><MapPin size={12} /> {ord.address.street}, Ward {ord.address.ward}</p>
                      <p className="text-gray-400">{ord.address.municipality}, {ord.address.district}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex justify-between text-[11px] font-bold text-gray-900">
                      <span>Grand Total:</span>
                      <span className="text-brand-blue font-black">Rs. {Number(ord.grandTotal).toLocaleString()}</span>
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition" />
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Mini Copyright Footer */}
      <footer className="py-6 text-center text-[10px] text-gray-400 font-medium bg-gray-100 border-t border-gray-150">
        <p>&copy; {new Date().getFullYear()} Mala Phenyle Chemical Works</p>
        <p className="mt-0.5">Birgunj Operations Desk</p>
      </footer>
    </div>
  );
}
