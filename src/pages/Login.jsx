<<<<<<< HEAD
import React from "react";

const Login = () => {
  const pageStyle = {
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  };

  const containerStyle = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001730",
  };

  const wrapperStyle = {
    width: "90%",
    maxWidth: "1100px",
    height: "80%",
    display: "flex",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#001f3f",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  };

  const leftStyle = {
    flex: 1,
    backgroundColor: "#00274d",
    color: "#FFD700",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  };

  const rightStyle = {
    flex: 1,
    padding: "3rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#001f3f",
  };

  const inputStyle = {
    padding: "1rem",
    marginBottom: "1.5rem",
    width: "100%",
    borderRadius: "6px",
    border: "none",
    fontSize: "1rem",
  };

  const buttonStyle = {
    backgroundColor: "#FFD700",
    color: "#001f3f",
    fontWeight: "bold",
    padding: "1rem",
    width: "100%",
    border: "none",
    borderRadius: "6px",
    fontSize: "1.1rem",
    cursor: "pointer",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          <div style={leftStyle}>
            <h1>Welcome Back</h1>
            <p style={{ textAlign: "center" }}>
              Login to access the IQAC Dashboard and manage quality assurance activities.
            </p>
          </div>
          <div style={rightStyle}>
            <h2 style={{ color: "#FFD700", marginBottom: "2rem", textAlign: "center" }}>Login</h2>
            <input type="text" placeholder="Username or Email" style={inputStyle} />
            <input type="password" placeholder="Password" style={inputStyle} />
            <button type="submit" style={buttonStyle}>Login</button>
          </div>
        </div>
=======
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Login successful!");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="login-fullscreen">
      <Navbar />
      <div className="login-form-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
          {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: "green", marginTop: 10 }}>{success}</div>}
        </form>
>>>>>>> ffcfc0882e082ec24dc27af1982c9125aac7d80f
      </div>
    </div>
  );
};

export default Login;
