'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { ArrowRight, ShieldCheck, Truck, Percent, Factory, ClipboardList, HelpCircle, Star, Search } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackOrderNum, setTrackOrderNum] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackError, setTrackError] = useState('');

  // Fetch categories and featured products on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?limit=6')
        ]);
        
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.slice(0, 8));
        }
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setFeaturedProducts(prodData.products);
        }
      } catch (e) {
        console.error('Failed to load home page data', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderNum || !trackPhone) {
      setTrackError('Please fill in both fields');
      return;
    }
    router.push(`/track-order?orderNumber=${encodeURIComponent(trackOrderNum.trim())}&phone=${encodeURIComponent(trackPhone.trim())}`);
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-brand-blue via-brand-blue to-primary-800 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(5,150,105,0.15),transparent)]"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-green/20 border border-brand-green/30 text-brand-green text-xs font-bold uppercase tracking-wider">
              Est. 2026 • Birgunj, Nepal
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Premium Hygiene & <br />
              <span className="text-brand-gold">Cleaning Chemicals</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              We manufacture high-grade White Phenyle, Black Phenyle, Toilet Cleaners, and Liquid Soaps. Serving schools, hospitals, distributors, and households across Nepal.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
              <Link href="/products" className="px-8 py-3.5 bg-brand-green text-white font-bold rounded-full hover:bg-brand-green-hover shadow-lg transition flex items-center justify-center gap-2">
                Shop Our Products <ArrowRight size={16} />
              </Link>
              <Link href="/wholesale-register" className="px-8 py-3.5 bg-transparent border-2 border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition flex items-center justify-center">
                B2B Wholesale Portal
              </Link>
            </div>
          </div>

          {/* Quick Order Tracker Form */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl text-white">
              <h3 className="text-xl font-bold mb-2 text-brand-gold">Track Guest Order</h3>
              <p className="text-xs text-gray-300 mb-6 font-medium">Check your package status without logging in.</p>
              
              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Order Number</label>
                  <input
                    type="text"
                    placeholder="e.g. MALA-2026-000001"
                    value={trackOrderNum}
                    onChange={(e) => setTrackOrderNum(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 98550xxxxx"
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                  />
                </div>
                
                {trackError && <p className="text-red-300 text-xs font-semibold">{trackError}</p>}
                
                <button type="submit" className="w-full py-3 bg-brand-gold hover:bg-amber-600 text-brand-charcoal font-black rounded-lg transition shadow-md">
                  Track Package
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Badges Section */}
      <section className="bg-white border-b border-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-blue-50 text-brand-blue rounded-2xl shrink-0">
              <Factory size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Direct From Factory</h4>
              <p className="text-xs text-gray-500 font-medium">Manufacturer direct prices</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-emerald-50 text-brand-green rounded-2xl shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">German Formulation</h4>
              <p className="text-xs text-gray-500 font-medium">99.9% germ disinfection</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-amber-50 text-brand-gold rounded-2xl shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Nepal-wide Delivery</h4>
              <p className="text-xs text-gray-500 font-medium">Fulfillment to all provinces</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
              <Percent size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Wholesale Schemes</h4>
              <p className="text-xs text-gray-500 font-medium">Lucrative bulk margins</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 text-sm font-semibold">Extendable systems covering industrial and domestic sanitation.</p>
          </div>
          <Link href="/products" className="text-brand-blue hover:text-brand-green font-bold text-sm flex items-center gap-1 group">
            View All Categories <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-md hover:border-brand-blue/20 transition group flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-brand-blue/5 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition">
                  <span className="text-sm font-bold">{cat.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Grid */}
      <section className="bg-gray-50 py-16 border-y border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Featured Cleaning Products</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mt-2 font-semibold">
              Our highest selling and recommended cleaning liquids. Factory direct prices.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[350px] bg-white rounded-3xl animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col group"
                >
                  {/* Product Visual */}
                  <div className="h-56 bg-brand-gray relative flex items-center justify-center p-6 border-b border-gray-50">
                    <div className="text-center space-y-1 text-brand-blue">
                      <ClipboardList size={40} className="mx-auto opacity-40 group-hover:scale-115 transition" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Image Preview</span>
                    </div>
                    {prod.status === 'OUT_OF_STOCK' && (
                      <span className="absolute top-4 left-4 bg-red-150 text-red-700 text-xs font-black px-3 py-1 rounded-full border border-red-200">
                        Out of Stock
                      </span>
                    )}
                    <span className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm shadow-sm text-brand-blue text-xs font-bold px-3 py-1 rounded-full border border-gray-100">
                      Volume: {prod.weightVolume}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-brand-green text-[10px] font-black uppercase tracking-widest block">
                        {prod.category?.name || 'Cleaning Agent'}
                      </span>
                      <h3 className="text-lg font-black text-gray-900 leading-snug group-hover:text-brand-blue transition">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold line-clamp-2">
                        {prod.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Retail Price</span>
                        <span className="text-lg font-black text-brand-blue">
                          Rs. {Number(prod.retailPrice).toLocaleString()}
                        </span>
                      </div>
                      <Link
                        href={`/products/${prod.slug}`}
                        className="px-5 py-2.5 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue-hover transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* B2B / Wholesale Portal Callout */}
      <section className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-800 to-brand-green rounded-3xl text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(11,60,93,0.25),transparent)]"></div>
          
          <div className="lg:col-span-8 space-y-4 relative z-10 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Distributor & Wholesale Bulk Supply
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
              Are you a cleaning product retailer, supermarket, government agency, school, or corporate buyer in Nepal? Register for a B2B account to unlock exclusive wholesale price tiers and request direct shipping quotations.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end relative z-10 w-full">
            <Link
              href="/wholesale-register"
              className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-brand-charcoal font-black text-center rounded-2xl hover:bg-amber-600 transition shadow-lg shrink-0"
            >
              Wholesaler Registration
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
