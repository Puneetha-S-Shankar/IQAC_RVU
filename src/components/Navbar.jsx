import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/rvu-logo.png"; // Make sure the path is correct

const Navbar = () => {
  const navStyle = {
    backgroundColor: "#001f3f",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#FFD700",
  };

  const leftSection = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const logoStyle = {
    height: "40px",
    width: "auto",
  };

  const linkStyle = {
    color: "#FFD700",
    marginLeft: "2rem",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1rem",
  };

  return (
    <nav style={navStyle}>
      <div style={leftSection}>
        <img src={logo} alt="RVU Logo" style={logoStyle} />
        <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>IQAC Portal</div>
      </div>
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/login" style={linkStyle}>Login</Link>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/about" style={linkStyle}>About</Link>
        <Link to="/policy" style={linkStyle}>Policy</Link>
<Link to="/template" style={linkStyle}>Template</Link>

      </div>
    </nav>
  );
};

export default Navbar;
