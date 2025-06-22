import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userType, credentials) => {
    // Simple login logic - in real app, validate against backend
    setUser({ type: userType, ...credentials });
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigation} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigation} onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNavigation} onLogout={handleLogout} />;
      default:
        return <LandingPage onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;