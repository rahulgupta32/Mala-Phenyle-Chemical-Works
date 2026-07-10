'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Check, Info, AlertTriangle, RefreshCw, ClipboardList, ShieldAlert, Award } from 'lucide-react';
import { useCart } from 'src/context/CartContext';
import { useAuth } from 'src/context/AuthContext';

export default function ProductDetailClient({ product }: { product: any }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'usage' | 'safety' | 'ingredients'>('info');

  const isWholesale = user?.role === 'WHOLESALE';

  // Calculate pricing based on role
  const currentPrice = selectedVariant 
    ? (isWholesale ? Number(selectedVariant.wholesalePrice) : (selectedVariant.discountedPrice ? Number(selectedVariant.discountedPrice) : Number(selectedVariant.retailPrice)))
    : (isWholesale ? Number(product.wholesalePrice) : (product.discountedPrice ? Number(product.discountedPrice) : Number(product.retailPrice)));

  const originalPrice = selectedVariant 
    ? Number(selectedVariant.retailPrice) 
    : Number(product.retailPrice);

  const hasDiscount = !isWholesale && (selectedVariant ? !!selectedVariant.discountedPrice : !!product.discountedPrice);
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleVariantChange = (v: any) => {
    setSelectedVariant(v);
    setQuantity(1); // reset quantity to 1
    setFeedback(null);
  };

  const handleAddToCart = async () => {
    setAdding(true);
    setFeedback(null);

    const result = await addToCart(
      product.id,
      selectedVariant ? selectedVariant.id : null,
      quantity,
      product,
      selectedVariant
    );

    if (result.success) {
      setFeedback({ success: true, message: 'Added to cart successfully!' });
    } else {
      setFeedback({ success: false, message: result.error || 'Failed to add item to cart' });
    }
    setAdding(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* Product Image Panel */}
      <div className="lg:col-span-5 bg-brand-gray border border-gray-100 rounded-3xl h-96 flex items-center justify-center p-8 relative">
        <div className="text-center space-y-2 text-brand-blue">
          <ClipboardList size={64} className="mx-auto opacity-35" />
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Chemical Product</span>
        </div>
        <span className="absolute bottom-6 right-6 bg-white/95 text-brand-blue text-xs font-bold px-3.5 py-1 rounded-full border border-gray-55">
          Standard Package
        </span>
      </div>

      {/* Product Details Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-brand-green tracking-widest">
            {product.category?.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            {product.name}
          </h1>
          <p className="text-gray-500 font-semibold text-sm">
            SKU: {selectedVariant ? selectedVariant.sku : product.sku}
          </p>
        </div>

        {/* Pricing Panel */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">
              {isWholesale ? 'Wholesale Price Active' : 'Retail Price'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-blue">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through font-semibold">
                  Rs. {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {selectedVariant && (
              <span className="text-xs text-gray-500 font-semibold">
                Selected Size: {selectedVariant.name}
              </span>
            )}
          </div>

          {/* Wholesale Promotion if not logged in as wholesaler */}
          {!isWholesale && (
            <div className="text-right max-w-xs hidden sm:block">
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-black px-2.5 py-1 rounded-full border border-amber-100">
                <Award size={12} /> B2B Price Available
              </span>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">
                Kirana stores & distributors can register to view wholesale prices (Min. order Rs. 10k).
              </p>
            </div>
          )}
        </div>

        {/* Variants Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800">Select Packaging / Size Variant</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => handleVariantChange(v)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
                    selectedVariant?.id === v.id
                      ? 'bg-brand-blue border-brand-blue text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {v.name} (Rs. {isWholesale ? Number(v.wholesalePrice).toLocaleString() : (v.discountedPrice ? Number(v.discountedPrice).toLocaleString() : Number(v.retailPrice).toLocaleString())})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock status */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-gray-600">Stock Availability:</span>
          {currentStock > 10 ? (
            <span className="text-brand-green font-extrabold flex items-center gap-1">
              <Check size={14} /> In Stock ({currentStock} available)
            </span>
          ) : currentStock > 0 ? (
            <span className="text-amber-600 font-extrabold flex items-center gap-1">
              <AlertTriangle size={14} /> Low Stock! Only {currentStock} left
            </span>
          ) : (
            <span className="text-red-600 font-extrabold flex items-center gap-1">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quantity and Cart Action */}
        <div className="flex flex-wrap gap-4 items-center pt-2">
          {/* Quantity Controls */}
          {currentStock > 0 && (
            <div className="flex border border-gray-200 rounded-xl overflow-hidden shrink-0 bg-white">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
                className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 font-bold"
              >
                -
              </button>
              <span className="px-5 py-2 text-sm font-bold text-gray-800 flex items-center justify-center min-w-10">
                {quantity}
              </span>
              <button
                disabled={quantity >= currentStock}
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 font-bold"
              >
                +
              </button>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={currentStock <= 0 || adding}
            className="flex-1 py-3 px-6 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-blue/10"
          >
            <ShoppingCart size={16} />
            {adding ? 'Adding...' : 'Add to Shopping Cart'}
          </button>
        </div>

        {/* Cart feedback alert */}
        {feedback && (
          <div className={`p-4 rounded-xl border text-xs font-bold ${
            feedback.success 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {feedback.message}
            {feedback.success && (
              <Link href="/cart" className="underline ml-2 text-brand-blue block sm:inline mt-1 sm:mt-0">
                Go to Cart & Checkout &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Tabbed Info Panel (Usage, Safety, Ingredients) */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div className="flex border-b border-gray-100 text-xs font-bold gap-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 border-b-2 transition ${
                activeTab === 'info' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Description
            </button>
            {(product.usageInstructions || selectedVariant) && (
              <button
                onClick={() => setActiveTab('usage')}
                className={`pb-2 border-b-2 transition ${
                  activeTab === 'usage' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Usage Instructions
              </button>
            )}
            {(product.safetyInstructions || selectedVariant) && (
              <button
                onClick={() => setActiveTab('safety')}
                className={`pb-2 border-b-2 transition ${
                  activeTab === 'safety' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Safety Guidelines
              </button>
            )}
            {product.ingredients && (
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-2 border-b-2 transition ${
                  activeTab === 'ingredients' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Composition
              </button>
            )}
          </div>

          <div className="text-xs text-gray-600 leading-relaxed font-medium min-h-[100px]">
            {activeTab === 'info' && (
              <p className="whitespace-pre-line">{product.description}</p>
            )}
            {activeTab === 'usage' && (
              <div className="space-y-2">
                <p className="font-bold text-gray-800 flex items-center gap-1">
                  <Info size={14} className="text-brand-blue" /> Recommended Usage:
                </p>
                <p className="whitespace-pre-line">{product.usageInstructions || 'Shake well. Dilute 20ml fluid in 4 liters of clean water. Mop gently.'}</p>
              </div>
            )}
            {activeTab === 'safety' && (
              <div className="space-y-2 bg-amber-50/50 p-4 border border-amber-100 rounded-xl">
                <p className="font-bold text-amber-800 flex items-center gap-1">
                  <ShieldAlert size={14} className="text-amber-600" /> Precautionary Guidelines:
                </p>
                <p className="text-amber-800 whitespace-pre-line">{product.safetyInstructions || 'Keep out of reach of children. Avoid skin and eye contact. If swallowed, call poison control immediately.'}</p>
              </div>
            )}
            {activeTab === 'ingredients' && (
              <div>
                <p className="font-bold text-gray-800 mb-1">Active Chemical Ingredients:</p>
                <p>{product.ingredients}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
