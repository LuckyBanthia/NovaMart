import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Free Shipping</h4>
                <p className="text-xs text-slate-500">On all orders above $50</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Secure Checkout</h4>
                <p className="text-xs text-slate-500">256-bit encrypted transactions</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">30-Day Returns</h4>
                <p className="text-xs text-slate-500">Hassle-free guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">24/7 Support</h4>
                <p className="text-xs text-slate-500">Dedicated care experts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                N
              </div>
              <span className="text-lg font-black text-slate-900">
                Nova<span className="text-blue-600">Mart</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Engineered with clean architecture, modern Spring Boot 3 security, and dynamic React interface. Built for seamless shopping and effortless order management.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Backend API: Online
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                Spring Boot 3 + MySQL
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Shop Categories</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><span className="hover:text-blue-600 cursor-pointer">Electronics & Laptops</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Audio & Headphones</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Minimalist Apparel</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Performance Footwear</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Workspace & Ambient</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Customer Support</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><span className="hover:text-blue-600 cursor-pointer">Track Your Order</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Download Invoice</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Shipping & Customs</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Returns & Exchanges</span></li>
              <li><span className="hover:text-blue-600 cursor-pointer">Privacy & Terms</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Accepted Payments</h5>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="px-2.5 py-1 bg-slate-100 rounded text-[11px] font-medium text-slate-700">Visa / Mastercard</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded text-[11px] font-medium text-slate-700">UPI / QR</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded text-[11px] font-medium text-slate-700">Net Banking</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded text-[11px] font-medium text-slate-700">Cash on Delivery</span>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Immediate tax receipts with unique verification codes provided upon checkout.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} NovaMart Inc. All rights reserved.</p>
          <p className="text-[11px]">Designed with elegance, speed, and modern software principles.</p>
        </div>
      </div>
    </footer>
  );
};
