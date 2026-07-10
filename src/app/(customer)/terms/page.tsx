import React from 'react';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-6 text-xs font-semibold text-gray-650 leading-relaxed">
        <h1 className="text-2xl font-black text-gray-900 border-b border-gray-150 pb-2">Terms & Conditions</h1>
        
        <p>
          Welcome to the official online storefront of **Mala Phenyle Chemical Works** based in Birgunj, Nepal. By placing an order, you agree to comply with the terms below.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">1. Order Placement and Cancellations</h3>
        <p>
          We reserves the right to reject orders in cases of stock shortages or inaccurate pricing configurations. Customers may cancel Cash on Delivery orders at any time before they enter transit status, which automatically restores product stock limits.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">2. B2B Wholesale Minimum Order Value</h3>
        <p>
          To purchase at wholesale price tiers, wholesale accounts must satisfy the minimum order value threshold of **Rs. 10,000** (or as adjusted in ShopSettings) per checkout.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">3. Chemical Handling Precautions</h3>
        <p>
          Mala Phenyle Chemical Works manufactures concentrated cleaning solutions. By buying our products, you agree to review and strictly follow all usage and safety sheets. We hold no liability for chemical misuse or accidental child ingestion.
        </p>
      </main>
      <Footer />
    </>
  );
}
