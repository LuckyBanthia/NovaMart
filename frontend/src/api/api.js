import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('novamart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('novamart_token')) {
        localStorage.removeItem('novamart_token');
        localStorage.removeItem('novamart_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getProductById: (id) => api.get(`/products/${id}`),
};

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
};

export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderByNumber: (orderNumber) => api.get(`/orders/${orderNumber}`),
  getReceipt: (orderNumber) => api.get(`/orders/${orderNumber}/receipt`),
  cancelOrder: (orderId, reason) => api.post(`/orders/${orderId}/cancel`, { reason }),
  requestReturn: (orderId, reason) => api.post(`/orders/${orderId}/return`, { reason }),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (orderId, status) => api.patch(`/admin/orders/${orderId}/status`, { status }),
  processRefund: (orderId, refundAmount) => api.post(`/admin/orders/${orderId}/refund`, { refundAmount }),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  updateStock: (id, quantity) => api.patch(`/admin/products/${id}/stock`, { quantity }),
  adjustStock: (id, delta) => api.patch(`/admin/products/${id}/stock`, { delta }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getLowStockProducts: (threshold) => api.get('/admin/products/low-stock', { params: { threshold } }),
};

// Machine Learning API (calls Python Scikit-Learn Microservice via Gateway on /api/ai/**)
export const aiAPI = {
  getRecommendations: (productId, limit = 4) => api.get(`/ai/recommendations/${productId}`, { params: { limit } }),
  searchRecommendations: (q, limit = 5) => api.get('/ai/search', { params: { q, limit } }),
  analyzeSentiment: (text) => api.post('/ai/analyze-sentiment', { text }),
  predictCategory: (title, description) => api.post('/ai/predict-category', { title, description }),
};

export default api;
