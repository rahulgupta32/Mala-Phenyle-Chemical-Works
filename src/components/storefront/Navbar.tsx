'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, User as UserIcon, Search, Menu, X, LogOut, ChevronDown, Award } from 'lucide-react';
import { useAuth } from 'src/context/AuthContext';
import { useCart } from 'src/context/CartContext';

function NavbarContent() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  // Fetch shop settings for announcement bar & contacts
  useEffect(() => {
    fetch('/api/shop-settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((e) => console.error('Failed to load navbar settings', e));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-gray-100">
      {/* Announcement Bar */}
      {settings?.announcementText && (
        <div className="w-full bg-brand-blue text-white text-center py-2 px-4 text-xs sm:text-sm font-medium tracking-wide">
          {settings.announcementText}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-brand-blue tracking-tight leading-none">
                MALA PHENYLE
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-brand-green tracking-widest mt-1">
                CHEMICAL WORKS
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              placeholder="Search disinfectants, toilet cleaners, handwash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition"
            />
            <button type="submit" className="absolute right-1 top-1 bottom-1 px-4 text-gray-500 hover:text-brand-blue transition">
              <Search size={18} />
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Storefront Nav Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-600 mr-2">
              <Link href="/products" className="hover:text-brand-blue transition">Products</Link>
              <Link href="/bulk-order" className="hover:text-brand-blue transition">Bulk Order / Quote</Link>
              <Link href="/wholesale-register" className="hover:text-brand-blue transition">B2B Wholesale</Link>
              <Link href="/about" className="hover:text-brand-blue transition">About Us</Link>
            </nav>

            {/* Cart Button */}
            <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-brand-blue rounded-full hover:bg-gray-50 transition">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-brand-green text-white text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1 sm:gap-2 p-1.5 text-gray-600 hover:text-brand-blue rounded-full sm:rounded-lg hover:bg-gray-50 transition text-sm font-semibold"
                  >
                    <UserIcon size={22} />
                    <span className="hidden sm:inline-block max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={14} className="hidden sm:inline-block" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 border border-gray-100 divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2">
                        <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                        {user.role === 'WHOLESALE' && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full mt-1 border border-amber-100">
                            <Award size={10} /> Wholesale Account
                          </span>
                        )}
                      </div>
                      
                      <div className="py-1">
                        {/* Admin / Delivery Redirects */}
                        {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                          <Link href="/admin" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-brand-blue font-semibold hover:bg-gray-50">
                            Admin Dashboard
                          </Link>
                        )}
                        {user.role === 'DELIVERY' && (
                          <Link href="/delivery" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-brand-green font-semibold hover:bg-gray-50">
                            Delivery Panel
                          </Link>
                        )}
                        <Link href="/my-account" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          My Account
                        </Link>
                        <Link href="/my-account/orders" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          My Orders
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 font-medium"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue text-white text-xs sm:text-sm font-bold hover:bg-brand-blue-hover shadow-sm transition">
                  <UserIcon size={16} />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-brand-blue rounded-full hover:bg-gray-50 transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-4 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="flex relative w-full mb-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
              <Search size={16} />
            </button>
          </form>

          <nav className="flex flex-col gap-3 font-semibold text-gray-700">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-gray-50 hover:text-brand-blue">Products</Link>
            <Link href="/bulk-order" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-gray-50 hover:text-brand-blue">Bulk Order / Quote</Link>
            <Link href="/wholesale-register" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-gray-50 hover:text-brand-blue">B2B Wholesale</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-gray-50 hover:text-brand-blue">About Us</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="py-1 border-b border-gray-50 hover:text-brand-blue">Contact Us</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-brand-blue tracking-tight leading-none">MALA PHENYLE</span>
            <span className="text-[10px] sm:text-xs font-bold text-brand-green tracking-widest mt-1">CHEMICAL WORKS</span>
          </div>
          <div className="h-10 w-48 bg-gray-100 rounded-full animate-pulse"></div>
        </div>
      </header>
    }>
      <NavbarContent />
    </Suspense>
  );
}
