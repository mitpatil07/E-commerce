// src/services/api.js - PRODUCTION CLEAN (NO LOGS)

// const API_BASE_URL = import.meta.env.PROD 
//   ? 'https://api.whatyouwear.store/api'
//   : '/api';

// api.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://api.whatyouwear.store/api'
    : 'http://127.0.0.1:8000/api');

    console.log("🌍 Using API_BASE_URL:", API_BASE_URL);
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: `HTTP error! status: ${response.status}` 
    }));
    throw new Error(error.message || error.detail || error.error || 'An error occurred');
  }
  return response.json();
};

const getAuthHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  
  return data.access;
};

const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401 && options.headers?.Authorization) {
      try {
        const newToken = await refreshAccessToken();
        const newHeaders = { ...options.headers, Authorization: `Bearer ${newToken}` };
        const retryResponse = await fetch(url, { ...options, headers: newHeaders });
        return retryResponse;
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        throw refreshError;
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

const api = {
  register: async (userData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts/register/`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    if (data.tokens) {
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  login: async (credentials) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts/login/`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    if (data.tokens) {
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await fetchWithAuth(`${API_BASE_URL}/accounts/logout/`, {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      // Silent error
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });
    return handleResponse(response);
  },

  updateProfile: async (userData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts/profile/`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/products/${queryString ? `?${queryString}` : ''}`;
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: getAuthHeaders(false),
    });
    return handleResponse(response);
  },

  getProduct: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/products/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(false),
    });
    return handleResponse(response);
  },

  getProductById: async (id) => {
    return api.getProduct(id);
  },

  searchProducts: async (query) => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/products/?search=${encodeURIComponent(query)}`, 
      {
        method: 'GET',
        headers: getAuthHeaders(false),
      }
    );
    return handleResponse(response);
  },

  getCategories: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/`, {
      method: 'GET',
      headers: getAuthHeaders(false),
    });
    return handleResponse(response);
  },

  getCart: async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/cart/current/`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(true), // ✅ always send token
      });
  
      // ✅ ensures proper JSON response even after token refresh
      return await handleResponse(response);
    } catch (error) {
      console.warn('⚠️ Failed to load cart:', error.message);
      return { items: [], total_items: 0, total_price: 0 };
    }
  },
  

  addToCart: async (productId, quantity = 1, selectedColor = null, selectedSize = null) => {
    const csrfToken = getCookie('csrftoken');
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/add_item/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...getAuthHeaders(api.isAuthenticated()),
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
        selected_color: selectedColor,
        selected_size: selectedSize,
      }),
    });
    return handleResponse(response);
  },

  updateCartItem: async (itemId, quantity) => {
    const csrfToken = getCookie('csrftoken');
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/update_item/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        ...getAuthHeaders(api.isAuthenticated()),
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify({ item_id: itemId, quantity: quantity }),
    });
    return handleResponse(response);
  },

  removeFromCart: async (itemId) => {
    const csrfToken = getCookie('csrftoken');
    const response = await fetchWithAuth(
      `${API_BASE_URL}/cart/remove_item/?item_id=${itemId}`, 
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(api.isAuthenticated()),
          'X-CSRFToken': csrfToken,
        },
      }
    );
    return handleResponse(response);
  },

  clearCart: async () => {
    const csrfToken = getCookie('csrftoken');
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/clear/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        ...getAuthHeaders(api.isAuthenticated()),
        'X-CSRFToken': csrfToken,
      },
    });
    return handleResponse(response);
  },

  getOrders: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });
    return handleResponse(response);
  },

  createOrder: async (orderData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  createRazorpayOrder: async (orderData = {}) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/payment/create-order/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  verifyPayment: async (paymentData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/payment/verify/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },

  getReviews: async (productId) => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/reviews/?product_id=${productId}`, 
      {
        method: 'GET',
        headers: getAuthHeaders(false),
      }
    );
    return handleResponse(response);
  },

  createReview: async (productId, rating, comment) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/reviews/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ product_id: productId, rating, comment }),
    });
    return handleResponse(response);
  },
};

export default api;