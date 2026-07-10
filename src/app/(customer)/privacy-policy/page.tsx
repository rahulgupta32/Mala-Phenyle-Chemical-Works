import React from 'react';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-6 text-xs font-semibold text-gray-650 leading-relaxed">
        <h1 className="text-2xl font-black text-gray-900 border-b border-gray-150 pb-2">Privacy Policy</h1>
        <p>
          At **Mala Phenyle Chemical Works**, we prioritize protecting the privacy of our retail and B2B wholesale customers in Nepal. This policy details what information we collect and how we utilize it.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">1. Information We Collect</h3>
        <p>
          When you register a profile or check out as a guest, we collect details like your full name, mobile number, shipping address details (Province, District, Municipality, Ward, Landmark), email address, and company PAN credentials (for wholesale applications).
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">2. Payment Security</h3>
        <p>
          Since we run primarily on Cash on Delivery (COD) services, we **do not** collect, process, or store credit card details or bank passwords. Any digital payment placeholders (eSewa, Khalti) redirect you directly to their official gateways.
        </p>

        <h3 className="text-sm font-bold text-gray-900 mt-4">3. Data Integrity</h3>
        <p>
          We do not sell, rent, or lease your personal identification records to third-party marketing services. Your address details are shared solely with authorized delivery couriers to ship your packages.
        </p>
      </main>
      <Footer />
    </>
  );
}
