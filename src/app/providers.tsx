'use client';

import React from 'react';
import { AuthProvider } from 'src/context/AuthContext';
import { CartProvider } from 'src/context/CartContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
