import React, { useState, useRef, useEffect } from 'react';
import './TeachingAndLearning.css';

const API_BASE = 'http://localhost:5000';

const TeachingAndLearning = () => {
  const [showFiles, setShowFiles] = useState(false);
  // fileStatus: [{ uploaded: bool, file: { _id, filename, ... } }]
  const [fileStatus, setFileStatus] = useState(Array(10).fill({ uploaded: false, file: null }));
  const [uploadingIndex, setUploadingIndex] = useState(null); // index of doc being uploaded
  const fileInputRefs = useRef([]); // array of refs for each file input
  const [uploadStatus, setUploadStatus] = useState(Array(10).fill(''));

  const handleCourseFilesClick = () => {
    setShowFiles((prev) => !prev);
  };

  // When Upload is clicked, open file picker for that doc
  const handleUploadClick = (index) => {
    setUploadingIndex(index);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = '';
      fileInputRefs.current[index].click();
    }
  };

  // When file is selected from picker
  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadFile(file, index);
    setUploadingIndex(null);
  };

  // Global drag-and-drop handlers
  useEffect(() => {
    if (uploadingIndex === null) return;
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        await uploadFile(file, uploadingIndex);
        setUploadingIndex(null);
      }
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [uploadingIndex]);

  // Upload logic
  const uploadFile = async (file, index) => {
    const newUploadStatus = [...uploadStatus];
    newUploadStatus[index] = 'Uploading...';
    setUploadStatus(newUploadStatus);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docNumber', index + 1);
    formData.append('category', 'teaching-and-learning');
    formData.append('description', `Teaching and Learning Document ${index + 1}`);
    try {
      const response = await fetch(`${API_BASE}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.file) {
        const newStatus = [...fileStatus];
        newStatus[index] = { uploaded: true, file: data.file };
        setFileStatus(newStatus);
        newUploadStatus[index] = 'Upload successful!';
        setUploadStatus([...newUploadStatus]);
        setTimeout(() => {
          newUploadStatus[index] = '';
          setUploadStatus([...newUploadStatus]);
        }, 1200);
      } else {
        newUploadStatus[index] = data.error || 'Upload failed.';
        setUploadStatus([...newUploadStatus]);
      }
    } catch (err) {
      newUploadStatus[index] = 'Upload failed: ' + err.message;
      setUploadStatus([...newUploadStatus]);
    }
  };

  // View file in new tab
  const handleView = (index) => {
    const file = fileStatus[index].file;
    if (file && file._id) {
      const url = `${API_BASE}/api/files/${file._id}/download`;
      window.open(url, '_blank');
    } else {
      alert('No file uploaded yet for this document.');
    }
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
                <li
                  key={index}
                  className="teaching-learning-document-item"
                  style={{ position: 'relative' }}
                >
                  <span>{doc}</span>
                  <div className="teaching-learning-buttons">
                    <button
                      className={`teaching-learning-upload-btn ${fileStatus[index].uploaded ? 'green' : 'orange'}`}
                      onClick={() => handleUploadClick(index)}
                    >
                      Upload
                    </button>
                    <input
                      type="file"
                      ref={el => (fileInputRefs.current[index] = el)}
                      style={{ display: 'none' }}
                      onChange={e => handleFileChange(e, index)}
                    />
                    <button
                      className={`teaching-learning-view-btn ${fileStatus[index].uploaded ? 'green' : 'orange'}`}
                      onClick={() => handleView(index)}
                    >
                      View
                    </button>
                  </div>
                  {uploadStatus[index] && (
                    <span style={{ marginLeft: 16, color: uploadStatus[index].includes('success') ? 'green' : 'red', fontSize: 14 }}>
                      {uploadStatus[index]}
                    </span>
                  )}
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