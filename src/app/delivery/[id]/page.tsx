'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, MapPin, Phone, ChevronLeft, Check, Compass, AlertCircle, Save, Info, ExternalLink } from 'lucide-react';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export default function DeliveryOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit States
  const [deliveryStatus, setDeliveryStatus] = useState<OrderStatus>('PENDING');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const fetchOrderDetails = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
          setDeliveryStatus(data.orderStatus);
          
          const assignment = data.deliveryAssignments?.[0];
          setDeliveryNotes(assignment?.notes || '');
        }
      })
      .catch((e) => console.error('Failed to load delivery details', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async (status: OrderStatus) => {
    setSubmitting(true);
    try {
      // Build update payload
      const payload: any = {
        orderStatus: status,
        deliveryNotes,
      };

      // Set tracking notes based on status selection
      if (status === 'OUT_FOR_DELIVERY') {
        payload.trackingNote = 'Your package is out for delivery. Courier will contact you shortly.';
      } else if (status === 'DELIVERED') {
        payload.trackingNote = 'Package delivered successfully. Thank you for choosing Mala Chemicals.';
        payload.paymentStatus = PaymentStatus.PAID; // COD payment successfully collected
      } else if (status === 'CANCELLED') {
        payload.trackingNote = `Delivery failed / Order cancelled. Reason: ${deliveryNotes || 'Undeliverable'}`;
      } else if (status === 'RETURNED') {
        payload.trackingNote = 'Package returned to Birgunj warehouse.';
      }

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Delivery status updated successfully!');
        fetchOrderDetails(); // Reload page
      } else {
        alert(data.error || 'Failed to update delivery');
      }
    } catch (err) {
      alert('Network connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-brand-charcoal text-white py-4 px-6 flex items-center gap-2 sticky top-0 z-30 shadow-md">
        <Link href="/delivery" className="p-1 hover:bg-white/5 rounded-full transition">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-sm font-black tracking-tight uppercase leading-none">Job Dispatch Review</h1>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">Update Package Status</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6 space-y-6 text-xs font-semibold text-gray-650">
        
        {loading ? (
          <div className="h-64 bg-white border border-gray-150 rounded-2xl animate-pulse flex items-center justify-center text-gray-450 font-bold text-xs">
            Loading job details...
          </div>
        ) : error ? (
          <div className="p-6 bg-white border border-gray-150 rounded-2xl text-center text-red-700 font-bold">
            {error}
          </div>
        ) : order ? (
          <>
            {/* Header info */}
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="inline-block bg-brand-blue/5 text-brand-blue px-2.5 py-0.5 rounded text-[10px] font-bold">
                  {order.orderNumber}
                </span>
                <span className={`inline-block text-[9px] font-black uppercase ${
                  order.orderStatus === 'DELIVERED' ? 'text-brand-green' : 
                  order.orderStatus === 'CANCELLED' ? 'text-red-650' : 'text-brand-blue'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium pt-1">
                Placed: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Recipient Details */}
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2">
                Recipient Profile
              </h3>
              
              <div className="space-y-3">
                <p className="font-bold text-gray-950 text-sm">{order.address.name}</p>
                
                {/* Phone Call Trigger */}
                <div className="flex gap-2">
                  <a
                    href={`tel:${order.guestPhone || order.address.mobile}`}
                    className="flex-1 py-2.5 bg-brand-green text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Phone size={14} /> Call Customer
                  </a>
                  
                  {/* Google Maps directions */}
                  {order.address.googleMapsLink && (
                    <a
                      href={order.address.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-gray-50 border border-gray-250 text-gray-700 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={14} /> Maps
                    </a>
                  )}
                </div>

                {/* Address block */}
                <div className="space-y-1.5 text-gray-500 pt-2 border-t border-gray-50">
                  <p className="flex items-start gap-1.5">
                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {order.address.street}, Ward {order.address.ward}<br />
                      {order.address.municipality}, {order.address.district}, {order.address.province}
                    </span>
                  </p>
                  {order.address.landmark && (
                    <p className="bg-gray-50 p-2 rounded-lg text-gray-400 text-[10px] font-bold">
                      Landmark: {order.address.landmark}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items checklist */}
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2">
                Items Checklist
              </h3>
              <ul className="text-xs font-bold text-gray-700 divide-y divide-gray-50">
                {order.items.map((item: any) => (
                  <tr key={item.id} className="flex justify-between py-2">
                    <td>{item.name}</td>
                    <td className="text-brand-blue shrink-0">Qty: {item.quantity}</td>
                  </tr>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900 text-sm">
                <span>Collect Cash (COD):</span>
                <span className="text-brand-blue">Rs. {Number(order.grandTotal).toLocaleString()}</span>
              </div>
            </div>

            {/* Courier Controls Panel */}
            <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2">
                Operational Dispatch Controls
              </h3>

              {/* Delivery log notes input */}
              <div>
                <label className="block text-[9px] text-gray-450 uppercase mb-2">Delivery Log Note / Remarks</label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Delivered package to reception desk / Customer requested delivery on Tuesday..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none"
                />
              </div>

              {/* Actions Toggles */}
              <div className="grid grid-cols-1 gap-2 pt-2">
                
                {/* Out for Delivery */}
                {order.orderStatus !== 'OUT_FOR_DELIVERY' && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                  <button
                    onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                    disabled={submitting}
                    className="w-full py-3 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Compass size={14} /> Set Out for Delivery
                  </button>
                )}

                {/* Delivered (Success) */}
                {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                  <button
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    disabled={submitting}
                    className="w-full py-3 bg-brand-green hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Mark Package Delivered & Paid
                  </button>
                )}

                {/* Cancelled/Failed (Restore stock) */}
                {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
                  <button
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    disabled={submitting}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle size={14} /> Cancel / Mark Delivery Failed
                  </button>
                )}

                {/* Returned */}
                {order.orderStatus === 'CANCELLED' && (
                  <button
                    onClick={() => handleUpdateStatus('RETURNED')}
                    disabled={submitting}
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-250 text-gray-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    Set Package Returned to Factory
                  </button>
                )}

              </div>
            </div>
          </>
        ) : null}

      </main>
    </div>
  );
}
