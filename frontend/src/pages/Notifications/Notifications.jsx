import React, { useContext, useState } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTrash, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Notification from '../../components/common/Notification';

const typeIcon = {
  success: <FaCheckCircle className="text-green-500" />,
  error: <FaTimesCircle className="text-red-500" />,
  info: <FaInfoCircle className="text-blue-500" />,
};

const Notifications = () => {
  const { notificationLog } = useContext(NotificationContext);
  const [read, setRead] = useState([]);

  const handleMarkRead = (idx) => setRead((prev) => [...prev, idx]);
  const handleMarkUnread = (idx) => setRead((prev) => prev.filter(i => i !== idx));
  const handleClearAll = () => setRead(notificationLog.map((_, i) => i));

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBell className="text-2xl text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
        </div>
        {notificationLog.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaTrash /> Clear All
          </button>
        )}
      </div>
      <div className="w-full">
        {notificationLog.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-4">
            {notificationLog.slice().reverse().map((notif, i) => {
              const idx = notificationLog.length - 1 - i;
              const isRead = read.includes(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-xl shadow bg-white border-l-4 ${
                    notif.type === 'success' ? 'border-green-500' : notif.type === 'error' ? 'border-red-500' : 'border-blue-500'
                  } ${isRead ? 'opacity-60' : ''}`}
                >
                  <div className="text-2xl">{typeIcon[notif.type] || <FaInfoCircle className="text-blue-500" />}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{notif.message}</div>
                    <div className="text-xs text-gray-500">{notif.timestamp ? new Date(notif.timestamp).toLocaleString() : ''}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {isRead ? (
                      <button
                        onClick={() => handleMarkUnread(idx)}
                        className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >Mark as Unread</button>
                    ) : (
                      <button
                        onClick={() => handleMarkRead(idx)}
                        className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      >Mark as Read</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications; 