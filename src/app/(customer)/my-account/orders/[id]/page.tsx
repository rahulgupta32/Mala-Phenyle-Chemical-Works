'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { useAuth } from 'src/context/AuthContext';
import { User, ClipboardList, LogOut, Award, ChevronLeft, MapPin, Truck, Calendar, DollarSign, Package, Printer, AlertTriangle, CheckCircle } from 'lucide-react';
import { OrderStatus } from '@prisma/client';

export default function OrderDetailPage() {
  const { user, logout } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
      })
      .catch((e) => console.error('Failed to load order', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? This will restore item stock levels.')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: OrderStatus.CANCELLED,
          trackingNote: 'Order cancelled by customer.',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Order cancelled successfully. Stock levels restored.');
        fetchOrder(); // Reload order data
      } else {
        alert(data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Network error. Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  // Helper to determine status steps
  const statuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const getStatusIndex = (currentStatus: string) => {
    return statuses.indexOf(currentStatus);
  };

  const isCancellable = order && (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED');

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8 print-container">
        
        {/* Back Link */}
        <div className="no-print">
          <Link
            href="/my-account/orders"
            className="text-xs font-bold text-gray-500 hover:text-brand-blue flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Back to My Orders
          </Link>
        </div>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Sidebar Menu */}
            <div className="md:col-span-1 bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-3 no-print">
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
                <Link href="/my-account" className="px-4 py-2.5 hover:bg-gray-50 hover:text-brand-blue rounded-xl transition">
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

            {/* Right Details Panel */}
            <div className="md:col-span-2 space-y-6">
              
              {loading ? (
                <div className="h-64 bg-white border border-gray-100 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
                  Loading order details...
                </div>
              ) : error ? (
                <div className="p-6 bg-white border border-gray-150 rounded-3xl text-center text-red-700 font-bold text-sm">
                  {error}
                </div>
              ) : order ? (
                <>
                  {/* Headline */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 print:border-none no-print">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-gray-900">
                        Order Details: {order.orderNumber}
                      </h2>
                      <p className="text-xs text-gray-500 font-semibold">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 shadow-sm transition flex items-center gap-2"
                      >
                        <Printer size={14} /> Print Receipt
                      </button>
                      
                      {isCancellable && (
                        <button
                          onClick={handleCancelOrder}
                          disabled={cancelling}
                          className="px-4 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-xl hover:bg-red-100 transition"
                        >
                          {cancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tracking Timeline (no-print) */}
                  <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-sm space-y-6 no-print">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Package Progress</h3>
                    
                    {order.orderStatus === 'CANCELLED' ? (
                      <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-xl text-xs font-bold flex gap-2">
                        <AlertTriangle size={16} className="shrink-0" />
                        <div>
                          <p>Order Cancelled</p>
                          <p className="font-semibold text-red-600 mt-1">This order was cancelled. Stock counts have been restored.</p>
                        </div>
                      </div>
                    ) : order.orderStatus === 'RETURNED' ? (
                      <div className="p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold flex gap-2">
                        <AlertTriangle size={16} className="shrink-0" />
                        <div>
                          <p>Order Returned</p>
                          <p className="font-semibold text-gray-550 mt-1">This package was returned to our Birgunj factory.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative pl-8 sm:pl-0 pt-2 pb-2">
                        {/* Progress Line */}
                        <div className="absolute left-3.5 sm:left-auto sm:top-4 sm:left-10 sm:right-10 h-full sm:h-1 bg-gray-200 -translate-x-1/2 sm:translate-y-[-50%] z-0">
                          <div
                            className="bg-brand-green h-full sm:h-1 transition-all duration-500"
                            style={{
                              width: `${Math.max(0, (getStatusIndex(order.orderStatus) / (statuses.length - 1)) * 100)}%`,
                              height: '100%'
                            }}
                          ></div>
                        </div>

                        {/* Steps */}
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 pl-4 sm:pl-0">
                          {statuses.map((step, idx) => {
                            const isActive = getStatusIndex(order.orderStatus) >= idx;
                            const isCurrent = order.orderStatus === step;

                            const labels: Record<string, string> = {
                              PENDING: 'Placed',
                              CONFIRMED: 'Confirmed',
                              PACKED: 'Packed',
                              SHIPPED: 'Shipped',
                              OUT_FOR_DELIVERY: 'Out for Delivery',
                              DELIVERED: 'Delivered',
                            };

                            return (
                              <div key={step} className="flex sm:flex-col items-start sm:items-center text-center gap-3 sm:gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition ${
                                  isActive
                                    ? 'bg-brand-green border-brand-green text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-400'
                                } ${isCurrent ? 'ring-4 ring-brand-green/20 scale-110' : ''}`}>
                                  {idx + 1}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                  isActive ? 'text-gray-800' : 'text-gray-450'
                                } ${isCurrent ? 'text-brand-green font-extrabold' : ''}`}>
                                  {labels[step]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex items-start gap-2.5 text-xs">
                      <Truck size={16} className="text-brand-blue shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-800">Tracking Notes</p>
                        <p className="text-gray-500 font-semibold mt-0.5">{order.trackingNote || 'Awaiting update from chemical operations.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Printable Invoice Block */}
                  <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm print:border-none print:shadow-none">
                    
                    {/* Header */}
                    <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 print:bg-white print:px-0">
                      <div className="space-y-1">
                        <h2 className="text-md font-black text-gray-900 uppercase">MALA PHENYLE CHEMICAL WORKS</h2>
                        <p className="text-[11px] text-gray-550 font-semibold">Birgunj, Nepal | Sunilgupta335566@gmail.com</p>
                        <p className="text-[11px] text-gray-550 font-semibold">Support: +977 9855033186</p>
                      </div>
                      <div className="text-left sm:text-right text-[11px] font-semibold text-gray-500">
                        <p className="font-bold text-gray-900 text-xs">INVOICE RECEIPT</p>
                        <p>Order No: {order.orderNumber}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-brand-blue">Payment: CASH ON DELIVERY</p>
                      </div>
                    </div>

                    {/* Address Detail Grid */}
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] font-semibold text-gray-600 border-b border-gray-150 print:px-0">
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Customer Profile</p>
                        <p className="font-bold text-gray-950 text-xs">
                          {order.guestName || order.user?.name || 'Valued Customer'}
                        </p>
                        <p>Phone: {order.guestPhone || order.address.mobile}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Delivery Address</p>
                        <p className="font-bold text-gray-950">{order.address.name}</p>
                        <p>{order.address.street}, Ward {order.address.ward}</p>
                        <p>{order.address.municipality}, {order.address.district}</p>
                        <p>{order.address.province}, Nepal</p>
                        {order.address.landmark && <p className="text-gray-400">Landmark: {order.address.landmark}</p>}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-6 print:px-0">
                      <table className="w-full text-left text-[11px] font-semibold border-collapse">
                        <thead>
                          <tr className="border-b border-gray-150 text-gray-400 uppercase text-[9px]">
                            <th className="py-2.5">Product Description</th>
                            <th className="py-2.5 text-center">Price</th>
                            <th className="py-2.5 text-center">Qty</th>
                            <th className="py-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-800">
                          {order.items.map((item: any) => (
                            <tr key={item.id}>
                              <td className="py-3 font-bold text-gray-900">{item.name}</td>
                              <td className="py-3 text-center">Rs. {Number(item.price).toLocaleString()}</td>
                              <td className="py-3 text-center font-bold">{item.quantity}</td>
                              <td className="py-3 text-right font-black text-brand-blue">
                                Rs. {Number(item.total).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Financial Subtotals */}
                    <div className="p-6 bg-gray-50 border-t border-gray-150 flex justify-end print:bg-white print:px-0">
                      <div className="w-full sm:w-72 space-y-2.5 text-xs font-semibold text-gray-500">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="text-gray-900">Rs. {Number(order.totalAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Charge</span>
                          <span className="text-gray-900">
                            {Number(order.deliveryCharge) === 0 ? 'FREE Shipping' : `Rs. ${Number(order.deliveryCharge).toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-150 pt-2.5 text-sm font-bold">
                          <span className="text-gray-900">Total Paid/Due</span>
                          <span className="text-brand-blue font-black">
                            Rs. {Number(order.grandTotal).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              ) : null}

            </div>

          </div>
        ) : (
          <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
            Loading dashboard order session...
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
