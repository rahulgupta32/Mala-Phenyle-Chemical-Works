'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { useAuth } from 'src/context/AuthContext';
import { User, ClipboardList, LogOut, Award, HelpCircle } from 'lucide-react';

export default function MyOrdersPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((e) => console.error('Failed to load customer orders', e))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-550 text-sm mt-1 font-semibold">Track and view invoices for all your chemical purchases.</p>
        </div>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Sidebar Menu */}
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
                <Link href="/my-account" className="px-4 py-2.5 hover:bg-gray-55 hover:text-brand-blue rounded-xl transition">
                  Dashboard Summary
                </Link>
                <Link href="/my-account/orders" className="px-4 py-2.5 bg-gray-50 text-brand-blue rounded-xl">
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

            {/* Right Orders List */}
            <div className="md:col-span-2 space-y-4">
              {loading ? (
                <div className="h-64 bg-white border border-gray-100 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
                  Loading order history...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-150 rounded-3xl space-y-4">
                  <ClipboardList size={36} className="mx-auto text-gray-300 animate-pulse" />
                  <h4 className="font-bold text-gray-700 text-sm">No orders placed yet</h4>
                  <p className="text-[10px] text-gray-400 max-w-xs mx-auto font-semibold">
                    You have not placed any orders under this profile. Check out our catalog to place your first Cash on Delivery order!
                  </p>
                  <Link href="/products" className="inline-block px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl transition">
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                /* Orders Table/List */
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-blue/20 transition group"
                    >
                      <div className="space-y-1 text-xs font-semibold text-gray-500">
                        <div className="inline-flex bg-brand-blue/5 text-brand-blue px-2.5 py-0.5 rounded-full font-bold">
                          {ord.orderNumber}
                        </div>
                        <p className="text-gray-900 font-bold text-sm pt-1">
                          Rs. {Number(ord.grandTotal).toLocaleString()}
                        </p>
                        <p>Date: {new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto gap-4">
                        <div className="flex flex-col sm:items-end">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Shipment Status</span>
                          <span className={`inline-block font-extrabold text-[10px] uppercase ${
                            ord.orderStatus === 'DELIVERED' ? 'text-brand-green' : 
                            ord.orderStatus === 'CANCELLED' ? 'text-red-600' : 'text-brand-blue'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </div>
                        <Link
                          href={`/my-account/orders/${ord.id}`}
                          className="px-4 py-2 bg-brand-gray border border-gray-250 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition shrink-0"
                        >
                          Track / Invoice
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
            Loading session orders...
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
