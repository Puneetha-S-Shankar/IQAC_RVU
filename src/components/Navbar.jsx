import React, { useContext } from "react";
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
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

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

        <Link to="/template" style={linkStyle} className="nav-hover">
          <FaRegFileCode /> Template
        </Link>

        <Link to="/about" style={linkStyle} className="nav-hover">
          <FaInfoCircle /> About Us
        </Link>

        {!user ? (
          <Link to="/login" style={linkStyle} className="nav-hover">
            <FaSignInAlt /> Login
          </Link>
        ) : (
          <span
            onClick={handleLogout}
            style={{ ...linkStyle, cursor: "pointer" }}
            className="nav-hover"
          >
            <FaSignOutAlt /> Logout
          </span>
        )}
      </div>

      {/* Hover effect using inline style injection */}
      <style>
        {`
          .nav-hover:hover {
            text-shadow: 0 0 6px rgba(255, 215, 0, 0.5);
            transform: scale(1.05);
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
