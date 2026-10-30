import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Otp from './pages/Otp';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="app-shell">
              <main className="app-main-content">
                <Routes>
                  {/* Public authentication routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/otp" element={<Otp />} />

                  {/* Protected application routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/restaurant/:id"
                    element={
                      <ProtectedRoute>
                        <RestaurantDetail />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
