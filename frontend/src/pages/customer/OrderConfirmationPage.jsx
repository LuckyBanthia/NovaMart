import React from 'react';
import { CheckCircle, Printer, Download, ArrowRight, Package, Clock, ShieldCheck, Truck } from 'lucide-react';
import { downloadReceiptHtml } from '../../utils/receiptDownloader';

export const OrderConfirmationPage = ({ order, onOpenReceipt, onContinueShopping, onNavigateOrders }) => {
  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Badge Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-emerald-500/10">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Payment Verified & Authorized
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Confirmed Successfully!
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Thank you, <strong>{order.recipientName}</strong>. Your purchase has been processed and your official digital tax receipt is ready.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 max-w-md mx-auto flex flex-col sm:flex-row justify-between text-xs gap-3">
          <div>
            <span className="text-slate-400 block text-[11px]">Order Reference</span>
            <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Paid</span>
            <span className="font-bold text-blue-600">${Number(order.totalAmount).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Payment Method</span>
            <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Primary Actions: Download Receipt & View / Print */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => downloadReceiptHtml(order)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Receipt</span>
          </button>

          <button
            onClick={onOpenReceipt}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>View Receipt</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-blue-200"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Order Timeline */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Delivery Progress & Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {[
            { label: 'Order Placed', status: 'Completed', icon: Clock, done: true },
            { label: 'Payment Settled', status: 'Verified', icon: ShieldCheck, done: true },
            { label: 'Warehouse Dispatch', status: 'Preparing', icon: Package, done: false },
            { label: 'Out for Delivery', status: 'Pending', icon: Truck, done: false },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                  step.done ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold">{step.label}</p>
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {step.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Delivering to: <strong className="text-slate-800">{order.addressLine1}, {order.city}</strong></span>
          <button 
            onClick={onNavigateOrders}
            className="text-blue-600 hover:underline font-semibold"
          >
            Manage in My Orders →
          </button>
        </div>
      </div>
    </div>
  );
};
