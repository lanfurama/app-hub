import React, { useState, useEffect } from 'react';
import { ToastContainer, Toast, toastManager } from './Toast';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

