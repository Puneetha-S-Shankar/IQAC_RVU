import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onNavigate, onLogout }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toLocaleDateString()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setShowUpload(false);
  };

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="dashboard-container">
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
          <button className="nav-link active">DASHBOARD</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">PROGRAMMES</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">ABOUT US</button>
          
          <div className="nav-divider"></div>
          <button className="nav-link">CONTACT</button>
        </nav>

        <button onClick={onLogout} className="login-button">
          LOGOUT
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">DASHBOARD</h1>
          <p className="user-info">Welcome, {user?.username} ({user?.type})</p>
        </div>

        <div className="dashboard-actions">
          <div className="action-card">
            <div className="action-icon upload-icon">
              📁
            </div>
            <button 
              onClick={() => setShowUpload(!showUpload)} 
              className="action-button"
            >
              Upload files
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon view-icon">
              👁️
            </div>
            <button 
              onClick={() => setShowFiles(!showFiles)} 
              className="action-button"
            >
              View Files
            </button>
          </div>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="upload-section">
            <h3>Upload Files</h3>
            <div className="upload-area">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="file-label">
                Click to select files or drag and drop
              </label>
            </div>
          </div>
        )}

        {/* Files List Section */}
        {showFiles && (
          <div className="files-section">
            <h3>Uploaded Files ({uploadedFiles.length})</h3>
            {uploadedFiles.length === 0 ? (
              <p className="no-files">No files uploaded yet</p>
            ) : (
              <div className="files-list">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-details">
                        {(file.size / 1024).toFixed(1)} KB • {file.uploadDate}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteFile(file.id)}
                      className="delete-button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;