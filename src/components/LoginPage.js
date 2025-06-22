import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [selectedUserType, setSelectedUserType] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUserType && credentials.username && credentials.password) {
      onLogin(selectedUserType, credentials);
    }
  };

  const handleInputChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="login-page-container">
      {/* Navigation Header */}
      <header className="header">
        <div className="logo-container">
          <img 
            src="/image.png" 
            alt="Logo" 
            className="logo"
          />
        </div>
        
        <nav className="nav">
          <div className="nav-divider"></div>
          <button onClick={() => onNavigate('landing')} className="nav-link">DASHBOARD</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">PROGRAMMES</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">ABOUT US</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">CONTACT</button>
        </nav>

        <button 
          onClick={() => onNavigate('landing')} 
          className="login-button"
        >
          BACK
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-overlay">
          <h1 className="welcome-title">Welcome to Curriculum Portal</h1>
          
          <div className="login-section">
            <p className="login-prompt">CHOOSE HOW YOU WANT TO LOGIN</p>
            
            <div className="user-type-buttons">
              <button 
                onClick={() => setSelectedUserType('admin')}
                className={`option-button ${selectedUserType === 'admin' ? 'active' : ''}`}
              >
                ADMIN
              </button>
              <button 
                onClick={() => setSelectedUserType('user')}
                className={`option-button ${selectedUserType === 'user' ? 'active' : ''}`}
              >
                USER
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-divider"></div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="username">USERNAME</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="password">PASSWORD</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                />
              </div>
              
              <button 
                type="submit"
                className="submit-button"
                disabled={!selectedUserType || !credentials.username || !credentials.password}
              >
                LOGIN
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;