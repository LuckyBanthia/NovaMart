import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('novamart_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    localStorage.setItem('novamart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockQuantity) }
            : item
        );
      } else {
        return [...prev, { product, quantity: Math.min(quantity, product.stockQuantity) }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const max = item.product.stockQuantity;
          return { ...item, quantity: Math.min(newQuantity, max) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setDiscountPercent(0);
    setCouponMessage({ text: '', isError: false });
    localStorage.removeItem('novamart_cart');
  };

  const applyCoupon = (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'NOVASAVE10') {
      setCouponCode(cleanCode);
      setDiscountPercent(10);
      setCouponMessage({ text: '10% discount applied successfully!', isError: false });
      return true;
    } else if (cleanCode === 'WELCOME20') {
      setCouponCode(cleanCode);
      setDiscountPercent(20);
      setCouponMessage({ text: '20% special welcome discount applied!', isError: false });
      return true;
    } else {
      setCouponMessage({ text: 'Invalid coupon code. Try NOVASAVE10 or WELCOME20', isError: true });
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setCouponMessage({ text: '', isError: false });
  };

  // Financial calculations
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price) || 0;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxableAmount * 0.05).toFixed(2));
  const freeShippingThreshold = 50;
  const shippingFee = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 9.99;
  const total = Math.max(0, Number((taxableAmount + tax + shippingFee).toFixed(2)));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        couponCode,
        discountPercent,
        discountAmount,
        couponMessage,
        applyCoupon,
        removeCoupon,
        subtotal,
        tax,
        shippingFee,
        total,
        freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
