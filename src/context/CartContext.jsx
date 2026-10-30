import React, { createContext, useContext, useState, useEffect } from 'react';

const CART_KEY = 'fastor_cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart items to localStorage', e);
    }
  }, [items]);

  const addToCart = (item) => {
    setItems((prev) => [...prev, item]);
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_KEY);
    } catch (e) {
      console.warn('Failed to clear cart in localStorage', e);
    }
  };

  const value = {
    items,
    addToCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
