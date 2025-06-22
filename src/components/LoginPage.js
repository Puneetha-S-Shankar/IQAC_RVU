import React from 'react';
import './LoginPage.css';

const LoginPage = () => {
  return (
    <div className="login-page-container">
      <div className="navbar">
        <img className="logo" src="https://www.rvu.edu.in/wp-content/uploads/2021/03/rvu-logo.png" alt="Logo" />
        <nav className="nav-links">
          <a href="#dashboard">DASHBOARD</a>
          <div className="divider" />
          <a href="#programmes">PROGRAMMES</a>
          <div className="divider" />
          <a href="#about-us">ABOUT US</a>
          <div className="divider" />
          <a href="#contact">CONTACT</a>
        </nav>
        <a href="#login" className="login-button-box">
          <span className="login-button-text">LOGIN</span>
        </a>
      </div>
      <main className="main-content">
        <div className="left-panel">
          <h1 className="welcome-text">Welcome to Curriculum Portal</h1>
          <p className="login-choice-text">CHOOSE HOW YOU WANT TO LOGIN</p>
          <div className="login-options">
            <button className="option-button">ADMIN</button>
            <button className="option-button">USER</button>
          </div>
        </div>
        <div className="vertical-divider" />
        <div className="right-panel">
          <form className="login-form">
            <div className="form-group">
              <label htmlFor="username">USERNAME</label>
              <input type="text" id="username" />
            </div>
            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <input type="password" id="password" />
            </div>
            <button type="submit" className="submit-login-button">LOGIN</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
