'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageSquare, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState<any>({
    businessName: 'Mala Phenyle Chemical Works',
    businessAddress: 'Birgunj, Nepal',
    supportEmail: 'Sunilgupta335566@gmail.com',
    supportPhone: '+977 9855033186',
    supportPhoneAlternative: '+977 9845034186',
    whatsappViber: '+977 9855033186',
    facebookUrl: 'https://facebook.com',
    instagramUrl: 'https://instagram.com',
  });

  useEffect(() => {
    fetch('/api/shop-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch((e) => console.error('Failed to load footer settings', e));
  }, []);

  return (
    <footer className="bg-brand-charcoal text-white mt-auto pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* About Company */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-wider text-brand-gold uppercase">
            {settings.businessName}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Leading manufacturer and supplier of high-quality White Phenyle, Black Phenyle, Toilet Cleaners, Liquid Soaps, and industrial cleaning solutions in Nepal. Dedicated to hygiene and household safety since inception.
          </p>
          <div className="flex gap-4 pt-2">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-brand-blue hover:text-white rounded-full text-gray-400 transition">
                <Facebook size={18} />
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-brand-gold hover:text-white rounded-full text-gray-400 transition">
                <Instagram size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Categories Linkages */}
        <div>
          <h3 className="text-sm font-bold text-gray-200 tracking-widest uppercase mb-4 border-b border-gray-800 pb-2">
            Categories
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-400 font-semibold">
            <li><Link href="/products?category=phenyle" className="hover:text-brand-gold transition">Phenyle Disinfectants</Link></li>
            <li><Link href="/products?category=toilet-cleaner" className="hover:text-brand-gold transition">Toilet Cleaners</Link></li>
            <li><Link href="/products?category=liquid-soap" className="hover:text-brand-gold transition">Handwash & Liquid Soaps</Link></li>
            <li><Link href="/products?category=detergent" className="hover:text-brand-gold transition">Detergent Powders</Link></li>
            <li><Link href="/products?category=floor-cleaner" className="hover:text-brand-gold transition">Floor & Surface Cleaners</Link></li>
            <li><Link href="/products?category=bulk-supplies" className="hover:text-brand-gold transition">Bulk Industrial Supplies</Link></li>
          </ul>
        </div>

        {/* Corporate Links */}
        <div>
          <h3 className="text-sm font-bold text-gray-200 tracking-widest uppercase mb-4 border-b border-gray-800 pb-2">
            Information
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-400 font-semibold">
            <li><Link href="/about" className="hover:text-brand-gold transition">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand-gold transition">Contact Us</Link></li>
            <li><Link href="/wholesale-register" className="hover:text-brand-gold transition">Distributor Registration</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-brand-gold transition">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-brand-gold transition">Terms & Conditions</Link></li>
            <li><Link href="/returns" className="hover:text-brand-gold transition">Return & Refund Policy</Link></li>
          </ul>
        </div>

        {/* Direct Contact Contacts */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-200 tracking-widest uppercase mb-4 border-b border-gray-800 pb-2">
            Get In Touch
          </h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex gap-3 items-start">
              <MapPin size={18} className="text-brand-gold shrink-0 mt-0.5" />
              <span>{settings.businessAddress}</span>
            </div>
            
            <div className="flex gap-3 items-start">
              <Phone size={18} className="text-brand-green shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <a href={`tel:${settings.supportPhone}`} className="hover:text-white transition">{settings.supportPhone}</a>
                {settings.supportPhoneAlternative && (
                  <a href={`tel:${settings.supportPhoneAlternative}`} className="hover:text-white transition">{settings.supportPhoneAlternative}</a>
                )}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <Mail size={18} className="text-brand-gold shrink-0" />
              <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition block truncate max-w-[220px]">
                {settings.supportEmail}
              </a>
            </div>

            <div className="flex gap-3 items-center">
              <MessageSquare size={18} className="text-brand-green shrink-0" />
              <a href={`https://wa.me/${settings.whatsappViber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                Viber / WhatsApp Support
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-500 font-medium">
        <p>&copy; {new Date().getFullYear()} {settings.businessName}. All Rights Reserved. Birgunj, Nepal.</p>
        <p className="mt-1">Developed for digital expansion across all 7 provinces of Nepal.</p>
      </div>
    </footer>
  );
}
