import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/rvu-logo.png"; // Make sure the path is correct
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const linkStyle = {
    color: "#FFD700",
    marginLeft: "2rem",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1rem",
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/">
        <img src={logo} alt="RVU Logo" style={{ height: "50px", marginRight: "18px" }} className="navbar-logo" /></Link>
        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#FFD700" }}>IQAC Portal</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
        {/* <Link to="/" style={linkStyle}>Home</Link> */}
        
        {user && <span onClick={handleLogout} style={{...linkStyle, cursor: "pointer"}}>Logout</span>}
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        
        <Link to="/policy" style={linkStyle}>Policy</Link>
        <Link to="/template" style={linkStyle}>Template</Link>
        <Link to="/about" style={linkStyle}>About Us</Link>
        {!user && <Link to="/login" style={linkStyle}>Login</Link>}
      </div>
    </nav>
  );
};

export default Navbar;
