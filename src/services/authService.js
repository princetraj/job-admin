import api from './api';

export const authService = {
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_type', response.data.user_type);
      localStorage.setItem('admin_role', response.data.user.role);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('admin_role');
      localStorage.removeItem('admin_user');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getRole: () => {
    return localStorage.getItem('admin_role');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  }
};
