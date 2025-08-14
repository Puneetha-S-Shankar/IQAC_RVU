import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import './NotificationCenter.css';

const NotificationCenter = ({ slideIn = false }) => {
  const { 
    allNotifications,
    newNotifications,
    readNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification, 
    clearAllNotifications,
    clickNotification,
    unreadCount,
    loading,
    error
  } = useNotifications();

  // Debug logging
  console.log('🔍 NotificationCenter Debug:');
  console.log('  newNotifications:', newNotifications);
  console.log('  readNotifications:', readNotifications);
  console.log('  allNotifications:', allNotifications);
  console.log('  unreadCount:', unreadCount);
  console.log('  loading:', loading);
  console.log('  error:', error);

  // State for active tab
  const [activeTab, setActiveTab] = useState('unread');

  const handleNotificationClick = async (notification) => {
    try {
      await clickNotification(notification._id);
    } catch (error) {
      console.error('Error clicking notification:', error);
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation(); // Prevent the click event from bubbling up
    try {
      if (!notificationId) {
        console.error('No notification ID provided');
        return;
      }
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event?.stopPropagation();
    
    console.log('🗑️ Deleting notification:', notificationId);
    
    try {
      if (!notificationId) {
        console.error('No notification ID provided');
        return;
      }
      await deleteNotification(notificationId);
      console.log('✅ Notification deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  // Get notifications based on active tab
  const getDisplayNotifications = () => {
    if (activeTab === 'unread') {
      return newNotifications || [];
    } else if (activeTab === 'read') {
      return readNotifications || [];
    }
    return [];
  };

  if (loading) {
    return (
      <div className={`notification-center ${slideIn ? 'slide-in' : ''}`}>
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`notification-center ${slideIn ? 'slide-in' : ''}`}>
        <div className="error">Error loading notifications: {error}</div>
      </div>
    );
  }

  return (
    <div className={`notification-center ${slideIn ? 'slide-in' : ''}`}>
      {/* Tab Navigation */}
      <div className="notification-tabs">
        <button
          className={`tab-button ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread ({newNotifications?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'read' ? 'active' : ''}`}
          onClick={() => setActiveTab('read')}
        >
          Read ({readNotifications?.length || 0})
        </button>
      </div>

      {/* Action buttons */}
      <div className="notification-actions-header">
        {activeTab === 'unread' && unreadCount > 0 && (
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
          Clear All {activeTab}
        </button>
      </div>
      
      <div className="notification-list">
        {getDisplayNotifications().length === 0 ? (
          <div className="no-notifications">
            <p>No {activeTab} notifications</p>
          </div>
        ) : (
          getDisplayNotifications().map((notification, index) => (
            <div
              key={`${notification._id || notification.id}-${activeTab}-${index}`}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'} clickable`}
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
                {!notification.isRead && activeTab === 'unread' && (
                  <button
                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                    className="mark-read-btn"
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                  className={`delete-btn ${activeTab === 'read' ? 'delete-btn-read' : ''}`}
                  title="Delete notification"
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
