import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="header">
        <div className="logo-container">
          <img 
            src="/logo192.png" 
            alt="Logo" 
            className="logo"
          />
        </div>
        
        <nav className="nav">
          <div className="nav-divider"></div>
          <button onClick={() => onNavigate('dashboard')} className="nav-link">DASHBOARD</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">PROGRAMMES</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">ABOUT US</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">CONTACT</button>
        </nav>

        <button 
          onClick={() => onNavigate('login')} 
          className="login-button"
        >
          LOGIN
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-overlay">
          <h1 className="welcome-title">Welcome to Curriculum Portal</h1>
          
          <div className="login-options">
            <p className="login-prompt">CHOOSE HOW YOU WANT TO LOGIN</p>
            
            <div className="login-buttons">
              <button 
                onClick={() => onNavigate('login')} 
                className="option-button admin-button"
              >
                ADMIN
              </button>
              <button 
                onClick={() => onNavigate('login')} 
                className="option-button user-button"
              >
                USER
              </button>
            </div>
          </div>

          <div className="login-form">
            <div className="form-divider"></div>
            <div className="form-group">
              <label className="form-label">USERNAME</label>
              <div className="form-input"></div>
            </div>
            
            <div className="form-group">
              <label className="form-label">PASSWORD</label>
              <div className="form-input"></div>
            </div>
            
            <button 
              onClick={() => onNavigate('login')} 
              className="submit-button"
            >
              LOGIN
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;