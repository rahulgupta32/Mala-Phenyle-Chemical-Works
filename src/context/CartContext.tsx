'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id?: string; // DB CartItem ID if registered
  productId: string;
  variantId: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    retailPrice: number | string;
    wholesalePrice: number | string;
    discountedPrice: number | string | null;
    images: Array<{ url: string }>;
    stock: number;
  };
  variant: {
    id: string;
    name: string;
    retailPrice: number | string;
    wholesalePrice: number | string;
    discountedPrice: number | string | null;
    stock: number;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, variantId: string | null, quantity: number, productDetails: any, variantDetails?: any) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (productId: string, variantId: string | null, quantity: number, itemId?: string) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (productId: string, variantId: string | null, itemId?: string) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<void>;
  cartSubtotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load cart on mount or when user session changes
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Registered: Fetch from API
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            // Map decimal string prices to numbers if needed
            setItems(data.items);
          }
        } catch (e) {
          console.error('Failed to load DB cart:', e);
        }
      } else {
        // Guest: Fetch from LocalStorage
        try {
          const stored = localStorage.getItem('mala_guest_cart');
          if (stored) {
            setItems(JSON.parse(stored));
          } else {
            setItems([]);
          }
        } catch (e) {
          console.error('Failed to load guest cart:', e);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Save guest cart to local storage when items change
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem('mala_guest_cart', JSON.stringify(items));
    }
  }, [items, user, loading]);

  // 2. Add Item
  const addToCart = async (
    productId: string,
    variantId: string | null,
    quantity: number,
    productDetails: any,
    variantDetails?: any
  ) => {
    const isWholesale = user?.role === 'WHOLESALE';

    // Verify stock availability on client first
    const availableStock = variantDetails ? variantDetails.stock : productDetails.stock;
    const existing = items.find((i) => i.productId === productId && i.variantId === variantId);
    const targetQty = (existing?.quantity || 0) + quantity;

    if (targetQty > availableStock) {
      return {
        success: false,
        error: `Cannot add. Selected quantity (${targetQty}) exceeds available stock (${availableStock}).`,
      };
    }

    if (user) {
      // Sync with API
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, variantId, quantity }),
        });
        const data = await res.json();
        
        if (res.ok) {
          // Re-fetch cart to get synced data
          const cartRes = await fetch('/api/cart');
          const cartData = await cartRes.json();
          setItems(cartData.items);
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Failed to add item to DB cart' };
        }
      } catch (e) {
        return { success: false, error: 'Network error. Could not save cart.' };
      }
    } else {
      // Manage local guest cart
      if (existing) {
        setItems(
          items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: targetQty }
              : i
          )
        );
      } else {
        const newItem: CartItem = {
          productId,
          variantId,
          quantity,
          product: {
            id: productDetails.id,
            name: productDetails.name,
            slug: productDetails.slug,
            retailPrice: productDetails.retailPrice,
            wholesalePrice: productDetails.wholesalePrice,
            discountedPrice: productDetails.discountedPrice,
            images: productDetails.images || [],
            stock: productDetails.stock,
          },
          variant: variantDetails ? {
            id: variantDetails.id,
            name: variantDetails.name,
            retailPrice: variantDetails.retailPrice,
            wholesalePrice: variantDetails.wholesalePrice,
            discountedPrice: variantDetails.discountedPrice,
            stock: variantDetails.stock,
          } : null,
        };
        setItems([...items, newItem]);
      }
      return { success: true };
    }
  };

  // 3. Update Quantity
  const updateQuantity = async (productId: string, variantId: string | null, quantity: number, itemId?: string) => {
    if (quantity <= 0) {
      return removeFromCart(productId, variantId, itemId);
    }

    const item = items.find((i) => i.productId === productId && i.variantId === variantId);
    if (!item) return { success: false, error: 'Item not found in cart' };

    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (quantity > availableStock) {
      return {
        success: false,
        error: `Cannot update. Requested quantity (${quantity}) exceeds available stock (${availableStock}).`,
      };
    }

    if (user && itemId) {
      try {
        const res = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, quantity }),
        });
        const data = await res.json();
        
        if (res.ok) {
          // Re-fetch cart
          const cartRes = await fetch('/api/cart');
          const cartData = await cartRes.json();
          setItems(cartData.items);
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Failed to update cart item' };
        }
      } catch (e) {
        return { success: false, error: 'Network error. Could not update cart.' };
      }
    } else {
      setItems(
        items.map((i) =>
          i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
        )
      );
      return { success: true };
    }
  };

  // 4. Remove Item
  const removeFromCart = async (productId: string, variantId: string | null, itemId?: string) => {
    if (user && itemId) {
      try {
        const res = await fetch(`/api/cart?itemId=${itemId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (res.ok) {
          setItems(items.filter((i) => i.id !== itemId));
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Failed to delete cart item' };
        }
      } catch (e) {
        return { success: false, error: 'Network error. Could not delete item.' };
      }
    } else {
      setItems(items.filter((i) => !(i.productId === productId && i.variantId === variantId)));
      return { success: true };
    }
  };

  // 5. Clear Cart
  const clearCart = async () => {
    if (user) {
      try {
        await fetch('/api/cart', { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to clear DB cart:', e);
      }
    }
    setItems([]);
    if (!user) {
      localStorage.removeItem('mala_guest_cart');
    }
  };

  // 6. Totals Calculations
  const isWholesale = user?.role === 'WHOLESALE';
  
  const cartSubtotal = items.reduce((sum, item) => {
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
    return sum + price * item.quantity;
  }, 0);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
