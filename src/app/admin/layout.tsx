'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, ShieldAlert, Sliders, LogOut, Loader2, Award } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  // If path is login page, bypass layout formatting
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-2 text-gray-500 font-bold">
        <Loader2 className="animate-spin text-brand-blue" />
        <span>Loading admin operations session...</span>
      </div>
    );
  }

  // Fallback protection check
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return null; // Middleware will handle redirect, return empty to prevent flash of content
  }

  const navItems = [
    { title: 'Overview', href: '/admin', icon: LayoutDashboard },
    { title: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { title: 'Products', href: '/admin/products', icon: ShoppingBag },
    { title: 'B2B Wholesale', href: '/admin/wholesale', icon: Award },
    { title: 'Shop Settings', href: '/admin/settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-brand-charcoal text-white shrink-0 flex flex-col justify-between py-6 px-4">
        <div className="space-y-8">
          
          {/* Logo Branding */}
          <div className="px-2">
            <Link href="/" className="flex flex-col">
              <span className="text-lg font-black text-white tracking-tight leading-none uppercase">
                MALA PHENYLE
              </span>
              <span className="text-[9px] font-bold text-brand-green tracking-widest mt-1 uppercase">
                Operations Panel
              </span>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1.5 text-xs font-semibold text-gray-300">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md font-bold'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-white/10 pt-4 px-2 space-y-4">
          <div className="text-[11px] font-semibold text-gray-400">
            <p className="font-bold text-white leading-none truncate max-w-[200px]">{user.name}</p>
            <p className="mt-1 text-[10px] uppercase text-brand-gold">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 text-xs font-bold text-red-400 hover:text-red-300 transition py-2 rounded-xl"
          >
            <LogOut size={16} />
            <span>Logout Operations</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-150 h-16 shrink-0 hidden md:flex items-center justify-between px-8">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Birgunj, Parsa Manufacturing Unit
          </h2>
          <Link href="/" className="text-xs font-bold text-brand-blue hover:underline">
            View Customer Storefront &rarr;
          </Link>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
