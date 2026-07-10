import React from 'react';
import Navbar from 'src/components/storefront/Navbar';
import Footer from 'src/components/storefront/Footer';
import { ShieldCheck, Award, Factory, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">About Mala Phenyle Chemical Works</h1>
          <p className="text-brand-green text-sm font-bold uppercase tracking-wider">Hygienic Cleaning Solutions Manufacturer Since 2026</p>
        </div>

        {/* Narrative */}
        <section className="bg-white border border-gray-150 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 text-xs font-semibold text-gray-650 leading-relaxed">
          <p>
            Mala Phenyle Chemical Works is a premier chemical manufacturing and distribution enterprise located in the industrial hub of **Birgunj, Nepal**. Established to bridge the gap between heavy imports and domestic supply, we develop high-grade, commercial disinfectants and household hygiene products directly for the Nepali market.
          </p>

          <p>
            Our core competence lies in the formulation of pine-oil based emulsion fluids (**White Phenyle**), creosote coal-tar based industrial disinfectants (**Black Phenyle**), hydrochloric acid-based scaling cleansers (**Toilet Cleaners**), and pH-balanced surfactant blends (**Liquid Soaps & Detergents**).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="flex gap-3 items-start">
              <div className="p-2.5 bg-blue-50 text-brand-blue rounded-xl shrink-0 mt-0.5">
                <Factory size={16} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Domestic Manufacturing</h4>
                <p className="text-gray-550 mt-1 font-semibold">Supporting Nepal&apos;s local economies by establishing robust chemical manufacturing infrastructure and job opportunities in Birgunj, Parsa.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="p-2.5 bg-emerald-50 text-brand-green rounded-xl shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">German Emulsifiers</h4>
                <p className="text-gray-500 mt-1 font-semibold">Combining high-purity natural pine oils with advanced German surfactant technology to achieve a dense, stable emulsion with long-lasting scent.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="text-center space-y-6">
          <h2 className="text-xl font-black text-gray-900">Why Customers Trust Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-bold text-gray-900">Pure Pine Formulation</h3>
              <p className="text-gray-500 font-semibold leading-relaxed">We never dilute our pine content with toxic solvents, ensuring 100% natural aroma and disinfections.</p>
            </div>
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-bold text-gray-900">Nepal-wide Delivery</h3>
              <p className="text-gray-500 font-semibold leading-relaxed">Collaborating with local shipping networks to transport chemical containers directly to remote regions.</p>
            </div>
            <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-bold text-gray-900">Corporate PAN Compliance</h3>
              <p className="text-gray-500 font-semibold leading-relaxed">Providing clean tax invoicing records (PAN/VAT bills) for educational institutes and industrial partners.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
