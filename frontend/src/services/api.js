// src/services/api.js - Enhanced with better auth handling

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://api.whatyouwear.store/api'
    : '/api');

// console.log("🌍 Using API_BASE_URL:", API_BASE_URL);
// console.log("🔧 Environment:", import.meta.env.MODE);

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
  // Get response text first
  const text = await response.text();
  
  if (!response.ok) {
    let error;
    try {
      error = JSON.parse(text);
    } catch {
      error = { message: `HTTP error! status: ${response.status}`, detail: text };
    }
    
    // Special handling for authentication errors
    if (response.status === 401) {
      const errorMsg = error.detail || error.message || 'Authentication failed';
      throw new Error(`Failed to create payment order: ${errorMsg}`);
    }
    
    throw new Error(error.message || error.detail || error.error || 'An error occurred');
  }
  
  // Parse successful response
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getAuthHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // console.log('🔑 Adding auth header - Token exists:', !!token);
    } else {
      console.warn('⚠️ No access token found in localStorage');
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
    // Log request details in development
    // if (import.meta.env.DEV) {
    //   console.log('🌐 Request:', {
    //     url,
    //     method: options.method,
    //     hasAuth: !!options.headers?.Authorization,
    //   });
    // }
    
    const response = await fetch(url, options);
    
    // Handle 401 with token refresh
    if (response.status === 401 && options.headers?.Authorization) {
      // console.log('🔄 Token expired, attempting refresh...');
      try {
        const newToken = await refreshAccessToken();
        const newHeaders = { ...options.headers, Authorization: `Bearer ${newToken}` };
        const retryResponse = await fetch(url, { ...options, headers: newHeaders });
        // console.log('✅ Token refreshed, retry successful');
        return retryResponse;
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
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
    console.error('🚨 Fetch error:', error);
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
    // console.log('🔐 Attempting login...');
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts/login/`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: JSON.stringify(credentials),
    });
    // console.log('📥 Response status:', response.status);
    const data = await handleResponse(response);
    if (data.tokens) {
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      // console.log('✅ Tokens stored successfully');
    }
    return data;
  },

  googleLogin: async (token) => {
    // console.log('🔐 Attempting Google login...');
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts/google-login/`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: JSON.stringify({ token }),
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
      console.warn('Logout API call failed, clearing local storage anyway');
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
    const hasToken = !!localStorage.getItem('access_token');
    // console.log('🔍 isAuthenticated check:', hasToken);
    return hasToken;
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
        headers: getAuthHeaders(true),
      });
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
    // console.log('💳 Creating Razorpay order...');
    
    // CRITICAL: Verify token exists before making request
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // console.log('🔑 Token check:', {
    //   exists: !!token,
    //   preview: token.substring(0, 30) + '...',
    //   length: token.length
    // });
    
    const response = await fetchWithAuth(`${API_BASE_URL}/payment/create-order/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(orderData),
    });
    
    const data = await handleResponse(response);
    // console.log('✅ Razorpay order created successfully');
    return data;
  },

  verifyPayment: async (paymentData) => {
    // console.log('✅ Verifying payment...');
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