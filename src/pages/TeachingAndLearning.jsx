import React, { useState } from 'react';
import './TeachingAndLearning.css'; // Assuming a CSS file for styling

const TeachingAndLearning = () => {
  const [showFiles, setShowFiles] = useState(false);
  const [fileStatus, setFileStatus] = useState(
    Array(10).fill({ uploaded: false })
  );

  const handleCourseFilesClick = () => {
    setShowFiles((prev) => !prev);
  };

  const handleUpload = (index) => {
    // In a real app, this would handle the file upload logic.
    // For now, we'll just toggle the status.
    const newFileStatus = [...fileStatus];
    newFileStatus[index] = { uploaded: true };
    setFileStatus(newFileStatus);
  };

  const documents = Array.from({ length: 10 }, (_, i) => `Document ${i + 1}`);

  return (
    <div className="teaching-learning-main-container">
      <h1 className="teaching-learning-main-heading">Teaching and Learning</h1>
      <div className="teaching-learning-main-row">
        <div className="dashboard-card criteria-animated-btn teaching-learning-sidebar">
          <button className="teaching-learning-sidebar-btn" onClick={handleCourseFilesClick}>
            Course Files
          </button>
        </div>
        <div className="dashboard-card criteria-animated-btn teaching-learning-mainbox">
          <div className="teaching-learning-mainbox-header">
            Files you need to Upload
          </div>
          {showFiles && (
            <ul className="teaching-learning-document-list">
              {documents.map((doc, index) => (
                <li key={index} className="teaching-learning-document-item">
                  <span>{doc}</span>
                  <div className="teaching-learning-buttons">
                    <button
                      className={`teaching-learning-upload-btn ${fileStatus[index].uploaded ? 'green' : 'orange'}`}
                      onClick={() => handleUpload(index)}
                    >
                      Upload
                    </button>
                    <button
                      className={`teaching-learning-view-btn ${fileStatus[index].uploaded ? 'green' : 'orange'}`}
                    >
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachingAndLearning; 