'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, Cart, CartItem, getAccessToken } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  addToCart: (courseId: string) => Promise<{ success: boolean; message: string }>;
  removeFromCart: (courseId: string) => Promise<{ success: boolean; message: string }>;
  checkout: () => Promise<{ success: boolean; message: string }>;
  clearCart: () => Promise<{ success: boolean; message: string }>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.getCart();
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        setCart(null);
      }
    } catch (error) {
      setCart(null);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  // Fetch cart when auth state changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (courseId: string) => {
    const token = getAccessToken();
    if (!token) {
      return { success: false, message: 'Please login to add to cart' };
    }

    const response = await api.addToCart(courseId);
    
    if (response.success && response.data) {
      setCart(response.data);
      return { success: true, message: 'Added to cart' };
    }
    
    return { success: false, message: response.message || 'Failed to add to cart' };
  }, []);

  const removeFromCart = useCallback(async (courseId: string) => {
    const response = await api.removeFromCart(courseId);
    
    if (response.success && response.data) {
      setCart(response.data);
      return { success: true, message: 'Removed from cart' };
    }
    
    return { success: false, message: response.message || 'Failed to remove from cart' };
  }, []);

  const checkout = useCallback(async () => {
    const response = await api.checkout();
    
    if (response.success) {
      setCart(null);
      return { success: true, message: 'Checkout successful! Courses added to your learning.' };
    }
    
    return { success: false, message: response.message || 'Checkout failed' };
  }, []);

  const clearCart = useCallback(async () => {
    const response = await api.clearCart();
    
    if (response.success) {
      setCart(null);
      return { success: true, message: 'Cart cleared' };
    }
    
    return { success: false, message: response.message || 'Failed to clear cart' };
  }, []);

  const cartCount = cart?.items?.length || 0;

  const value = {
    cart,
    cartCount,
    isLoading,
    addToCart,
    removeFromCart,
    checkout,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
