import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, duration = 2500) => {
    setToast(message);
    const timer = setTimeout(() => {
      setToast(null);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {toast && (
        <div className="toast-notification" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => {
        // Fallback if rendered outside provider
        alert(msg);
      },
      toast: null,
    };
  }
  return context;
}
