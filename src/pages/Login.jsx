import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login, user, loading, error } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="login-fullscreen">
      <div className="login-form-wrapper">
        <form className="login-form styled-login-form" onSubmit={handleSubmit}>
          <h2 className="login-heading">Login</h2>
          <div className="input-group">
            <label htmlFor="email">Username</label>
            <input
              id="email"
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
