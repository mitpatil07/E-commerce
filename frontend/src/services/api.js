// src/services/api.js - UNIFIED AND FIXED VERSION

const API_BASE_URL = 'https://13.127.0.77/api';
// const API_BASE_URL = 'https://api.whatyouwear.store/api';


// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: `HTTP error! status: ${response.status}` 
    }));
    throw new Error(error.message || error.detail || error.error || 'An error occurred');
  }
  return response.json();
};

// Helper function to get auth headers
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

// Helper function to refresh access token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  console.log('🔄 Refreshing access token...');

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
  
  console.log('✅ Token refreshed successfully');
  
  return data.access;
};

// Enhanced fetch with token refresh
const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // If 401 and we have auth, try to refresh token
    if (response.status === 401 && options.headers?.Authorization) {
      console.log('🔐 Got 401, attempting token refresh...');
      
      try {
        const newToken = await refreshAccessToken();
        
        // Retry with new token
        const newHeaders = { ...options.headers, Authorization: `Bearer ${newToken}` };
        const retryResponse = await fetch(url, { ...options, headers: newHeaders });
        
        return retryResponse;
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Clear auth data and redirect to login
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
    console.error('❌ Fetch error:', error);
    throw error;
  }
};

// API Service Object
const api = {
  // ============= AUTHENTICATION =============
  
  register: async (userData) => {
    console.log('📡 API: Registering user:', userData.email);
    
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
      console.log('✅ User registered and tokens saved');
    }
    
    return data;
  },

  login: async (credentials) => {
    console.log('📡 API: Logging in user:', credentials.email);
    
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
      console.log('✅ User logged in and tokens saved');
    }
    
    return data;
  },

  logout: async () => {
    console.log('📡 API: Logging out user');
    
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
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      console.log('✅ User logged out');
    }
  },

  getProfile: async () => {
    console.log('📡 API: Fetching user profile');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts/profile/`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });
    
    return handleResponse(response);
  },

  updateProfile: async (userData) => {
    console.log('📡 API: Updating user profile');
    
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

  // ============= PRODUCTS (PUBLIC) =============
  
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/products/${queryString ? `?${queryString}` : ''}`;
    
    console.log('📡 API: Fetching products from:', url);
    
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: getAuthHeaders(false),
    });
    
    return handleResponse(response);
  },

  getProduct: async (id) => {
    console.log('📡 API: Fetching product:', id);
    
    const response = await fetchWithAuth(`${API_BASE_URL}/products/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(false),
    });
    
    return handleResponse(response);
  },

  getProductById: async (id) => {
    return api.getProduct(id);
  },

  getFeaturedProducts: async () => {
    console.log('📡 API: Fetching featured products');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/products/featured/`, {
      method: 'GET',
      headers: getAuthHeaders(false),
    });
    
    return handleResponse(response);
  },

  searchProducts: async (query) => {
    console.log('📡 API: Searching products:', query);
    
    const response = await fetchWithAuth(
      `${API_BASE_URL}/products/?search=${encodeURIComponent(query)}`, 
      {
        method: 'GET',
        headers: getAuthHeaders(false),
      }
    );
    
    return handleResponse(response);
  },

  // ============= CATEGORIES (PUBLIC) =============
  
  getCategories: async () => {
    console.log('📡 API: Fetching categories');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/`, {
      method: 'GET',
      headers: getAuthHeaders(false),
    });
    
    return handleResponse(response);
  },

  // ============= CART (SESSION BASED - WORKS FOR BOTH GUEST & AUTH) =============
  
  getCart: async () => {
    console.log('📡 API: Fetching cart');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/current/`, {
      method: 'GET',
      credentials: 'include', // CRITICAL for session cookies
      headers: getAuthHeaders(api.isAuthenticated()),
    });
    
    const data = await handleResponse(response);
    console.log('✅ Cart fetched:', data);
    return data;
  },

  addToCart: async (productId, quantity = 1, selectedColor = null, selectedSize = null) => {
    console.log('📡 API: Adding to cart:', { 
      productId, 
      quantity, 
      selectedColor, 
      selectedSize 
    });
    
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/add_item/`, {
      method: 'POST',
      credentials: 'include', // CRITICAL for session cookies
      headers: getAuthHeaders(api.isAuthenticated()),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
        selected_color: selectedColor,
        selected_size: selectedSize,
      }),
    });
    
    const data = await handleResponse(response);
    console.log('✅ Added to cart:', data);
    return data;
  },

  updateCartItem: async (itemId, quantity) => {
    console.log('📡 API: Updating cart item:', { itemId, quantity });
    
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/update_item/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(api.isAuthenticated()),
      body: JSON.stringify({
        item_id: itemId,
        quantity: quantity,
      }),
    });
    
    const data = await handleResponse(response);
    console.log('✅ Cart item updated:', data);
    return data;
  },

  removeFromCart: async (itemId) => {
    console.log('📡 API: Removing from cart:', itemId);
    
    const response = await fetchWithAuth(
      `${API_BASE_URL}/cart/remove_item/?item_id=${itemId}`, 
      {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(api.isAuthenticated()),
      }
    );
    
    const data = await handleResponse(response);
    console.log('✅ Removed from cart:', data);
    return data;
  },

  clearCart: async () => {
    console.log('📡 API: Clearing cart');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/cart/clear/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(api.isAuthenticated()),
    });
    
    const data = await handleResponse(response);
    console.log('✅ Cart cleared:', data);
    return data;
  },


  // ============= ORDERS (AUTH REQUIRED) =============
  
  getOrders: async () => {
    console.log('📡 API: Fetching orders');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/`, {
      method: 'GET',
      headers: getAuthHeaders(true),
    });
    
    return handleResponse(response);
  },

  createOrder: async (orderData) => {
    console.log('📡 API: Creating order:', orderData);
    
    const response = await fetchWithAuth(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(orderData),
    });
    
    const data = await handleResponse(response);
    console.log('✅ Order created:', data);
    return data;
  },

  // ============= REVIEWS =============
  
  getReviews: async (productId) => {
    console.log('📡 API: Fetching reviews for product:', productId);
    
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
    console.log('📡 API: Creating review:', { productId, rating });
    
    const response = await fetchWithAuth(`${API_BASE_URL}/reviews/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        product_id: productId,
        rating: rating,
        comment: comment,
      }),
    });
    
    const data = await handleResponse(response);
    console.log('✅ Review created:', data);
    return data;
  },
    
  createRazorpayOrder: async () => {
    console.log('📡 API: Creating Razorpay order');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/payment/create-order/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
    });
    
    const data = await handleResponse(response);
    console.log('✅ Razorpay order created:', data);
    return data;
  },

  verifyPayment: async (paymentData) => {
    console.log('📡 API: Verifying payment');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/payment/verify/`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(paymentData),
    });
    
    const data = await handleResponse(response);
    console.log('✅ Payment verified:', data);
    return data;
  },
};

export default api;
