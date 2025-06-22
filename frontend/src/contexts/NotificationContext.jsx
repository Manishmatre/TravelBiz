import React, { createContext, useState, useCallback } from 'react';
import Notification from '../components/common/Notification';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [notificationLog, setNotificationLog] = useState([]);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [...prev, notif]);
    setNotificationLog((prev) => [...prev, { ...notif, timestamp: notif.timestamp || Date.now() }]);
  }, []);

  const removeNotification = useCallback((index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, notificationLog }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notif, i) => (
          <Notification
            key={i}
            {...notif}
            onClose={() => removeNotification(i)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
} 