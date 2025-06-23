import React from "react";
import Navbar from "../components/Navbar";
import "./Login.css";

const Login = () => {
  return (
    <div className="login-fullscreen">
      <Navbar />
      <div className="login-form-wrapper">
        <form className="login-form">
          <h2>Login</h2>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
