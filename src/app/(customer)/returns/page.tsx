import React from 'react';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-6 text-xs font-semibold text-gray-650 leading-relaxed">
        <h1 className="text-2xl font-black text-gray-900 border-b border-gray-150 pb-2">Return & Refund Policy</h1>
        
        <p>
          At **Mala Phenyle Chemical Works**, we prioritize chemical safety and product quality. Please read our guidelines on package returns.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">1. Damaged or Leaking Containers</h3>
        <p>
          Chemical containers may suffer leakage during transit across provinces. If you receive a leaking white/black phenyle can or acidic toilet cleaner bottle, reject the package during delivery, or contact Sunil Gupta within 24 hours of package arrival for a free replacement.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">2. Unopened Container Returns</h3>
        <p>
          You can request returns for unused, completely sealed chemical containers within **7 days** of delivery. Returns will not be accepted for unsealed, partially used chemicals due to environmental contamination risks.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">3. Refund Processing</h3>
        <p>
          Refunds for returned unopened packages will be processed manually via digital bank transfer, eSewa, or Khalti wallets once the containers are returned to our Birgunj factory and verified.
        </p>
      </main>
      <Footer />
    </>
  );
}
