import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  Tag, 
  Smartphone, 
  Building2, 
  Banknote,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../api/api';

export const CheckoutPage = ({ onOrderSuccess, onBack, onOpenAuth }) => {
  const { 
    cartItems, 
    subtotal, 
    discountAmount, 
    discountPercent, 
    couponCode, 
    tax, 
    shippingFee, 
    total, 
    clearCart,
    applyCoupon,
    removeCoupon 
  } = useCart();

  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputCoupon, setInputCoupon] = useState('');

  // Shipping Form State
  const [shippingData, setShippingData] = useState({
    recipientName: user?.name || 'Sarah Connor',
    phone: user?.phone || '+1 (555) 382-9102',
    addressLine1: user?.address || '742 Evergreen Terrace',
    addressLine2: 'Apt 4B',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
  });

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '888',
    cardholder: user?.name || 'Sarah Connor',
  });
  const [upiId, setUpiId] = useState('user@okaxis');

  const handleInputChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        recipientName: shippingData.recipientName,
        phone: shippingData.phone,
        addressLine1: shippingData.addressLine1,
        addressLine2: shippingData.addressLine2,
        city: shippingData.city,
        state: shippingData.state,
        postalCode: shippingData.postalCode,
        paymentMethod: paymentMethod,
        couponCode: couponCode || null,
      };

      const res = await orderAPI.createOrder(orderPayload);
      if (res.data?.success) {
        // Fire confetti celebration!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b'],
        });

        clearCart();
        onOrderSuccess(res.data.data);
      } else {
        setErrorMessage(res.data?.message || 'Failed to process order');
      }
    } catch (err) {
      console.error('Order error:', err);
      setErrorMessage(
        err.response?.data?.message || 
        'Order placement error. Please ensure you are logged in.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">Add items to your cart before proceeding to checkout.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Secure Checkout & Payment
        </h1>
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You need to be signed in to finalize this order and receive your official payment receipt.</span>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Sign In Now
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Truck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                1. Delivery Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="recipientName"
                  required
                  value={shippingData.recipientName}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={shippingData.phone}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  placeholder="Street address, building, suite"
                  value={shippingData.addressLine1}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Apartment, unit, floor"
                  value={shippingData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingData.city}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={shippingData.state}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={shippingData.postalCode}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                2. Payment Method Simulation
              </h2>
            </div>

            {/* Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                { id: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
                { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-bold">{method.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive simulated input depending on selection */}
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 mt-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number (Simulated)</label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 mt-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  A payment request will be simulated and settled automatically upon clicking Complete Order.
                </p>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mt-4 text-xs text-slate-600">
                <span>Pay in cash or through mobile payment QR when the courier arrives at your doorstep.</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>All payment methods are verified and encrypted with 256-bit SSL protocols.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide pb-3 border-b border-slate-100">
              Order Summary ({cartItems.length} items)
            </h3>

            {/* Items review snippet */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{product.title}</p>
                      <p className="text-slate-400 text-[11px]">Qty: {quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ${(Number(product.price) * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Engine */}
            <div className="pt-3 border-t border-slate-100">
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="text-emerald-800 font-semibold">
                    Coupon <strong>{couponCode}</strong> (-{discountPercent}%)
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:text-red-700 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (NOVASAVE10)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none uppercase font-semibold focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (inputCoupon.trim()) {
                        applyCoupon(inputCoupon);
                        setInputCoupon('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sales Tax (5%)</span>
                <span className="font-medium text-slate-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-slate-800">
                  {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t-2 border-slate-900 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Due</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payment & Generate Receipt</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400">
              By placing this order, an official tax receipt will be issued immediately with downloadable PDF invoice.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
