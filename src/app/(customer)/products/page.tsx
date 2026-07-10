'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { Search, SlidersHorizontal, ArrowUpDown, HelpCircle, ClipboardList } from 'lucide-react';
import { useAuth } from 'src/context/AuthContext';

function ProductsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState('newest');

  // Trigger loading when searchParams change
  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((e) => console.error('Failed to fetch categories', e));
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchVal) queryParams.append('search', searchVal);
        if (selectedCategory) queryParams.append('category', selectedCategory);
        
        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchVal, selectedCategory]);

  const isWholesale = user?.role === 'WHOLESALE';

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
        
        {/* Breadcrumb / Headline */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Our Chemical Catalogue</h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">
            {isWholesale 
              ? 'Distributor Account Active: Viewing wholesale price tiers.' 
              : 'Direct sales catalog. For bulk or commercial rates, apply for a wholesale account.'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition border ${
                selectedCategory === ''
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition border ${
                  selectedCategory === cat.slug
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-4 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <Search size={14} className="absolute right-3.5 top-3 text-gray-400" />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-100 border border-gray-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl space-y-3">
            <HelpCircle size={48} className="mx-auto text-gray-300" />
            <h3 className="text-lg font-bold text-gray-700">No products found</h3>
            <p className="text-xs text-gray-400 font-semibold">Try modifying your search keywords or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col group"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-brand-gray relative flex items-center justify-center p-4 border-b border-gray-50">
                  <div className="text-center space-y-1 text-brand-blue">
                    <ClipboardList size={32} className="mx-auto opacity-30 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Chemical Product</span>
                  </div>
                  {prod.status === 'OUT_OF_STOCK' && (
                    <span className="absolute top-3 left-3 bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200">
                      Out of Stock
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-white/95 text-brand-blue text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-gray-50">
                    {prod.weightVolume}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-brand-green tracking-widest block">
                      {prod.category?.name}
                    </span>
                    <h3 className="font-black text-gray-800 text-base leading-tight truncate group-hover:text-brand-blue transition">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold line-clamp-2 leading-relaxed">
                      {prod.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-gray-400 font-bold uppercase">
                        {isWholesale ? 'Wholesale Price' : 'Retail Price'}
                      </span>
                      <span className="text-base font-black text-brand-blue">
                        Rs. {isWholesale 
                          ? Number(prod.wholesalePrice).toLocaleString() 
                          : (prod.discountedPrice ? Number(prod.discountedPrice).toLocaleString() : Number(prod.retailPrice).toLocaleString())
                        }
                      </span>
                      {prod.discountedPrice && !isWholesale && (
                        <span className="text-[10px] text-gray-400 line-through font-medium">
                          Rs. {Number(prod.retailPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/products/${prod.slug}`}
                      className="px-4 py-2 bg-brand-blue text-white text-[11px] font-black rounded-lg hover:bg-brand-blue-hover transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
        <div className="text-center font-bold text-gray-500 animate-pulse">Loading Products Catalogue...</div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
