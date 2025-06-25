import React from "react";
import "./Login.css"; // optional if you already styled it

const Login = () => {
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
        <div style={{ marginBottom: "1.5rem" }}>
          <label>Username</label>
          <input type="text" style={{
            width: "100%",
            padding: "0.6rem",
            borderRadius: "6px",
            border: "none",
            marginTop: "0.3rem"
          }} />
        </div>
        <div style={{ marginBottom: "2rem" }}>
          <label>Password</label>
          <input type="password" style={{
            width: "100%",
            padding: "0.6rem",
            borderRadius: "6px",
            border: "none",
            marginTop: "0.3rem"
          }} />
        </div>
        <button style={{
          width: "100%",
          padding: "0.8rem",
          backgroundColor: "#FFD700",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          color: "#001730",
          cursor: "pointer"
        }}>
          Log In
        </button>
      </div>
    </div>
  );
};

export default Login;
