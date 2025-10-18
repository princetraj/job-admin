import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      if (authService.isAuthenticated()) {
        setUser(authService.getCurrentUser());
        setRole(authService.getRole());
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const data = await authService.login(identifier, password);
    setUser(data.user);
    setRole(data.user.role);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRole(null);
  };

  const hasRole = (roles) => {
    if (!role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(role);
    }
    return role === roles;
  };

  const isSuperAdmin = () => {
    return role === 'super_admin';
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout,
    hasRole,
    isSuperAdmin,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
