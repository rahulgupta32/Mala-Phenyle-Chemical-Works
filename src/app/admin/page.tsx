import React from 'react';
import Link from 'next/link';
import { db } from 'src/lib/db';
import { ShoppingBag, ClipboardList, DollarSign, Award, AlertTriangle, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Prevent static caching

export default async function AdminDashboardPage() {
  // 1. Fetch aggregates directly from PostgreSQL using Prisma
  const [
    salesAggregate,
    totalOrders,
    pendingOrders,
    pendingWholesaleApps,
    allProducts,
    recentOrders,
  ] = await Promise.all([
    db.order.aggregate({
      _sum: {
        grandTotal: true,
      },
      where: {
        orderStatus: {
          notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED],
        },
      },
    }),
    db.order.count(),
    db.order.count({
      where: { orderStatus: OrderStatus.PENDING },
    }),
    db.wholesaleApplication.count({
      where: { status: 'PENDING' },
    }),
    db.product.findMany({
      include: {
        variants: true,
      },
    }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
      },
    }),
  ]);

  // 2. Calculate Low Stock Alerts (aggregated across base and variants)
  let lowStockCount = 0;
  const lowStockItems: any[] = [];

  for (const prod of allProducts) {
    if (prod.variants.length > 0) {
      for (const variant of prod.variants) {
        if (variant.stock <= prod.lowStockThreshold) {
          lowStockCount++;
          lowStockItems.push({
            name: `${prod.name} (${variant.name})`,
            stock: variant.stock,
            sku: variant.sku,
          });
        }
      }
    } else {
      if (prod.stock <= prod.lowStockThreshold) {
        lowStockCount++;
        lowStockItems.push({
          name: prod.name,
          stock: prod.stock,
          sku: prod.sku,
        });
      }
    }
  }

  const totalSalesVal = salesAggregate._sum.grandTotal ? Number(salesAggregate._sum.grandTotal) : 0;

  const stats = [
    { name: 'Total Revenue', value: `Rs. ${totalSalesVal.toLocaleString()}`, icon: DollarSign, color: 'bg-blue-50 text-brand-blue' },
    { name: 'Total Orders', value: totalOrders, icon: ClipboardList, color: 'bg-indigo-50 text-indigo-650' },
    { name: 'Pending Orders', value: pendingOrders, icon: ShoppingBag, color: 'bg-emerald-50 text-brand-green' },
    { name: 'B2B Wholesale Apps', value: pendingWholesaleApps, icon: Award, color: 'bg-amber-50 text-brand-gold' },
    { name: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 text-xs mt-1 font-semibold">Real-time statistics for Mala Phenyle Chemical Works factory sales.</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.name}</p>
                <p className="text-lg font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-8 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent incoming orders</h3>
            <Link href="/admin/orders" className="text-brand-blue hover:underline text-xs font-bold flex items-center gap-1">
              All Orders <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400 font-semibold">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50 overflow-x-auto pr-1">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-50 py-2">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3 text-center">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 font-bold text-brand-blue">
                        <Link href={`/admin/orders?openOrder=${ord.id}`} className="hover:underline">
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5">{ord.guestName || ord.address.name}</td>
                      <td className="py-3.5 text-center font-bold text-gray-900">
                        Rs. {Number(ord.grandTotal).toLocaleString()}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          ord.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-brand-green border border-emerald-100' :
                          ord.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-blue-50 text-brand-blue border border-blue-100'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-gray-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Low Stock Alerts */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-1.5 text-red-600">
              <AlertTriangle size={16} /> Inventory Alerts ({lowStockCount})
            </h3>
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-gray-450 font-semibold text-center py-6">All chemical stock levels normal.</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.sku} className="flex justify-between items-center text-xs font-semibold p-2.5 bg-red-50/30 border border-red-100/50 rounded-xl">
                    <div className="max-w-[70%]">
                      <p className="text-gray-900 font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">SKU: {item.sku}</p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-black text-[10px]">
                      Qty: {item.stock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Operations Links */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-3">
              Quick Operations
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/admin/products" className="py-2.5 px-4 bg-gray-50 hover:bg-brand-blue/5 border border-gray-100 hover:border-brand-blue/20 text-brand-blue text-xs font-bold rounded-xl transition flex items-center justify-between">
                <span>Manage Products</span>
                <ArrowRight size={14} />
              </Link>
              <Link href="/admin/orders" className="py-2.5 px-4 bg-gray-50 hover:bg-brand-blue/5 border border-gray-100 hover:border-brand-blue/20 text-brand-blue text-xs font-bold rounded-xl transition flex items-center justify-between">
                <span>Fulfill Pending Orders</span>
                <ArrowRight size={14} />
              </Link>
              <Link href="/admin/wholesale" className="py-2.5 px-4 bg-gray-50 hover:bg-brand-blue/5 border border-gray-100 hover:border-brand-blue/20 text-brand-blue text-xs font-bold rounded-xl transition flex items-center justify-between">
                <span>Review Wholesalers</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
