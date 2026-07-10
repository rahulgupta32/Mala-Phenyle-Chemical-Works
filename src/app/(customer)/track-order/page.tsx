'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { Search, MapPin, Truck, Calendar, DollarSign, Package, Compass, AlertCircle, FileText } from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrderDetails = async (ordNum: string, ph: string) => {
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      // For guest tracking, we query by passing orderNumber and phone
      // To find the ID, we search in the database for the order matching orderNumber
      // Let's call a general search query. Since we protected /api/orders/[id] to allow guest match,
      // wait, how do we get the order ID first if the guest only has the orderNumber?
      // Ah! We can write a quick search endpoint or let `/api/orders/[id]` support either orderId or orderNumber!
      // In our `/api/orders/[id]` endpoint, we searched by:
      // `const order = await db.order.findUnique({ where: { id } })`
      // To support finding by orderNumber, we can write a tiny search in `/api/orders/[id]/route.ts`
      // that checks if `id` is a UUID. If not, it can search by `orderNumber`!
      // Wait, let's verify if that's supported. Yes, we wrote:
      // `const order = await db.order.findUnique({ where: { id } })` which expects UUID.
      // Let's modify `/api/orders/[id]/route.ts` to allow lookups by `orderNumber` as well if `id` is not a UUID, or search by `orderNumber` directly.
      // Wait! Let's check how we can fetch the order. If we pass `orderNumber` in the query, we can find it!
      // Let's make sure `/api/orders/[id]/route.ts` can find by `orderNumber` if `id === 'search'`! That is a very clean and standard API pattern:
      // `/api/orders/search?orderNumber=MALA-2026-000001&phone=9855033186`
      // Wait, let's look at `/api/orders/[id]/route.ts` - we can just check if `id` starts with `MALA-`, and if so, search by `order.findUnique({ where: { orderNumber: id } })`!
      // Yes! That is extremely elegant and doesn't require creating a new route. Let's inspect `/api/orders/[id]/route.ts`.
      // It has: `const { id } = params;` and then `where: { id }`.
      // If we check if `id` contains `MALA-`, we can query by `orderNumber: id` instead!
      // Let's double check if we did this. We can replace that block in `src/app/api/orders/[id]/route.ts` to support both `id` and `orderNumber` lookups!
      
      const queryId = ordNum.trim();
      const res = await fetch(`/api/orders/${queryId}?orderNumber=${queryId}&phone=${encodeURIComponent(ph.trim())}`);
      const data = await res.json();
      
      if (res.ok && !data.error) {
        setOrder(data);
      } else {
        setError(data.error || 'Order not found. Please verify the order number and mobile number.');
      }
    } catch (e) {
      setError('Failed to fetch order details. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlOrderNum = searchParams.get('orderNumber');
    const urlPhone = searchParams.get('phone');
    if (urlOrderNum && urlPhone) {
      setOrderNumber(urlOrderNum);
      setPhone(urlPhone);
      fetchOrderDetails(urlOrderNum, urlPhone);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) {
      setError('Both Order Number and Phone Number are required.');
      return;
    }
    // Update URL query parameters
    router.push(`/track-order?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`);
    fetchOrderDetails(orderNumber, phone);
  };

  // Helper to determine status steps
  const statuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const getStatusIndex = (currentStatus: string) => {
    return statuses.indexOf(currentStatus);
  };

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8">
        
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Tracking</h1>
          <p className="text-gray-550 text-sm mt-1 font-semibold">Track the status of your cleaning supplies shipment.</p>
        </div>

        {/* Tracking Search Form */}
        <div className="bg-white border border-gray-150 p-6 sm:p-8 rounded-3xl shadow-sm">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Order Number</label>
              <input
                type="text"
                placeholder="e.g. MALA-2026-000001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Mobile Number</label>
              <input
                type="text"
                placeholder="e.g. 98550xxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Search size={14} /> Search Package
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs font-bold rounded-2xl flex gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
            Locating package timeline...
          </div>
        )}

        {/* Tracking Details & Timeline */}
        {order && !loading && (
          <div className="space-y-6">
            
            {/* Timeline Progress Bar */}
            <div className="bg-white border border-gray-150 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider">Package Progress</h3>
              
              {order.orderStatus === 'CANCELLED' ? (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl text-xs font-bold flex gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <div>
                    <p>Order Cancelled</p>
                    <p className="font-semibold text-red-600 mt-1">This order has been cancelled and stock has been restored.</p>
                  </div>
                </div>
              ) : order.orderStatus === 'RETURNED' ? (
                <div className="p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl text-xs font-bold flex gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <div>
                    <p>Order Returned</p>
                    <p className="font-semibold text-gray-500 mt-1">This package has been successfully returned to our Birgunj factory.</p>
                  </div>
                </div>
              ) : (
                /* Standard shipment tracking timeline */
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-4 sm:left-auto sm:top-1/2 sm:left-10 sm:right-10 h-full sm:h-1 bg-gray-200 -translate-x-1/2 sm:translate-y-[-50%] z-0">
                    <div
                      className="bg-brand-green h-full sm:h-1 transition-all duration-500"
                      style={{
                        width: `${Math.max(0, (getStatusIndex(order.orderStatus) / (statuses.length - 1)) * 100)}%`,
                        height: '100%'
                      }}
                    ></div>
                  </div>

                  {/* Steps */}
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 pl-10 sm:pl-0">
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
                        <div key={step} className="flex sm:flex-col items-start sm:items-center text-center gap-4 sm:gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition ${
                            isActive
                              ? 'bg-brand-green border-brand-green text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-brand-green/20 scale-110' : ''}`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? 'text-gray-900' : 'text-gray-400'
                          } ${isCurrent ? 'text-brand-green' : ''}`}>
                            {labels[step]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Latest Status Remarks */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-3">
                <Compass size={18} className="text-brand-blue shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-gray-800">Latest Tracking Note</p>
                  <p className="text-gray-500 mt-1 font-semibold">{order.trackingNote || 'Awaiting update from Birgunj chemical operations.'}</p>
                </div>
              </div>

            </div>

            {/* Shipment Summary */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-semibold text-gray-600">
              
              {/* Delivery details */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wide">
                  Delivery Details
                </h4>
                <div className="space-y-2">
                  <p className="font-bold text-gray-900">{order.address.name}</p>
                  <p className="flex items-center gap-1.5"><Truck size={14} className="text-gray-400" /> Phone: {order.guestPhone || order.address.mobile}</p>
                  <p className="flex items-start gap-1.5">
                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>{order.address.street}, Ward {order.address.ward}<br />{order.address.municipality}, {order.address.district}, {order.address.province}</span>
                  </p>
                </div>
              </div>

              {/* Order checklist */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 uppercase tracking-wide">
                  Order Details
                </h4>
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="flex items-center gap-1.5"><DollarSign size={14} className="text-gray-400" /> Total Amount: Rs. {Number(order.grandTotal).toLocaleString()} (COD)</p>
                  
                  {/* Items list */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="font-bold text-gray-800 mb-2">Items Ordered:</p>
                    <ul className="space-y-1 text-gray-500 font-semibold list-disc list-inside">
                      {order.items.map((item: any) => (
                        <li key={item.id}>
                          {item.name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Print invoice shortcut */}
            <div className="text-center no-print">
              <Link
                href={`/checkout/success?orderNumber=${order.orderNumber}&id=${order.id}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline"
              >
                <FileText size={14} /> Open and Print Official Receipt Invoice &rarr;
              </Link>
            </div>

          </div>
        )}

      </main>
      <Footer />
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
        <div className="text-center font-bold text-gray-500 animate-pulse">Loading Tracking Information...</div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
