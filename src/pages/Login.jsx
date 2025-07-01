import React, { useState } from "react";
import "./Login.css"; // optional if you already styled it

const Login = () => {
  const [username, setUsername] = useState("");
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
        body: JSON.stringify({ email: username, password }),
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
    <div style={{
      height: "100vh",
      width: "100vw",
      backgroundColor: "#001730",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      boxSizing: "border-box"
    }}>
      <div style={{
        backgroundColor: "#003366",
        padding: "3rem",
        borderRadius: "12px",
        color: "white",
        minWidth: "400px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
      }}>
        <h2 style={{ color: "#FFD700", textAlign: "center", marginBottom: "2rem" }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label>Username</label>
            <input
              type="text"
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "6px",
                border: "none",
                marginTop: "0.3rem"
              }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <label>Password</label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "6px",
                border: "none",
                marginTop: "0.3rem"
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.8rem",
              backgroundColor: "#FFD700",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              color: "#001730",
              cursor: "pointer"
            }}
          >
            Log In
          </button>
          {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: "green", marginTop: 10 }}>{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
