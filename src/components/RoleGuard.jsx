import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  fallback = null,
  requireAuth = true 
}) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return fallback || <div>Please log in to access this feature.</div>;
  }

  // If no specific roles are required, show content
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's role is in the allowed roles
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  // User doesn't have required role
  return fallback || <div>You don't have permission to access this feature.</div>;
};

export default RoleGuard; 