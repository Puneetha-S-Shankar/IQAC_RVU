import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Generate a unique tab ID
const getTabId = () => {
  let tabId = sessionStorage.getItem('tabId');
  if (!tabId) {
    tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('tabId', tabId);
  }
  return tabId;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabId] = useState(getTabId);

  // Check for existing user data on component mount
  useEffect(() => {
    console.log('🔑 AuthContext: Checking for existing auth...');
    
    // Clear any old localStorage auth data to prevent conflicts
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Only check sessionStorage for tab-specific auth
    const sessionUser = sessionStorage.getItem('user');
    const sessionToken = sessionStorage.getItem('token');
    
    console.log('🔑 AuthContext: Session user exists:', !!sessionUser);
    console.log('🔑 AuthContext: Session token exists:', !!sessionToken);
    
    if (sessionUser && sessionToken) {
      try {
        if (sessionToken === 'logged-in') {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          return;
        }
        const parsedUser = JSON.parse(sessionUser);
        setUser(parsedUser);
        setToken(sessionToken);
        console.log('🔑 AuthContext: Restored session for tab:', tabId, parsedUser);
        return;
      } catch (error) {
        console.error('Error parsing session user data:', error);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }
    }
    
    console.log('No existing session for tab:', tabId);
  }, [tabId]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        setError(null);
        
        // Store user data and JWT token ONLY in sessionStorage (tab-specific)
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('token', data.token);
        
        console.log('🎉 Login successful for tab:', tabId);
        console.log('👤 User stored:', data.user);
        console.log('🎫 Token stored:', !!data.token);
        
        // Add welcome notification (you can remove this later)
        if (window.addWelcomeNotification) {
          window.addWelcomeNotification();
        }
      } else {
        setError(data.message || "Login failed");
        setUser(null);
      }
    } catch (err) {
      setError("Network error");
      setUser(null);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear ONLY session-specific data (tab-independent)
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    console.log('Logout successful for tab:', tabId);
  };

  const getToken = () => {
    // Only use sessionStorage (tab-specific)
    const tokenFromStorage = sessionStorage.getItem('token');
    console.log('🔑 getToken called, token exists:', !!tokenFromStorage);
    return tokenFromStorage;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, token, loading, error, tabId }}>
      {children}
    </AuthContext.Provider>
  );
}; 