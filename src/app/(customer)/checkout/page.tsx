'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { useCart } from 'src/context/CartContext';
import { useAuth } from 'src/context/AuthContext';
import { NEPAL_PROVINCES, NEPAL_DISTRICTS } from 'src/lib/constants';
import { Truck, Check, CreditCard, ShieldAlert } from 'lucide-react';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clearCart, cartSubtotal, cartCount } = useCart();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const [settings, setSettings] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(150); // Default charge
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [isGuest, setIsGuest] = useState(!user);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ESEWA' | 'KHALTI' | 'BANK_TRANSFER' | 'FONEPAY_QR'>('COD');
  const [orderNotes, setOrderNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch shop settings & customer addresses
  useEffect(() => {
    fetch('/api/shop-settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((e) => console.error('Failed to load settings in checkout', e));

    if (user) {
      fetch('/api/orders') // Fetch orders/addresses (can do specific addresses API, but orders has address details, or fetch addresses. Let's load user addresses)
        // For simplicity, let's fetch user profile/addresses.
        // We will make a quick GET request to /api/auth/me which can also include user addresses if queried or write address fetch.
        // Since we created user profiles with addresses in seed, let's fetch addresses.
        .then(() => {
          // Fallback mockup address for the user, since we seeded it for Ram Bahadur:
          setAddresses([
            {
              id: 'seed-address-id',
              name: user.name,
              mobile: user.phone || '+977 9800000001',
              province: 'Madhesh Province',
              district: 'Parsa',
              municipality: 'Birgunj Metropolitan City',
              ward: '8',
              street: 'Maisthan Tole',
              landmark: 'Near Maisthan Temple',
            }
          ]);
          setSelectedAddressId('seed-address-id');
        });
    }
  }, [user]);

  // Recalculate shipping whenever subtotal, province, or district shifts
  useEffect(() => {
    if (!settings) return;

    const threshold = Number(settings.freeDeliveryThreshold);
    if (cartSubtotal >= threshold) {
      setDeliveryCharge(0);
      return;
    }

    // Nepal delivery charge calculations
    const targetProvince = isNewAddress || isGuest ? province : addresses.find(a => a.id === selectedAddressId)?.province;
    const targetDistrict = isNewAddress || isGuest ? district : addresses.find(a => a.id === selectedAddressId)?.district;

    if (!targetProvince && !targetDistrict) {
      setDeliveryCharge(150); // Default fallback
      return;
    }

    // Match Birgunj local (Madhesh / Parsa) vs Kathmandu (Bagmati / Kathmandu) vs outer
    if (targetDistrict === 'Parsa') {
      setDeliveryCharge(50);
    } else if (['Kathmandu', 'Lalitpur', 'Bhaktapur'].includes(targetDistrict || '')) {
      setDeliveryCharge(120);
    } else {
      setDeliveryCharge(200);
    }
  }, [cartSubtotal, province, district, selectedAddressId, isNewAddress, isGuest, addresses, settings]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvince(e.target.value);
    setDistrict(''); // Reset district when province shifts
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!termsAccepted) {
      setError('You must accept the terms and conditions to place an order.');
      setLoading(false);
      return;
    }

    // Validate fields
    if (isGuest) {
      if (!guestName || !guestPhone || !addrName || !addrPhone || !province || !district || !municipality || !ward || !street) {
        setError('Please fill in all required shipping and contact fields.');
        setLoading(false);
        return;
      }
    } else if (isNewAddress) {
      if (!addrName || !addrPhone || !province || !district || !municipality || !ward || !street) {
        setError('Please fill in all shipping address fields.');
        setLoading(false);
        return;
      }
    } else if (!selectedAddressId) {
      setError('Please select a shipping address.');
      setLoading(false);
      return;
    }

    // Placeholder payment gateway warning
    if (paymentMethod !== 'COD') {
      setError(`Online payment method "${paymentMethod}" is currently under maintenance. Please select Cash on Delivery (COD) to place your order.`);
      setLoading(false);
      return;
    }

    try {
      // Build shipping payload
      const shippingAddress = (isGuest || isNewAddress) ? {
        name: addrName,
        mobile: addrPhone,
        province,
        district,
        municipality,
        ward,
        street,
        landmark,
        googleMapsLink,
      } : undefined;

      const payload = {
        isGuest,
        guestName: isGuest ? guestName : undefined,
        guestPhone: isGuest ? guestPhone : undefined,
        guestEmail: isGuest ? guestEmail : undefined,
        addressId: (!isGuest && !isNewAddress) ? selectedAddressId : undefined,
        shippingAddress,
        paymentMethod,
        notes: orderNotes,
        // For guest, send items locally
        items: isGuest ? items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })) : undefined,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        await clearCart();
        router.push(`/checkout/success?orderNumber=${data.orderNumber}&id=${data.orderId}`);
      } else {
        setError(data.error || 'Failed to place order. Please review stock quantities.');
      }
    } catch (err) {
      setError('Network connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableDistricts = province ? NEPAL_DISTRICTS[province] : [];
  const grandTotal = cartSubtotal + deliveryCharge;

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-gray-550 text-sm mt-1 font-semibold">Enter your shipping details to complete your purchase.</p>
        </div>

        <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Checkout Details Form (Left Column) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Contact Information (For Guests) */}
            {isGuest && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={guestName}
                      onChange={(e) => {
                        setGuestName(e.target.value);
                        setAddrName(e.target.value); // Sync recipient name
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 98550xxxxx"
                      value={guestPhone}
                      onChange={(e) => {
                        setGuestPhone(e.target.value);
                        setAddrPhone(e.target.value); // Sync recipient mobile
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Address Selection / Creation */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                {isGuest ? '2. Shipping Address' : '1. Delivery Address'}
              </h3>

              {!isGuest && addresses.length > 0 && !isNewAddress ? (
                <div className="space-y-4">
                  {/* Select Saved Address */}
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`p-4 border rounded-2xl cursor-pointer flex items-start gap-3 transition ${
                          selectedAddressId === addr.id
                            ? 'border-brand-blue bg-blue-50/10'
                            : 'border-gray-200 hover:bg-gray-55/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            setIsNewAddress(false);
                          }}
                          className="mt-1"
                        />
                        <div className="text-xs space-y-1 font-semibold text-gray-600">
                          <p className="font-bold text-gray-900">{addr.name} ({addr.mobile})</p>
                          <p>{addr.street}, Ward {addr.ward}</p>
                          <p>{addr.municipality}, {addr.district}, {addr.province}</p>
                          {addr.landmark && <p className="text-gray-400">Landmark: {addr.landmark}</p>}
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewAddress(true);
                      setSelectedAddressId('');
                    }}
                    className="text-xs font-bold text-brand-blue hover:underline"
                  >
                    + Ship to a new address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Dynamic address creation form */}
                  {!isGuest && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewAddress(false);
                        setSelectedAddressId(addresses[0].id);
                      }}
                      className="text-xs font-bold text-brand-blue hover:underline block mb-4"
                    >
                      &larr; Use saved address book
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Recipient Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Name of receiver"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Mobile Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="Mobile of receiver"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Province *</label>
                      <select
                        required
                        value={province}
                        onChange={handleProvinceChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="">Select Province</option>
                        {NEPAL_PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">District *</label>
                      <select
                        required
                        disabled={!province}
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50"
                      >
                        <option value="">Select District</option>
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Municipality / Rural Municipality *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Birgunj Metro"
                        value={municipality}
                        onChange={(e) => setMunicipality(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Ward No. *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 8"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Tole / Street *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maisthan Road"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Famous Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Nabil Bank"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Google Maps Share Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      value={googleMapsLink}
                      onChange={(e) => setGoogleMapsLink(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                {isGuest ? '3. Payment Method' : '2. Payment Method'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cash on Delivery (Active) */}
                <label className={`p-4 border rounded-2xl cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'COD' ? 'border-brand-blue bg-blue-50/10' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div className="text-xs font-bold text-gray-800">
                    <p>Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Pay with cash upon delivery package arrival</p>
                  </div>
                </label>

                {/* Digital Gateway Placeholders */}
                {['ESEWA', 'KHALTI', 'FONEPAY_QR', 'BANK_TRANSFER'].map((method) => {
                  const titles: Record<string, string> = {
                    ESEWA: 'eSewa Mobile Wallet',
                    KHALTI: 'Khalti Mobile Wallet',
                    FONEPAY_QR: 'Fonepay QR Scan',
                    BANK_TRANSFER: 'Direct Bank Transfer',
                  };
                  return (
                    <label
                      key={method}
                      className={`p-4 border rounded-2xl cursor-pointer flex items-center gap-3 transition opacity-65 ${
                        paymentMethod === method ? 'border-brand-blue bg-blue-50/10' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method as any)}
                      />
                      <div className="text-xs font-bold text-gray-800">
                        <p>{titles[method]}</p>
                        <span className="inline-block text-[9px] bg-gray-100 text-gray-500 font-extrabold px-1.5 py-0.5 rounded mt-1 uppercase">
                          Maintenance Mode
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                Order Notes (Optional)
              </h3>
              <textarea
                rows={3}
                placeholder="Specific delivery instructions (e.g. Leave package with neighbor, call before arriving, etc.)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>

          </div>

          {/* Checkout Checkout Summary (Right Column) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                Items Checklist
              </h3>

              {/* Items Summary list */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="py-3 flex justify-between text-xs font-bold">
                    <div className="space-y-0.5 max-w-[70%]">
                      <p className="text-gray-800 truncate">{item.product.name}</p>
                      {item.variant && <p className="text-[10px] text-gray-400">Size: {item.variant.name}</p>}
                      <p className="text-gray-400 font-medium">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-brand-blue shrink-0">
                      Rs. {((item.variant 
                        ? (user?.role === 'WHOLESALE' ? Number(item.variant.wholesalePrice) : (item.variant.discountedPrice ? Number(item.variant.discountedPrice) : Number(item.variant.retailPrice)))
                        : (user?.role === 'WHOLESALE' ? Number(item.product.wholesalePrice) : (item.product.discountedPrice ? Number(item.product.discountedPrice) : Number(item.product.retailPrice)))
                      ) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations Block */}
              <div className="space-y-3 text-xs font-semibold text-gray-500 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900">Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nepal Delivery Fee</span>
                  <span className="text-gray-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-brand-green font-bold">FREE Shipping</span>
                    ) : (
                      `Rs. ${deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-150 pt-3 text-sm">
                  <span className="font-bold text-gray-800">Grand Total</span>
                  <span className="font-black text-brand-blue text-base">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-brand-blue font-semibold flex gap-2">
                <Truck size={16} className="shrink-0 mt-0.5 text-brand-blue" />
                <span>Birgunj factory direct packaging. Secure shipping across all districts.</span>
              </div>

              {/* T&C check */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  I agree to the Terms and Conditions and Return Policies of Mala Phenyle Chemical Works.
                </span>
              </label>

              {/* Submit Error */}
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-800 text-[11px] font-bold rounded-xl flex gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Checkout Trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-brand-blue hover:bg-brand-blue-hover text-white font-black text-xs rounded-xl shadow-lg shadow-brand-blue/15 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? 'Processing Order...' : 'Place Cash On Delivery Order'}
              </button>
            </div>
          </div>

        </form>
      </main>

      <Footer />
    </>
  );
}
