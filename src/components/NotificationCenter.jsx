import React, { useContext } from 'react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationCenter.css';

const NotificationCenter = ({ slideIn = false }) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead,
    removeNotification, 
    clearAllNotifications,
    handleNotificationClick,
    getUnreadCount 
  } = useNotifications();

  const unreadCount = getUnreadCount();

  return (
    <div className={`notification-center ${slideIn ? 'slide-in' : ''}`}>
      {/* Action buttons */}
      {notifications && notifications.length > 0 && (
        <div className="notification-actions-header">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="mark-all-read-btn"
            >
              Mark All Read ({unreadCount})
            </button>
          )}
          <button
            onClick={clearAllNotifications}
            className="clear-all-btn"
          >
            Clear All
          </button>
        </div>
      )}
      
      <div className="notification-list">
        {(!notifications || notifications.length === 0) ? (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id || notification.id}
              className={`notification-item ${(notification.read || notification.isRead) ? 'read' : 'unread'} clickable`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.createdAt || notification.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="notification-actions">
                {!(notification.read || notification.isRead) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id || notification.id);
                    }}
                    className="mark-read-btn"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification._id || notification.id);
                  }}
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
