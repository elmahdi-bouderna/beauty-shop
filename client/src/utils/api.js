import axios from 'axios';

const API_URL = 'https://swibi.glitch.me/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  getAdmin: () => api.get('/auth'),
};

export const productsAPI = {
  getAll: (sort = 'newest') => api.get(`/products?sort=${sort}`),
  getByCategory: (category, sort = 'newest') => api.get(`/products/category/${category}?sort=${sort}`),
  getDiscounted: (sort = 'discount') => api.get(`/products/discounted?sort=${sort}`),
  search: (query, sort = 'newest') => api.get(`/products/search?q=${encodeURIComponent(query)}&sort=${sort}`),
  
  getById: (id) => {
    try {
      return api.get(`/products/${id}`);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  getProductColors: (productId) => api.get(`/products/${productId}/colors`),
  
  create: (productData) => {
    console.log('Creating product with FormData');
    return api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  update: (id, productData) => {
    console.log(`Updating product ${id} with FormData`);
    return api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  delete: (id) => {
    try {
      return api.delete(`/products/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};

export const bannersAPI = {
  getActive: () => api.get('/banners'),
  getAll: () => api.get('/banners/all'),
  getById: (id) => api.get(`/banners/${id}`),
  create: (bannerData) => {
    const formData = new FormData();
    
    // Append all banner data to formData
    Object.keys(bannerData).forEach(key => {
      if (key === 'image' && bannerData[key] instanceof File) {
        formData.append('image', bannerData[key]);
      } else if (bannerData[key] !== undefined && bannerData[key] !== null) {
        formData.append(key, bannerData[key]);
      }
    });
    
    return api.post('/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  update: (id, bannerData) => {
    const formData = new FormData();
    
    // Append all banner data to formData
    Object.keys(bannerData).forEach(key => {
      if (key === 'image' && bannerData[key] instanceof File) {
        formData.append('image', bannerData[key]);
      } else if (bannerData[key] !== undefined && bannerData[key] !== null) {
        formData.append(key, bannerData[key]);
      }
    });
    
    return api.put(`/banners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  delete: (id) => api.delete(`/banners/${id}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getOrderItems: (orderId) => api.get(`/orders/${orderId}/items`),
  getByStatus: (status) => api.get(`/orders?status=${status}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  create: (orderData) => api.post('/orders', orderData),
  // Simplified WhatsApp order function that uses the regular order endpoint
  createWhatsAppOrder: (orderData) => {
    // Mark the order as coming from WhatsApp
    const whatsappOrderData = {
      ...orderData,
      order_source: 'whatsapp'
    };
    return api.post('/orders', whatsappOrderData);
  },
  exportOrders: (params) => api.get('/orders/export', { 
    params,
    responseType: 'blob', // Important for downloading files
    timeout: 30000, // Longer timeout for export operations (30 seconds)
    headers: {
      'Accept': 'application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf, application/vnd.ms-word'
    },
    validateStatus: (status) => {
      return status >= 200 && status < 300; // Only accept success statuses
    }
  }),
  getActiveCount: () => api.get('/orders/active/count')
};

export default api;
