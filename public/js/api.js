// API Utility Functions

const API_BASE = '';

async function apiRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(API_BASE + url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth helpers
async function checkAuth() {
  try {
    const user = await apiRequest('/api/user');
    return user;
  } catch (error) {
    return null;
  }
}

async function logout() {
  try {
    await apiRequest('/api/logout', 'POST');
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// Export for use in other scripts
window.API = {
  request: apiRequest,
  checkAuth,
  logout
};
