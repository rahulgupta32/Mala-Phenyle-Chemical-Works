'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { CheckCircle2, Printer, ArrowRight, ClipboardList } from 'lucide-react';
import { useAuth } from 'src/context/AuthContext';


function OrderSuccessContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || '';
  const orderId = searchParams.get('id') || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the created order details
  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders/${orderId}?orderNumber=${orderNumber}&phone=guest`) // Bypass authorization checks with basic query matching
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setOrder(data);
      })
      .catch((e) => console.error('Failed to load success order details', e))
      .finally(() => setLoading(false));
  }, [orderId, orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-10 print-container">
        
        {/* Success Announcement Header */}
        <div className="text-center space-y-4 no-print">
          <div className="inline-flex p-3 bg-emerald-50 text-brand-green rounded-full">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Thank You For Your Order!</h1>
          <p className="text-gray-550 text-sm max-w-md mx-auto font-semibold">
            Your Cash on Delivery order has been successfully logged. Our Birgunj operations team is preparing your package.
          </p>
          
          <div className="inline-block bg-brand-blue text-white px-6 py-2.5 rounded-2xl font-black text-sm border border-brand-blue shadow-sm">
            Order Number: {orderNumber}
          </div>
        </div>

        {/* Order Details Invoice View */}
        {loading ? (
          <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
            Loading receipt details...
          </div>
        ) : order ? (
          <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm print:border-none print:shadow-none">
            
            {/* Invoice Header */}
            <div className="bg-gray-50 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 print:bg-white print:px-0">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">MALA PHENYLE CHEMICAL WORKS</h2>
                <p className="text-xs text-gray-500 font-semibold">Birgunj, Nepal | Sunilgupta335566@gmail.com</p>
                <p className="text-xs text-gray-500 font-semibold">Support: +977 9855033186</p>
              </div>
              <div className="text-left sm:text-right text-xs font-semibold text-gray-500">
                <p className="font-bold text-gray-900 text-sm">INVOICE RECEIPT</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Status: {order.orderStatus}</p>
                <p className="text-brand-blue">Payment: CASH ON DELIVERY</p>
              </div>
            </div>

            {/* Customer & Address details */}
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-semibold text-gray-600 border-b border-gray-150 print:px-0">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Customer Details</p>
                <p className="font-bold text-gray-900 text-sm">
                  {order.guestName || order.user?.name || 'Valued Customer'}
                </p>
                <p>Phone: {order.guestPhone || order.address.mobile}</p>
                {order.guestEmail && <p>Email: {order.guestEmail}</p>}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Delivery Address</p>
                <p className="font-bold text-gray-900">{order.address.name}</p>
                <p>{order.address.street}, Ward {order.address.ward}</p>
                <p>{order.address.municipality}, {order.address.district}</p>
                <p>{order.address.province}, Nepal</p>
                {order.address.landmark && <p className="text-gray-400">Landmark: {order.address.landmark}</p>}
              </div>
            </div>

            {/* Items Table */}
            <div className="p-6 sm:p-8 overflow-x-auto print:px-0">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 text-gray-400 uppercase text-[10px]">
                    <th className="py-3">Product Description</th>
                    <th className="py-3 text-center">Unit Price</th>
                    <th className="py-3 text-center">Qty</th>
                    <th className="py-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-gray-800">
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3.5 font-bold text-gray-900">{item.name}</td>
                      <td className="py-3.5 text-center">Rs. {Number(item.price).toLocaleString()}</td>
                      <td className="py-3.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-3.5 text-right font-black text-brand-blue">
                        Rs. {Number(item.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-150 flex justify-end print:bg-white print:px-0">
              <div className="w-full sm:w-80 space-y-3 text-xs font-semibold text-gray-500">
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
                <div className="flex justify-between border-t border-gray-150 pt-3 text-sm font-bold">
                  <span className="text-gray-900">Total Paid/Due</span>
                  <span className="text-brand-blue font-black text-base">
                    Rs. {Number(order.grandTotal).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl text-gray-400">
            Failed to load order receipt summary.
          </div>
        )}

        {/* Success Action buttons */}
        <div className="flex flex-wrap justify-center gap-4 no-print">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 shadow-sm transition flex items-center gap-2"
          >
            <Printer size={16} /> Print Official Invoice
          </button>
          
          {user ? (
            <Link
              href="/my-account/orders"
              className="px-6 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue-hover shadow-lg shadow-brand-blue/10 transition flex items-center gap-2"
            >
              Go to My Orders <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href="/"
              className="px-6 py-3 bg-brand-green text-white font-bold rounded-xl hover:bg-brand-green-hover shadow-lg shadow-brand-green/10 transition"
            >
              Continue Shopping
            </Link>
          )}
        </div>

      </main>

      <Footer />
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
        <div className="text-center font-bold text-gray-500 animate-pulse">Loading Invoice Receipt...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
