'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { Trash2, ShoppingBag, ArrowRight, Award, ShieldCheck, Info } from 'lucide-react';
import { useCart } from 'src/context/CartContext';
import { useAuth } from 'src/context/AuthContext';

export default function CartPage() {
  const { user } = useAuth();
  const { items, loading, updateQuantity, removeFromCart, cartSubtotal, cartCount } = useCart();
  const [settings, setSettings] = useState<any>(null);

  // Fetch settings for wholesale minimum and free delivery thresholds
  useEffect(() => {
    fetch('/api/shop-settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((e) => console.error('Failed to load settings in cart', e));
  }, []);

  const isWholesale = user?.role === 'WHOLESALE';
  const minWholesaleLimit = settings ? Number(settings.minWholesaleOrderAmount) : 10000.00;
  const isWholesaleAllowed = !isWholesale || cartSubtotal >= minWholesaleLimit;

  const getPrice = (item: any) => {
    let price = Number(item.product.retailPrice);
    if (isWholesale) {
      price = Number(item.product.wholesalePrice);
    } else if (item.product.discountedPrice) {
      price = Number(item.product.discountedPrice);
    }

    if (item.variant) {
      price = isWholesale
        ? Number(item.variant.wholesalePrice)
        : (item.variant.discountedPrice ? Number(item.variant.discountedPrice) : Number(item.variant.retailPrice));
    }
    return price;
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-gray-550 text-sm mt-1 font-semibold">Review your selected items and package sizes.</p>
        </div>

        {loading ? (
          <div className="h-64 bg-white border border-gray-100 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold">
            Loading cart items...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl space-y-4">
            <ShoppingBag size={48} className="mx-auto text-gray-300" />
            <h3 className="text-lg font-bold text-gray-700">Your cart is empty</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">
              You have not added any cleaning liquids or sanitizers to your cart yet.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="px-6 py-3 bg-brand-blue text-white text-xs font-bold rounded-xl hover:bg-brand-blue-hover transition"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-150">
                {items.map((item) => {
                  const itemPrice = getPrice(item);
                  const maxStock = item.variant ? item.variant.stock : item.product.stock;

                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                      {/* Item Details */}
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-brand-gray border border-gray-100 rounded-xl flex items-center justify-center shrink-0 text-brand-blue font-bold text-xs">
                          {item.product.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black text-gray-900 text-sm leading-snug">
                            {item.product.name}
                          </h3>
                          {item.variant && (
                            <span className="inline-block text-[10px] bg-brand-blue/5 text-brand-blue font-bold px-2 py-0.5 rounded-full border border-brand-blue/10">
                              Size: {item.variant.name}
                            </span>
                          )}
                          <p className="text-xs text-brand-green font-bold">
                            Rs. {itemPrice.toLocaleString()} each
                          </p>
                        </div>
                      </div>

                      {/* Quantity and Actions */}
                      <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                        <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white shrink-0">
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1, item.id)}
                            className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 font-bold"
                          >
                            -
                          </button>
                          <span className="px-4 py-1.5 text-xs font-bold text-gray-800 flex items-center justify-center min-w-8">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= maxStock}
                            onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1, item.id)}
                            className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40 font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900">
                            Rs. {(itemPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId, item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Summary Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-4 text-xs font-semibold text-gray-500">
                  <div className="flex justify-between">
                    <span>Total Quantity</span>
                    <span className="text-gray-900">{cartCount} items</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-150 pt-4 text-sm">
                    <span className="font-bold text-gray-800">Cart Subtotal</span>
                    <span className="font-black text-brand-blue text-base">
                      Rs. {cartSubtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Wholesale Restrictions Indicator */}
                {isWholesale && !isWholesaleAllowed && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2 text-amber-800 text-xs">
                    <p className="font-bold flex items-center gap-1">
                      <Award size={14} className="text-brand-gold" /> Wholesale Minimum Limit Not Met
                    </p>
                    <p className="leading-relaxed">
                      Wholesale accounts require a minimum subtotal of **Rs. {minWholesaleLimit.toLocaleString()}** to place orders. Add **Rs. {(minWholesaleLimit - cartSubtotal).toLocaleString()}** more to proceed.
                    </p>
                  </div>
                )}

                {/* Shipping Hint */}
                {settings && (
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] text-gray-500 font-medium flex gap-2">
                    <Info size={14} className="text-brand-blue shrink-0 mt-0.5" />
                    <span>
                      Orders above Rs. {Number(settings.freeDeliveryThreshold).toLocaleString()} qualify for **Free Shipping** retail-wide!
                    </span>
                  </div>
                )}

                {/* Checkout Trigger */}
                <Link
                  href={isWholesaleAllowed ? '/checkout' : '#'}
                  onClick={(e) => {
                    if (!isWholesaleAllowed) e.preventDefault();
                  }}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs text-center shadow-lg transition flex items-center justify-center gap-2 ${
                    isWholesaleAllowed
                      ? 'bg-brand-blue text-white hover:bg-brand-blue-hover shadow-brand-blue/15'
                      : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </Link>
              </div>

              {/* B2B callout (if guest or retail customer) */}
              {!isWholesale && (
                <div className="bg-gradient-to-br from-emerald-800 to-brand-green text-white p-5 rounded-3xl shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} className="text-brand-gold" /> Wholesale Account benefits
                  </h4>
                  <p className="text-[10px] leading-relaxed text-emerald-100">
                    Are you a retailer, grocery shop owner, or distributor? Apply for a wholesale account to unlock bulk factory prices and direct supply channels.
                  </p>
                  <Link
                    href="/wholesale-register"
                    className="inline-block text-[10px] bg-white text-brand-green hover:bg-gray-50 font-black px-3.5 py-1.5 rounded-lg transition"
                  >
                    Apply Now
                  </Link>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
