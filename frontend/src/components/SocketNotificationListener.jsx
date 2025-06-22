import { useContext, useEffect } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import { socket } from '../services/socket';

export default function SocketNotificationListener() {
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    socket.on('notification', (data) => {
      addNotification(data);
    });
    return () => socket.off('notification');
  }, [addNotification]);

  return null;
} 