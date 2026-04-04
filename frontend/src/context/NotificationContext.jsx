import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

const toastStyle = { background: '#1C1C1C', color: '#F4F4F4', border: '1px solid #2E2E2E' };

export const NotificationProvider = ({ children }) => {
  const showSuccess = (msg) => toast.success(msg, { style: { ...toastStyle, border: '1px solid #42BE65' } });
  const showError = (msg) => toast.error(msg, { style: { ...toastStyle, border: '1px solid #FA4D56' } });
  const showInfo = (msg) => toast(msg, { style: toastStyle, icon: 'ℹ️' });

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export default NotificationContext;
