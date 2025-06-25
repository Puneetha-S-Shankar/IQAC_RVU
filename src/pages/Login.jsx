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
      </div>
    </div>
  );
};

export default Login;
