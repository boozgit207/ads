'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

export function showToast(message: string, type: ToastType = 'info') {
  const id = Date.now().toString();
  const toast: Toast = { id, type, message };
  
  toasts.push(toast);
  notifyListeners();
  
  setTimeout(() => {
    removeToast(id);
  }, 5000);
}

function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
}

function notifyListeners() {
  listeners.forEach(listener => listener([...toasts]));
}

export default function ToastContainer() {
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setLocalToasts(newToasts);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  if (localToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {localToasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-blue-600 text-white'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {toast.type === 'info' && <Info className="w-5 h-5" />}
          
          <span className="flex-1">{toast.message}</span>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/20 rounded"
            aria-label="Fermer la notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
