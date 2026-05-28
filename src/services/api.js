// Central API Service client wrapping all Express.js endpoints
const API_URL = '/api';

// Helper to retrieve active auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('netflix_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- CATALOG SERVICES ---

  async getCatalog() {
    const response = await fetch(`${API_URL}/catalog`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch catalog');
    }
    return data;
  },

  // --- AUTH SERVICES ---
  
  // Register new account
  async register(fullName, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Save credentials in client storage
    localStorage.setItem('netflix_token', data.token);
    return data;
  },
  
  // Login existing account
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Save credentials in client storage
    localStorage.setItem('netflix_token', data.token);
    return data;
  },
  
  // Verify token validation
  async getMe() {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Session verification failed');
    }
    return data;
  },
  
  // --- PROFILE SERVICES ---
  
  // Fetch profiles belonging to user
  async getProfiles() {
    const response = await fetch(`${API_URL}/profiles`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profiles');
    }
    return data;
  },
  
  // Create profile
  async createProfile(name, avatar, color) {
    const response = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, avatar, color })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create profile');
    }
    return data;
  },
  
  // Delete profile
  async deleteProfile(profileId) {
    const response = await fetch(`${API_URL}/profiles/${profileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete profile');
    }
    return data;
  },
  
  // --- WATCHLIST SERVICES ---
  
  // Fetch profile watchlist items
  async getWatchlist(profileId) {
    const response = await fetch(`${API_URL}/watchlist/${profileId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch watchlist');
    }
    return data;
  },
  
  // Toggle movie in profile watchlist
  async toggleWatchlist(profileId, movieId) {
    const response = await fetch(`${API_URL}/watchlist/${profileId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ movieId })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle watchlist item');
    }
    return data;
  }
};
