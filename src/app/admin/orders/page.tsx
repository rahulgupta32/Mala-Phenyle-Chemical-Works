'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Eye, Printer, X, Save, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryStaffList, setDeliveryStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Order for Edit Modal
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Modal Edit States
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editTrackingNote, setEditTrackingNote] = useState('');
  const [editDeliveryStaffId, setEditDeliveryStaffId] = useState('');
  const [editDeliveryNotes, setEditDeliveryNotes] = useState('');

  // Fetch orders list
  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  // Fetch delivery staff members
  useEffect(() => {
    fetch('/api/admin/delivery-staff')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDeliveryStaffList(data);
      })
      .catch((e) => console.error('Failed to load delivery staff', e));
  }, []);

  const openEditModal = (order: any) => {
    setActiveOrder(order);
    setEditStatus(order.orderStatus);
    setEditPaymentStatus(order.paymentStatus);
    setEditTrackingNote(order.trackingNote || '');
    
    // Set delivery staff ID if assigned
    const activeAssignment = order.deliveryAssignments?.[0];
    setEditDeliveryStaffId(activeAssignment?.deliveryStaffId || '');
    setEditDeliveryNotes(activeAssignment?.notes || '');
    
    setModalOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    setModalLoading(true);
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: editStatus,
          paymentStatus: editPaymentStatus,
          trackingNote: editTrackingNote,
          deliveryStaffId: editDeliveryStaffId || undefined,
          deliveryNotes: editDeliveryNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Order updated successfully!');
        setModalOpen(false);
        loadOrders(); // Refresh table
      } else {
        alert(data.error || 'Failed to update order');
      }
    } catch (err) {
      alert('Network connection error.');
    } finally {
      setModalLoading(false);
    }
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((o) => {
    const custName = (o.guestName || o.address?.name || '').toLowerCase();
    const custPhone = (o.guestPhone || o.address?.mobile || '').toLowerCase();
    const orderNum = o.orderNumber.toLowerCase();
    const query = searchQuery.toLowerCase();
    return custName.includes(query) || custPhone.includes(query) || orderNum.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-550 text-xs mt-1 font-semibold">Track, update statuses, assign delivery, and print tax invoices.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 border border-gray-150 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                selectedStatus === status
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search order number or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-55 border border-gray-200 rounded-xl py-2 pl-4 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
          <Search size={14} className="absolute right-3.5 top-3 text-gray-400" />
        </div>
      </div>

      {/* Orders Grid Table */}
      {loading ? (
        <div className="h-64 bg-white border border-gray-150 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
          Loading orders database...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-150 rounded-3xl text-gray-400 font-bold text-xs">
          No orders found matching criteria.
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 uppercase text-[9px] tracking-wider">
                  <th className="py-4 px-6">Order Number</th>
                  <th className="py-4 px-6">Customer Profile</th>
                  <th className="py-4 px-6 text-center">Amount</th>
                  <th className="py-4 px-6 text-center">Payment Status</th>
                  <th className="py-4 px-6 text-center">Order Status</th>
                  <th className="py-4 px-6 text-center">Delivery Staff</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredOrders.map((ord) => {
                  const staffAssigned = ord.deliveryAssignments?.[0]?.deliveryStaff?.name || 'Unassigned';
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-bold text-brand-blue">{ord.orderNumber}</td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">{ord.guestName || ord.address?.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Mob: {ord.guestPhone || ord.address?.mobile}</p>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-gray-900">
                        Rs. {Number(ord.grandTotal).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          ord.paymentStatus === 'PAID' ? 'bg-emerald-50 text-brand-green border border-emerald-100' :
                          ord.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-amber-50 text-brand-gold border border-amber-100'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          ord.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-brand-green border border-emerald-100' :
                          ord.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-blue-50 text-brand-blue border border-blue-100'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-[10px] font-bold text-gray-500">
                        {staffAssigned}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openEditModal(ord)}
                          className="p-2 bg-gray-50 hover:bg-brand-blue/5 border border-gray-150 rounded-xl hover:text-brand-blue transition inline-flex items-center gap-1.5"
                        >
                          <Eye size={14} /> <span>Review / Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {modalOpen && activeOrder && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-gray-900">Fulfillment Review: {activeOrder.orderNumber}</h2>
                <p className="text-xs text-gray-500 font-semibold">Verify details, adjust shipment status, and allocate staff.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Shipment Details */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2 text-xs font-semibold text-gray-650">
                  <h4 className="text-[10px] font-black uppercase text-gray-400">Recipient Address</h4>
                  <p className="font-bold text-gray-900 text-sm">{activeOrder.address.name}</p>
                  <p>Mobile: {activeOrder.guestPhone || activeOrder.address.mobile}</p>
                  <p>{activeOrder.address.street}, Ward {activeOrder.address.ward}</p>
                  <p>{activeOrder.address.municipality}, {activeOrder.address.district}</p>
                  <p>{activeOrder.address.province}, Nepal</p>
                  {activeOrder.address.landmark && <p className="text-gray-400">Landmark: {activeOrder.address.landmark}</p>}
                </div>

                {/* Items Summary list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Ordered items</h4>
                  <ul className="text-xs font-bold text-gray-700 divide-y divide-gray-50">
                    {activeOrder.items.map((item: any) => (
                      <li key={item.id} className="py-2.5 flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="text-brand-blue">Rs. {Number(item.total).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between text-xs font-bold text-gray-900">
                    <span>Grand Total:</span>
                    <span>Rs. {Number(activeOrder.grandTotal).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Status Operations Controls */}
              <div className="space-y-4">
                
                {/* Order Status Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Fulfillment Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="PENDING">PENDING (Unconfirmed)</option>
                    <option value="CONFIRMED">CONFIRMED (Awaiting packing)</option>
                    <option value="PACKED">PACKED (In warehouse)</option>
                    <option value="SHIPPED">SHIPPED (In transit)</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY (With courier)</option>
                    <option value="DELIVERED">DELIVERED (Completed)</option>
                    <option value="CANCELLED">CANCELLED (Restore Stock)</option>
                    <option value="RETURNED">RETURNED</option>
                  </select>
                </div>

                {/* Payment Status Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                {/* Allocate Delivery Courier Staff */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Assign Delivery Staff</label>
                  <select
                    value={editDeliveryStaffId}
                    onChange={(e) => setEditDeliveryStaffId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="">Unassigned</option>
                    {deliveryStaffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.phone || 'No phone'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracking Remarks */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Customer Tracking Note</label>
                  <input
                    type="text"
                    value={editTrackingNote}
                    onChange={(e) => setEditTrackingNote(e.target.value)}
                    placeholder="e.g. Dispatched from Birgunj terminal"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                {/* Printable Invoice receipt button */}
                <div className="pt-2">
                  <Link
                    href={`/checkout/success?orderNumber=${activeOrder.orderNumber}&id=${activeOrder.id}`}
                    target="_blank"
                    className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Printer size={14} /> Open and Print Receipt Invoice
                  </Link>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                  >
                    Dismiss
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-1/2 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Save size={14} /> {modalLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
