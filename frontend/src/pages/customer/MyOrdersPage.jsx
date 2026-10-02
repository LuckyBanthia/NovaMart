import React, { useState, useEffect } from 'react';
import { Package, Clock, Printer, Download, ChevronRight, AlertCircle, ShoppingBag, RotateCcw, XCircle, CheckCircle2, X } from 'lucide-react';
import { orderAPI } from '../../api/api';
import { downloadReceiptHtml } from '../../utils/receiptDownloader';

export const MyOrdersPage = ({ onSelectOrderReceipt, onStartShopping }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Return & Refund Modal State
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Defective or damaged product');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Feedback Notification
  const [actionNotice, setActionNotice] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getMyOrders();
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      setError('Please sign in to view your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancellingOrder) return;
    setCancelSubmitting(true);
    try {
      const res = await orderAPI.cancelOrder(cancellingOrder.id, cancelReason);
      if (res.data?.success) {
        setOrders(orders.map(o => o.id === cancellingOrder.id ? res.data.data : o));
        setCancellingOrder(null);
        setActionNotice(`Order #${cancellingOrder.orderNumber} has been cancelled. Full refund has been initiated.`);
        setTimeout(() => setActionNotice(''), 5000);
      }
    } catch (err) {
      alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleRequestReturn = async (e) => {
    e.preventDefault();
    if (!returningOrder) return;
    setReturnSubmitting(true);
    try {
      const combinedReason = `${returnReason}${returnDetails ? ': ' + returnDetails : ''}`;
      const res = await orderAPI.requestReturn(returningOrder.id, combinedReason);
      if (res.data?.success) {
        setOrders(orders.map(o => o.id === returningOrder.id ? res.data.data : o));
        setReturningOrder(null);
        setReturnDetails('');
        setActionNotice(`Return request for Order #${returningOrder.orderNumber} submitted! Refund is pending approval.`);
        setTimeout(() => setActionNotice(''), 5000);
      }
    } catch (err) {
      alert('Failed to submit return request: ' + (err.response?.data?.message || err.message));
    } finally {
      setReturnSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROCESSING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONFIRMED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RETURN_REQUESTED':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'RETURNED':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading your purchase history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Orders & Invoices</h1>
        <p className="text-xs text-slate-500 mt-1">Track current shipments and download official payment receipts</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No previous orders found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            When you purchase items on NovaMart, your orders and instant digital tax receipts will appear here.
          </p>
          <button
            onClick={onStartShopping}
            className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-md transition-all"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">Order ID: </span>
                  <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                  <span className="text-slate-300 mx-2">•</span>
                  <span className="text-slate-500">
                    {new Date(order.orderDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                    {order.status === 'RETURN_REQUESTED' ? 'Return Requested (Refund Pending)' :
                     order.status === 'RETURNED' ? 'Returned (Refunded)' :
                     order.status === 'CANCELLED' ? 'Cancelled (Refunded)' : order.status}
                  </span>

                  {/* Cancel Button (Available BEFORE shipping: PLACED, CONFIRMED, PROCESSING) */}
                  {(order.status === 'PLACED' || order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                    <button
                      onClick={() => setCancellingOrder(order)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors shadow-xs"
                      title="Cancel order before shipping"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}

                  {/* Return & Refund Button (Available AFTER delivery: DELIVERED) */}
                  {order.status === 'DELIVERED' && (
                    <button
                      onClick={() => setReturningOrder(order)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 transition-colors shadow-xs"
                      title="Request return and refund"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return & Refund</span>
                    </button>
                  )}

                  <button
                    onClick={() => downloadReceiptHtml(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors shadow-sm"
                    title="Download receipt as file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => onSelectOrderReceipt(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Receipt</span>
                  </button>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="divide-y divide-slate-50">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} 
                        alt={item.productName} 
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">{item.productName}</p>
                        <p className="text-slate-400 text-[11px]">Qty: {item.quantity} × ${Number(item.unitPrice).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Refund / Cancellation Status Details */}
              {order.paymentStatus === 'REFUNDED' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row justify-between text-emerald-900 gap-1">
                  <span>✓ <strong>Refund Completed:</strong> Full amount of ${Number(order.refundAmount || order.totalAmount).toFixed(2)} credited back.</span>
                  {order.cancellationReason && <span className="text-[11px] text-emerald-700 italic">Reason: {order.cancellationReason}</span>}
                  {order.returnReason && <span className="text-[11px] text-emerald-700 italic">Return: {order.returnReason}</span>}
                </div>
              )}

              {order.paymentStatus === 'REFUND_PENDING' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex justify-between text-amber-900">
                  <span>⏳ <strong>Return Requested:</strong> Refund of ${Number(order.totalAmount).toFixed(2)} is pending review.</span>
                  {order.returnReason && <span className="text-[11px] text-amber-700 italic">Reason: {order.returnReason}</span>}
                </div>
              )}

              {/* Order Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Payment: <strong className="text-slate-700">{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                <span className="text-sm font-black text-slate-900">
                  Total: <span className="text-blue-600">${Number(order.totalAmount).toFixed(2)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Cancellation Modal (Before Shipping)                                      */}
      {/* ========================================================================= */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">Cancel Order #{cancellingOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setCancellingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This order has not shipped yet. Cancelling will immediately refund <strong className="text-slate-900">${Number(cancellingOrder.totalAmount).toFixed(2)}</strong> to your {cancellingOrder.paymentMethod} and release reserved items back to inventory.
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 outline-none font-medium text-slate-800"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Found a lower price elsewhere">Found a lower price elsewhere</option>
                  <option value="Ordered by mistake / wrong address">Ordered by mistake / wrong address</option>
                  <option value="Estimated delivery time too long">Estimated delivery time too long</option>
                  <option value="Need to change items/coupon">Need to change items/coupon</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation & Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Return & Refund Request Modal (After Delivery)                             */}
      {/* ========================================================================= */}
      {returningOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">Request Return & Refund</h3>
              </div>
              <button onClick={() => setReturningOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              For Order <strong className="text-slate-900">#{returningOrder.orderNumber}</strong>. Eligible for 30-day official return and full refund of <strong className="text-slate-900">${Number(returningOrder.totalAmount).toFixed(2)}</strong>.
            </p>

            <form onSubmit={handleRequestReturn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 outline-none font-medium text-slate-800"
                >
                  <option value="Defective or damaged product">Defective or damaged product</option>
                  <option value="Item does not match website description">Item does not match website description</option>
                  <option value="Wrong item or size received">Wrong item or size received</option>
                  <option value="Performance or quality not as expected">Performance or quality not as expected</option>
                  <option value="Missing parts or accessories">Missing parts or accessories</option>
                  <option value="No longer needed / Changed mind">No longer needed / Changed mind</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Additional Details (Optional)</label>
                <textarea
                  rows={3}
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="Describe the condition or specific issues observed..."
                  className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 outline-none resize-none text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturningOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {returnSubmitting ? 'Submitting...' : 'Submit Return & Refund Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
