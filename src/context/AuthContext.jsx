import React, { createContext, useContext, useState, useEffect } from 'react';

const TOKEN_KEY = 'fastor_token';
const USER_KEY = 'fastor_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (newToken, userData = null) => {
    setToken(newToken);
    setUser(userData);
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
      if (userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist auth data to localStorage', e);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Failed to clear auth data from localStorage', e);
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
