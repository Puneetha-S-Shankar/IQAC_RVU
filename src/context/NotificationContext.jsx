import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification._id || notification.id);
    
    // Navigate to Teaching and Learning page for task-related notifications
    if (notification.taskId || 
        notification.type === 'task_assigned' || 
        notification.type === 'file_submitted' || 
        notification.type === 'file_approved' || 
        notification.type === 'file_rejected' || 
        notification.type === 'reviewer_approved') {
      navigate('/teaching-and-learning');
    }
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove notification after 5 seconds if it's not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => (notif._id || notif.id) !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        (notif._id || notif.id) === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !(notif.read || notif.isRead)).length;
  };

  // Fetch notifications from server on mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up global function for welcome notification
    window.addWelcomeNotification = () => {
      addNotification({
        title: 'Welcome to IQAC Portal!',
        message: 'You have successfully logged in to the IQAC system. Explore the features and manage your assignments.',
        type: 'success',
        persistent: true
      });
      
      // Add a sample assignment notification
      setTimeout(() => {
        addNotification({
          title: 'New Assignment Available',
          message: 'Course Document 1 has been assigned to you for review. Please check the assignments tab.',
          type: 'assignment',
          persistent: true
        });
      }, 2000);
    };
    
    return () => {
      delete window.addWelcomeNotification;
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAllNotifications,
    getUnreadCount,
    fetchNotifications,
    handleNotificationClick
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };
export default NotificationProvider;
