import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  AlertTriangle, 
  Plus, 
  Minus,
  Edit3, 
  Trash2, 
  CheckCircle, 
  Search, 
  Printer, 
  ArrowLeft,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { adminAPI, categoryAPI, productAPI } from '../../api/api';

export const AdminDashboard = ({ onExitAdmin, onSelectOrderReceipt }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Modal State for Add/Edit Product
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formProduct, setFormProduct] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    discountPercent: 0,
    stockQuantity: 10,
    sku: '',
    categoryId: '',
    imageUrl: '',
    brand: '',
    featured: false,
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, catRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllOrders(),
        productAPI.getProducts(),
        categoryAPI.getCategories(),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (ordersRes.data?.success) setOrders(ordersRes.data.data);
      if (productsRes.data?.success) setProducts(productsRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await adminAPI.updateOrderStatus(orderId, newStatus);
      if (res.data?.success) {
        setOrders(orders.map(o => o.id === orderId ? res.data.data : o));
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleProcessRefund = async (orderId) => {
    if (!window.confirm('Are you sure you want to process a refund for this order? This will mark the payment as REFUNDED, update the order status, and replenish inventory.')) return;
    try {
      const res = await adminAPI.processRefund(orderId);
      if (res.data?.success) {
        setOrders(orders.map(o => o.id === orderId ? res.data.data : o));
        alert('Refund of $' + Number(res.data.data.refundAmount || res.data.data.totalAmount).toFixed(2) + ' processed successfully!');
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to process refund: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormProduct({
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      discountPercent: 0,
      stockQuantity: 15,
      sku: 'NM-' + Math.floor(1000 + Math.random() * 9000),
      categoryId: categories[0]?.id || 1,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      brand: 'NovaMart',
      featured: false,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setFormProduct({
      title: prod.title,
      description: prod.description || '',
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      discountPercent: prod.discountPercent || 0,
      stockQuantity: prod.stockQuantity,
      sku: prod.sku || '',
      categoryId: prod.categoryId || categories[0]?.id || 1,
      imageUrl: prod.imageUrl || '',
      brand: prod.brand || '',
      featured: !!prod.featured,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formProduct,
        price: Number(formProduct.price),
        originalPrice: formProduct.originalPrice ? Number(formProduct.originalPrice) : Number(formProduct.price),
        discountPercent: Number(formProduct.discountPercent),
        stockQuantity: Number(formProduct.stockQuantity),
        categoryId: Number(formProduct.categoryId),
      };

      if (editingProduct) {
        const res = await adminAPI.updateProduct(editingProduct.id, payload);
        if (res.data?.success) {
          setProducts(products.map(p => p.id === editingProduct.id ? res.data.data : p));
        }
      } else {
        const res = await adminAPI.createProduct(payload);
        if (res.data?.success) {
          setProducts([res.data.data, ...products]);
        }
      }
      setProductModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert('Error saving product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await adminAPI.deleteProduct(id);
      if (res.data?.success) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Error deleting product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleQuickAdjustStock = async (productId, delta) => {
    try {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;
      const targetQuantity = Math.max(0, (prod.stockQuantity || 0) + delta);
      // Optimistic update
      setProducts(products.map(p => p.id === productId ? { ...p, stockQuantity: targetQuantity } : p));
      
      const res = await adminAPI.updateStock(productId, targetQuantity);
      if (res.data?.success) {
        setProducts(products.map(p => p.id === productId ? res.data.data : p));
      }
    } catch (err) {
      alert('Failed to update stock: ' + (err.response?.data?.message || err.message));
      fetchDashboardData();
    }
  };

  const handleDirectSetStock = async (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 0) return;
    try {
      setProducts(products.map(p => p.id === productId ? { ...p, stockQuantity: qty } : p));
      const res = await adminAPI.updateStock(productId, qty);
      if (res.data?.success) {
        setProducts(products.map(p => p.id === productId ? res.data.data : p));
      }
    } catch (err) {
      alert('Failed to update stock: ' + (err.response?.data?.message || err.message));
      fetchDashboardData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              System Administrator
            </span>
            <span className="text-xs text-slate-400">• High-Privilege Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            NovaMart Operations Control
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Storefront</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ${stats ? Number(stats.totalRevenue).toFixed(2) : '0.00'}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              +14% vs last week
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.totalOrders || orders.length}
            </h3>
            <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
              {stats?.pendingOrdersCount || 0} requiring fulfillment
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Catalog</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {stats?.totalProducts || products.length}
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
              Across 5 Categories
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Warning</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {stats?.lowStockCount || 0} items
            </h3>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 inline-block">
              Stock ≤ 5 units
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders & Invoices ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Inventory & Catalog Control ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Customer Orders & Status Pipeline
            </h2>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search orders, name, status..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Status Workflow</th>
                  <th className="py-3 px-3">Payment & Settlement</th>
                  <th className="py-3 px-3 text-right">Actions / Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders
                  .filter(o => 
                    !searchFilter || 
                    o.orderNumber?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    o.recipientName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    o.status?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    o.paymentStatus?.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900">{order.recipientName}</p>
                        <p className="text-[11px] text-slate-400">{order.phone}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-slate-900">
                        ${Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        {/* Live Status Selector */}
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border shadow-xs outline-none cursor-pointer ${
                            order.status === 'RETURN_REQUESTED' ? 'border-amber-300 bg-amber-50 text-amber-900 font-black' :
                            order.status === 'RETURNED' ? 'border-teal-300 bg-teal-50 text-teal-900' :
                            order.status === 'CANCELLED' ? 'border-rose-200 bg-rose-50 text-rose-800' :
                            'border-slate-200 bg-white'
                          }`}
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                          <option value="RETURNED">RETURNED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                            order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.paymentStatus === 'REFUND_PENDING' ? 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse' :
                            order.paymentStatus === 'REFUNDED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {order.paymentStatus === 'REFUND_PENDING' ? 'REFUND PENDING' : order.paymentStatus}
                          </span>
                          {order.paymentStatus === 'REFUNDED' && (
                            <p className="text-[10px] font-mono text-purple-700 font-bold">
                              -${Number(order.refundAmount || order.totalAmount).toFixed(2)}
                            </p>
                          )}
                          {order.returnReason && (
                            <p className="text-[10px] text-slate-500 italic max-w-xs truncate" title={order.returnReason}>
                              Note: {order.returnReason}
                            </p>
                          )}
                          {order.cancellationReason && (
                            <p className="text-[10px] text-rose-500 italic max-w-xs truncate" title={order.cancellationReason}>
                              Cancel: {order.cancellationReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Admin Refund Action Buttons */}
                          {(order.status === 'RETURN_REQUESTED' || order.paymentStatus === 'REFUND_PENDING') && (
                            <button
                              onClick={() => handleProcessRefund(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold shadow-xs transition-colors"
                              title="Approve return & process full refund"
                            >
                              Approve & Refund
                            </button>
                          )}
                          {(order.status === 'CANCELLED' && order.paymentStatus !== 'REFUNDED') && (
                            <button
                              onClick={() => handleProcessRefund(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow-xs transition-colors"
                              title="Process refund for cancelled order"
                            >
                              Issue Refund
                            </button>
                          )}
                          <button
                            onClick={() => onSelectOrderReceipt(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-600" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Products Inventory */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Product Catalog & Stock Management
            </h2>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Stock Units</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-xl bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{product.title}</p>
                        <p className="text-[11px] text-slate-400">{product.brand || 'NovaMart'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {product.sku || 'NM-GEN'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {product.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-slate-900">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustStock(product.id, -1)}
                          disabled={product.stockQuantity <= 0}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 font-bold transition-colors"
                          title="Decrease Stock (-1)"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stockQuantity}
                          key={`${product.id}-${product.stockQuantity}`}
                          onBlur={(e) => handleDirectSetStock(product.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className={`w-14 text-center font-bold text-xs py-0.5 px-1 border rounded-md outline-none transition-all ${
                            product.stockQuantity <= 5
                              ? 'border-amber-300 bg-amber-50 text-amber-900 focus:ring-1 focus:ring-amber-400'
                              : 'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-400'
                          }`}
                          title="Type quantity and press Enter to save"
                        />

                        <button
                          type="button"
                          onClick={() => handleQuickAdjustStock(product.id, 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-colors"
                          title="Increase Stock (+1)"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickAdjustStock(product.id, 10)}
                          className="px-1.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black border border-blue-200 transition-colors"
                          title="Quick Restock +10 units"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      ★ {product.rating || '4.8'}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditProduct(product)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit Product */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formProduct.title}
                  onChange={(e) => setFormProduct({ ...formProduct, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formProduct.description}
                  onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formProduct.price}
                    onChange={(e) => setFormProduct({ ...formProduct, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProduct.originalPrice}
                    onChange={(e) => setFormProduct({ ...formProduct, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formProduct.stockQuantity}
                    onChange={(e) => setFormProduct({ ...formProduct, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formProduct.categoryId}
                    onChange={(e) => setFormProduct({ ...formProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formProduct.imageUrl}
                  onChange={(e) => setFormProduct({ ...formProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formProduct.brand}
                    onChange={(e) => setFormProduct({ ...formProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formProduct.sku}
                    onChange={(e) => setFormProduct({ ...formProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formProduct.featured}
                    onChange={(e) => setFormProduct({ ...formProduct, featured: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700">Feature this product on homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
