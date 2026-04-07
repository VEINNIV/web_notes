import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import styles from './Notification.module.css';

const NotificationContext = createContext(null);

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={addToast}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map(toast => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
             <div className={styles.iconWrapper}>
               {toast.type === 'success' && <CheckCircle2 size={16} />}
               {toast.type === 'error' && <AlertCircle size={16} />}
               {toast.type === 'info' && <Info size={16} />}
             </div>
             <p className={styles.message}>{toast.message}</p>
             <button onClick={() => removeToast(toast.id)} className={styles.closeBtn}>
                <X size={14} />
             </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
