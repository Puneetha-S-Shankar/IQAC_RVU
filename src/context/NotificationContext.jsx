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

  const markAsRead = async (id) => {
    // Update local state immediately for better UX
    setNotifications(prev => 
      prev.map(notif => 
        (notif._id || notif.id) === id ? { ...notif, read: true, isRead: true } : notif
      )
    );

    // Also update on server if it's a database notification
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token && id && id.length === 24) { // Check if it's a MongoDB ObjectId
        const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn('Failed to mark notification as read on server');
          // Revert local state if server update failed
          setNotifications(prev => 
            prev.map(notif => 
              (notif._id || notif.id) === id ? { ...notif, read: false, isRead: false } : notif
            )
          );
        }
      }
    } catch (error) {
      console.error('Error marking notification as read on server:', error);
      // Revert local state if server update failed
      setNotifications(prev => 
        prev.map(notif => 
          (notif._id || notif.id) === id ? { ...notif, read: false, isRead: false } : notif
        )
      );
    }
  };

  const clearAllNotifications = async () => {
    // Update local state immediately
    setNotifications([]);
    
    // Also clear on server
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/notifications/clear-all', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn('Failed to clear notifications on server');
          // Refresh from server to restore state
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error('Error clearing notifications on server:', error);
      // Refresh from server to restore state
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Update local state immediately
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true, isRead: true }))
    );
    
    // Also update on server
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        const response = await fetch(`http://localhost:5000/api/notifications/read-all`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn('Failed to mark all notifications as read on server');
          // Refresh from server to restore correct state
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read on server:', error);
      // Refresh from server to restore correct state
      fetchNotifications();
    }
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
      // Get token from sessionStorage first, then localStorage
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
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
    markAllAsRead,
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
