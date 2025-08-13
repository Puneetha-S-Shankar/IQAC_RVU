import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/rvu-logo.png";
import { AuthContext } from "../context/AuthContext";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaRegFileCode,
  FaInfoCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaUsersCog,
  FaUser,
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('viewer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get user role from AuthContext or localStorage
  useEffect(() => {
    let userData = null;
    let token = null;
    
    // First check AuthContext
    if (user) {
      userData = user;
      token = 'logged-in';
    } else {
      // Fallback to localStorage
      try {
        userData = JSON.parse(localStorage.getItem('user') || 'null');
        token = localStorage.getItem('token');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    if (userData && userData._id && token) {
      setUserRole(userData.role || 'viewer');
      setIsAuthenticated(true);
      setCurrentUser(userData);
    } else {
      setUserRole('viewer');
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, [user]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfile && !event.target.closest('.profile-dropdown') && !event.target.closest('[data-profile-trigger]')) {
        setShowProfile(false);
      }
    };

    if (showProfile) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showProfile]);

  // Function to check if user can access restricted content
  const canAccessRestrictedContent = () => {
    return isAuthenticated && userRole !== 'viewer';
  };

  const linkStyle = {
    color: "#FFD700",
    marginLeft: "2rem",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    transition: "all 0.3s ease",
  };

  const linkHoverStyle = {
    textShadow: "0 0 6px rgba(255, 215, 0, 0.5)",
    transform: "scale(1.05)",
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "#182E37",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(4px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo and title */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/">
          <img
            src={logo}
            alt="RVU Logo"
            style={{ height: "50px", marginRight: "18px" }}
          />
        </Link>
        <Link to="/" style={{
          fontSize: "1.4rem",
          fontWeight: "bold",
          color: "#FFD700",
          letterSpacing: "1px",
          textDecoration: "none"
        }}>
          IQAC Portal
        </Link>
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link to="/dashboard" style={linkStyle} className="nav-hover">
          <FaTachometerAlt /> Dashboard
        </Link>

        <Link to="/policy" style={linkStyle} className="nav-hover">
          <FaFileAlt /> Policy
        </Link>

        {/* Templates - Only show if user has access */}
        {canAccessRestrictedContent() && (
          <Link to="/template" style={linkStyle} className="nav-hover">
            <FaRegFileCode /> Template
          </Link>
        )}

        {/* Roles - Only show for admin users */}
        {userRole === 'admin' && (
          <Link to="/roles" style={linkStyle} className="nav-hover">
            <FaUsersCog /> Roles
          </Link>
        )}

        <Link to="/about" style={linkStyle} className="nav-hover">
          <FaInfoCircle /> About Us
        </Link>

        {!user ? (
          <Link to="/login" style={linkStyle} className="nav-hover">
            <FaSignInAlt /> Login
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span
              onClick={() => setShowProfile(!showProfile)}
              style={{ ...linkStyle, cursor: "pointer", position: 'relative' }}
              className="nav-hover"
              data-profile-trigger="true"
            >
              <FaUser /> Profile
            </span>
            <span
              onClick={handleLogout}
              style={{ ...linkStyle, cursor: "pointer" }}
              className="nav-hover"
            >
              <FaSignOutAlt /> Logout
            </span>
          </div>
        )}
      </div>

      {/* Hover effect using inline style injection */}
      <style>
        {`
          .nav-hover:hover {
            text-shadow: 0 0 6px rgba(255, 215, 0, 0.5);
            transform: scale(1.05);
          }
          .profile-dropdown {
            position: absolute;
            top: 70px;
            right: 20px;
            background: white;
            border: 2px solid #ffd700;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 200px;
            color: #333;
          }
          .profile-dropdown h4 {
            margin: 0 0 10px 0;
            color: #8B4513;
          }
          .profile-dropdown p {
            margin: 5px 0;
            color: #555;
          }
        `}
      </style>

      {/* Profile Dropdown */}
      {showProfile && currentUser && (
        <div className="profile-dropdown">
          <h4>Profile Information</h4>
          <p><strong>You are logged in as:</strong> {currentUser.username}</p>
          <p><strong>Role:</strong> {currentUser.role}</p>
          {currentUser.email && <p><strong>Email:</strong> {currentUser.email}</p>}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
