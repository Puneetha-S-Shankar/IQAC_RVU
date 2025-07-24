import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import './NotificationCenter.css';

const NotificationCenter = ({ slideIn = false }) => {
  const { notifications, markAsRead, removeNotification } = useContext(NotificationContext);

  return (
    <div className={`notification-center ${slideIn ? 'slide-in' : ''}`}>
      <div className="notification-list">
        {(!notifications || notifications.length === 0) ? (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="mark-read-btn"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="clear-btn"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
