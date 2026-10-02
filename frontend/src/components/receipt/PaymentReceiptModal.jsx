import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, ShoppingBag, ArrowLeft } from 'lucide-react';
import { downloadReceiptHtml } from '../../utils/receiptDownloader';

export const PaymentReceiptModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.orderDate 
    ? new Date(order.orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Modal Action Header (Excluded in Print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wide">Verified Payment Receipt & Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadReceiptHtml(order)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
              title="Download standalone receipt file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Receipt</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Invoice Container */}
        <div id="printable-receipt" className="p-6 sm:p-10 text-slate-800 bg-white">
          
          {/* Header Row: Company Details & Invoice Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                  N
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Nova<span className="text-blue-600">Mart</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">NovaMart Global Technologies Inc.</p>
              <p className="text-xs text-slate-400">100 Innovation Boulevard, Tech District</p>
              <p className="text-xs text-slate-400">support@novamart.com • +1 (800) 555-0199</p>
              <p className="text-[11px] text-slate-400 mt-1">Tax ID / GSTIN: <strong>NV992817462B1Z8</strong></p>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PAYMENT CONFIRMED</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">OFFICIAL TAX INVOICE</h2>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Receipt #: <span className="font-mono text-slate-900">{order.orderNumber}</span>
              </p>
              <p className="text-xs text-slate-500">Date: {formattedDate}</p>
              <p className="text-xs text-slate-500 font-mono">Txn ID: {order.transactionId || 'TXN-DIRECT-SETTLED'}</p>
            </div>
          </div>

          {/* Billing & Shipping Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billed & Shipped To</h4>
              <p className="text-sm font-bold text-slate-900">{order.recipientName}</p>
              <p className="text-slate-600 mt-0.5">{order.addressLine1}</p>
              {order.addressLine2 && <p className="text-slate-600">{order.addressLine2}</p>}
              <p className="text-slate-600">{order.city}, {order.state} {order.postalCode}</p>
              <p className="text-slate-500 mt-1">Phone: {order.phone}</p>
              {order.userEmail && <p className="text-slate-500">Email: {order.userEmail}</p>}
            </div>

            <div className="sm:text-right">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Details</h4>
              <p className="text-slate-700 font-semibold">Method: {order.paymentMethod || 'Credit / Debit Card'}</p>
              <p className="text-slate-500 mt-0.5">Status: <span className="text-emerald-600 font-bold">PAID (Settled)</span></p>
              <p className="text-slate-500">Delivery Status: <span className="text-blue-600 font-semibold">{order.status}</span></p>
              <p className="text-slate-400 text-[11px] mt-2">Standard Delivery (3-5 Business Days)</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Itemized Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">Item Description</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Unit Price</th>
                    <th className="py-2.5 px-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items && order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-2 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-2">
                        <p className="font-semibold text-slate-900">{item.productName}</p>
                        <p className="text-[10px] text-slate-400">SKU: NM-PROD-{item.productId || '0' + (idx + 1)}</p>
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700">{item.quantity}</td>
                      <td className="py-3 px-2 text-right font-medium text-slate-600">
                        ${Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-slate-900">
                        ${Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 gap-6">
            <div className="max-w-xs text-xs text-slate-400">
              <p className="font-semibold text-slate-600 mb-1">Terms & Guarantee</p>
              <p className="text-[11px] leading-relaxed">
                Thank you for your purchase with NovaMart. This receipt serves as your official warranty and return certificate valid for 30 days from dispatch.
              </p>
              {/* Simulated barcode */}
              <div className="mt-4 pt-2">
                <div className="h-9 w-48 bg-gradient-to-r from-slate-900 via-slate-400 to-slate-800 rounded-sm opacity-70"></div>
                <span className="block text-[9px] font-mono tracking-widest text-slate-400 mt-1 uppercase">
                  {order.orderNumber}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">${Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied:</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Sales Tax (5%):</span>
                <span className="font-medium text-slate-900">${Number(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Handling:</span>
                <span className="font-medium text-slate-900">
                  {Number(order.shippingFee || 0) === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${Number(order.shippingFee).toFixed(2)}`}
                </span>
              </div>
              <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-blue-600">${Number(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400">
            <p>Electronic Tax Invoice generated by NovaMart Systems • No physical signature required.</p>
          </div>
        </div>

        {/* Modal Bottom Action Bar (Excluded in Print) */}
        <div className="no-print bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadReceiptHtml(order)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Receipt</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
