import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

// Create and export the NotificationContext
export const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    new: [],
    read: [],
    all: []
  });
  const [counts, setCounts] = useState({
    new: 0,
    read: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications by category
  const fetchNotifications = async (category = 'all') => {
    if (!token || !user) {
      console.log('NotificationContext: No token or user, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Enhanced debugging logs
      console.log('🔍 NOTIFICATION FETCH DEBUG:');
      console.log('   Token present:', !!token);
      console.log('   Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('   User present:', !!user);
      console.log('   User ID:', user._id || user.id);
      console.log('   User info:', { 
        id: user._id || user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      });
      console.log('   Category:', category);
      
      let url = 'http://localhost:5000/api/notifications';
      if (category === 'categorized') {
        url += '/categorized';
      } else if (category !== 'all') {
        url += `?category=${category}`;
      }

      console.log('🌐 Making API request to:', url);
      console.log('🔑 Authorization header:', token ? 'Bearer ' + token.substring(0, 20) + '...' : 'missing');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch notifications: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Raw API data received:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Data length/keys:', Array.isArray(data) ? data.length : Object.keys(data));
      
      if (category === 'categorized') {
        const newNotifs = data.new || [];
        const readNotifs = data.read || [];
        const allNotifs = [...newNotifs, ...readNotifs];
        
        console.log('📂 Processing categorized data:', {
          new: newNotifs.length,
          read: readNotifs.length,
          all: allNotifs.length
        });
        
        // Log each notification's userId for comparison
        console.log('📋 Notifications with userIds:');
        allNotifs.forEach((notif, index) => {
          console.log(`  ${index + 1}. "${notif.title}" - userId: ${notif.userId}, type: ${notif.type}`);
        });
        
        setNotifications({
          new: newNotifs,
          read: readNotifs,
          all: allNotifs
        });
        setCounts(data.counts || { new: newNotifs.length, read: readNotifs.length, total: allNotifs.length });
      } else {
        console.log('NotificationContext: Setting single category notifications:', category, data.length);
        if (category === 'new') {
          setNotifications(prev => ({ ...prev, new: data }));
        } else if (category === 'read') {
          setNotifications(prev => ({ ...prev, read: data }));
        } else {
          setNotifications(prev => ({ ...prev, all: data }));
        }
      }
    } catch (error) {
      console.error('NotificationContext: Error fetching notifications:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification counts
  const fetchCounts = async () => {
    if (!token || !user) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/notifications/counts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCounts(data);
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  // Click notification (mark as read and navigate)
  const clickNotification = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/click`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Find the current notification to check if it's already read
        const currentNotification = notifications.all.find(n => n._id === notificationId);
        
        if (currentNotification && !currentNotification.isRead) {
          // Only update state if the notification was previously unread
          const updatedNotification = data.notification;
          
          setNotifications(prev => ({
            new: prev.new.filter(n => n._id !== notificationId),
            read: [updatedNotification, ...prev.read],
            all: prev.all.map(n => n._id === notificationId ? updatedNotification : n)
          }));
          
          // Update counts only if notification was unread
          setCounts(prev => ({
            ...prev,
            new: Math.max(0, prev.new - 1),
            read: prev.read + 1
          }));
        }
        
        // Navigate to the appropriate page regardless of read status
        if (data.navigationUrl) {
          navigate(data.navigationUrl);
        }
        
        return data;
      }
    } catch (error) {
      console.error('Error clicking notification:', error);
      setError(error.message);
    }
  };

  // Mark notification as read without navigation
  const markAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setNotifications(prev => {
          const updatedNotification = data.notification;
          return {
            new: prev.new.filter(n => n._id !== notificationId),
            read: [updatedNotification, ...prev.read],
            all: prev.all.map(n => n._id === notificationId ? updatedNotification : n)
          };
        });
        
        // Update counts
        setCounts(prev => ({
          ...prev,
          new: Math.max(0, prev.new - 1),
          read: prev.read + 1
        }));
        
        return data;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError(error.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Move all new notifications to read
        setNotifications(prev => ({
          new: [],
          read: [...prev.new, ...prev.read],
          all: prev.all.map(n => ({ ...n, isRead: true }))
        }));
        
        // Update counts
        setCounts(prev => ({
          new: 0,
          read: prev.total,
          total: prev.total
        }));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError(error.message);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/notifications/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications({ new: [], read: [], all: [] });
        setCounts({ new: 0, read: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      setError(error.message);
    }
  };

  // Delete specific notification
  const deleteNotification = async (notificationId) => {
    if (!token) {
      console.error('❌ No token available for delete');
      return;
    }
    
    console.log('🔍 Deleting notification:', notificationId);
    console.log('🔍 Current notifications state:', {
      new: notifications.new?.length,
      read: notifications.read?.length,
      all: notifications.all?.length
    });
    
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Check if notification was in new list before deleting
        const wasNew = notifications.new.some(n => n._id === notificationId);
        console.log('🔍 Was notification new?', wasNew);
        
        setNotifications(prev => ({
          new: prev.new.filter(n => n._id !== notificationId),
          read: prev.read.filter(n => n._id !== notificationId),
          all: prev.all.filter(n => n._id !== notificationId)
        }));
        
        setCounts(prev => ({
          new: prev.new - (wasNew ? 1 : 0),
          read: prev.read - (wasNew ? 0 : 1),
          total: prev.total - 1
        }));
        
        console.log('✅ Notification deleted successfully');
      } else {
        console.error('❌ Failed to delete notification:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError(error.message);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    console.log('🔄 NotificationContext useEffect triggered');
    console.log('   User:', user);
    console.log('   Token:', !!token);
    console.log('   Both present:', !!(user && token));
    
    if (user && token) {
      console.log('✅ Both user and token present, fetching notifications...');
      fetchNotifications('categorized');
      fetchCounts();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchCounts();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      console.log('❌ Missing user or token, skipping notification fetch');
    }
  }, [user, token]);

  // Helper function for backward compatibility
  const getUnreadCount = () => counts.new;

  const value = {
    notifications,
    counts,
    loading,
    error,
    fetchNotifications,
    fetchCounts,
    clickNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    deleteNotification,
    // Helper functions
    getUnreadCount,
    // Helper getters
    newNotifications: notifications.new,
    readNotifications: notifications.read,
    allNotifications: notifications.all,
    unreadCount: counts.new,
    readCount: counts.read,
    totalCount: counts.total
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Default export for easier importing
export default NotificationProvider;
