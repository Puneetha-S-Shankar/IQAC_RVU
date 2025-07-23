import React, { useState, useRef, useEffect } from 'react';
import './TeachingAndLearning.css';

const API_BASE = 'http://localhost:5000';

const TeachingAndLearning = () => {
  const [showFiles, setShowFiles] = useState(false);
  const [fileStatus, setFileStatus] = useState(Array(10).fill({ uploaded: false, file: null, task: null }));
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRefs = useRef([]);
  const [uploadStatus, setUploadStatus] = useState(Array(10).fill(''));
  const [userRole, setUserRole] = useState('viewer'); // Default to viewer
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Get user info from localStorage or auth context
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        
        if (user && user._id && token) {
          setCurrentUser(user);
          setUserRole(user.role || 'viewer');
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setUserRole('viewer');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setCurrentUser(null);
        setUserRole('viewer');
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  useEffect(() => {
    fetchExistingFiles();
    if (isAuthenticated && userRole === 'user') {
      fetchUserTasks();
    }
  }, [userRole, isAuthenticated]);

  const fetchExistingFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/files/category/teaching-and-learning`);
      if (response.ok) {
        const files = await response.json();
        const newFileStatus = Array(10).fill({ uploaded: false, file: null, task: null });
        
        // Only show approved files for viewers and non-admin users
        const filesToShow = (!isAuthenticated || userRole === 'viewer') 
          ? files.filter(file => file.metadata && file.metadata.status === 'approved')
          : files;
        
        filesToShow.forEach(file => {
          if (file.metadata && file.metadata.docNumber) {
            const index = file.metadata.docNumber - 1;
            if (index >= 0 && index < 10) {
              newFileStatus[index] = { uploaded: true, file: file, task: null };
            }
          }
        });
        
        setFileStatus(newFileStatus);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchUserTasks = async () => {
    if (!currentUser || !currentUser._id) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/tasks/user/${currentUser._id}`);
      if (response.ok) {
        const userTasks = await response.json();
        const teachingTasks = userTasks.filter(task => task.category === 'teaching-and-learning');
        setTasks(teachingTasks);
        
        // Update file status with task information
        const newFileStatus = [...fileStatus];
        teachingTasks.forEach(task => {
          const index = task.docNumber - 1;
          if (index >= 0 && index < 10) {
            newFileStatus[index] = { 
              ...newFileStatus[index], 
              task: task,
              hasTask: true
            };
          }
        });
        setFileStatus(newFileStatus);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCourseFilesClick = () => {
    setShowFiles((prev) => !prev);
  };

  const handleUploadClick = (index) => {
    // Authentication and role checks
    if (!isAuthenticated) {
      alert('Please log in to upload files.');
      return;
    }
    
    if (userRole === 'viewer') {
      alert('You do not have permission to upload files. Please contact an administrator.');
      return;
    }
    
    if (userRole === 'user' && !fileStatus[index].hasTask) {
      alert('No task assigned for this document. Please contact your administrator.');
      return;
    }

    setUploadingIndex(index);
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = '';
      fileInputRefs.current[index].click();
    }
  };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) {
      // User cancelled file selection - reset uploading state
      setUploadingIndex(null);
      return;
    }
    
    try {
      await uploadFile(file, index);
    } finally {
      setUploadingIndex(null);
    }
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
        try {
          await uploadFile(file, uploadingIndex);
        } finally {
          setUploadingIndex(null);
        }
      }
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [uploadingIndex]);

  const uploadFile = async (file, index) => {
    const newUploadStatus = [...uploadStatus];
    newUploadStatus[index] = 'Uploading...';
    setUploadStatus(newUploadStatus);

    const task = fileStatus[index].task;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docNumber', index + 1);
    formData.append('category', 'teaching-and-learning');
    formData.append('description', `Teaching and Learning Document ${index + 1}`);
    formData.append('uploadedBy', currentUser?._id || 'anonymous');
    formData.append('uploadDate', new Date().toISOString());
    formData.append('status', userRole === 'admin' ? 'approved' : 'pending');
    formData.append('taskId', task?._id || '');

    try {
      const response = await fetch(`${API_BASE}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok && data.file) {
        // Update task status if user upload
        if (userRole === 'user' && task) {
          await fetch(`${API_BASE}/api/tasks/${task._id}/submit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId: data.file._id })
          });
        }

        const newStatus = [...fileStatus];
        newStatus[index] = { 
          uploaded: true, 
          file: data.file,
          task: task,
          hasTask: !!task
        };
        setFileStatus(newStatus);
        
        newUploadStatus[index] = userRole === 'admin' ? 
          'Upload successful!' : 
          'Upload successful! Awaiting admin approval.';
        setUploadStatus([...newUploadStatus]);
        
        setTimeout(() => {
          newUploadStatus[index] = '';
          setUploadStatus([...newUploadStatus]);
        }, 3000);
      } else {
        newUploadStatus[index] = data.error || 'Upload failed.';
        setUploadStatus([...newUploadStatus]);
        
        setTimeout(() => {
          newUploadStatus[index] = '';
          setUploadStatus([...newUploadStatus]);
        }, 5000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      newUploadStatus[index] = 'Upload failed: ' + err.message;
      setUploadStatus([...newUploadStatus]);
      
      setTimeout(() => {
        newUploadStatus[index] = '';
        setUploadStatus([...newUploadStatus]);
      }, 5000);
    }
  };

  const handleView = (index) => {
    const fileData = fileStatus[index].file;
    if (fileData && fileData._id) {
      const url = `${API_BASE}/api/files/${fileData._id}/download`;
      window.open(url, '_blank');
    } else {
      alert('No file available for this document.');
    }
  };

  const handleDelete = async (index) => {
    if (!isAuthenticated || userRole !== 'admin') {
      alert('You do not have permission to delete files.');
      return;
    }

    const fileData = fileStatus[index].file;
    if (!fileData || !fileData._id) {
      alert('No file to delete.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const response = await fetch(`${API_BASE}/api/files/${fileData._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const newFileStatus = [...fileStatus];
          newFileStatus[index] = { 
            uploaded: false, 
            file: null, 
            task: fileStatus[index].task, 
            hasTask: fileStatus[index].hasTask 
          };
          setFileStatus(newFileStatus);
          
          const newUploadStatus = [...uploadStatus];
          newUploadStatus[index] = 'File deleted successfully!';
          setUploadStatus(newUploadStatus);
          
          setTimeout(() => {
            newUploadStatus[index] = '';
            setUploadStatus([...newUploadStatus]);
          }, 3000);
        } else {
          alert('Failed to delete file.');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting file.');
      }
    }
  };

  const getDocumentTitle = (index) => {
    const task = fileStatus[index].task;
    if (task) {
      return `${task.title} (Due: ${new Date(task.deadline).toLocaleDateString()})`;
    }
    return `Teaching & Learning Document ${index + 1}`;
  };

  const getButtonClass = (index, type) => {
    const base = `teaching-learning-${type}-btn`;
    const task = fileStatus[index].task;
    
    if (type === 'upload') {
      if (!isAuthenticated || userRole === 'viewer') return `${base} disabled`;
      if (userRole === 'user' && !task) return `${base} disabled`;
      if (fileStatus[index].uploaded && task?.status === 'pending') return `${base} orange`;
      if (fileStatus[index].uploaded) return `${base} green`;
      return `${base} orange`;
    }
    
    if (type === 'view') {
      return fileStatus[index].uploaded ? `${base} green` : `${base} orange`;
    }
    
    return base;
  };

  const shouldShowUploadButton = (index) => {
    if (!isAuthenticated) return false;
    if (userRole === 'viewer') return false;
    if (userRole === 'user' && !fileStatus[index].hasTask) return false;
    return true;
  };

  const shouldShowDeleteButton = (index) => {
    return isAuthenticated && userRole === 'admin' && fileStatus[index].uploaded;
  };

  const documents = Array.from({ length: 10 }, (_, i) => getDocumentTitle(i));

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
            {!isAuthenticated 
              ? 'Available Documents (Login to Upload)' 
              : userRole === 'viewer' 
                ? 'Available Documents' 
                : userRole === 'user'
                  ? 'Your Assigned Tasks'
                  : 'File Management'}
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
                    {shouldShowUploadButton(index) && (
                      <button
                        className={getButtonClass(index, 'upload')}
                        onClick={() => handleUploadClick(index)}
                        disabled={uploadingIndex === index || (userRole === 'user' && !fileStatus[index].hasTask)}
                      >
                        {uploadingIndex === index ? 'Uploading...' : 
                         fileStatus[index].uploaded ? 'Re-upload' : 'Upload'}
                      </button>
                    )}
                    
                    <input
                      type="file"
                      ref={el => (fileInputRefs.current[index] = el)}
                      style={{ display: 'none' }}
                      onChange={e => handleFileChange(e, index)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    
                    <button
                      className={getButtonClass(index, 'view')}
                      onClick={() => handleView(index)}
                      disabled={!fileStatus[index].uploaded}
                    >
                      View
                    </button>
                    
                    {shouldShowDeleteButton(index) && (
                      <button
                        className="teaching-learning-delete-btn"
                        onClick={() => handleDelete(index)}
                        style={{ 
                          backgroundColor: '#dc3545', 
                          color: 'white',
                          marginLeft: '0.5rem',
                          padding: '0.5rem 1rem',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  {/* Authentication Status */}
                  {!isAuthenticated && (
                    <div style={{ 
                      marginTop: '0.25rem',
                      fontSize: '12px',
                      color: '#ffa500',
                      fontStyle: 'italic'
                    }}>
                      Please log in to upload files
                    </div>
                  )}
                  
                  {/* Task Status Indicator */}
                  {fileStatus[index].task && (
                    <div style={{ 
                      marginTop: '0.25rem',
                      fontSize: '12px',
                      color: fileStatus[index].task.status === 'approved' ? 'green' : 
                             fileStatus[index].task.status === 'rejected' ? 'red' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      Status: {fileStatus[index].task.status.toUpperCase()}
                      {fileStatus[index].task.status === 'rejected' && fileStatus[index].task.rejectionReason && (
                        <div style={{ color: 'red', marginTop: '2px' }}>
                          Reason: {fileStatus[index].task.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                  {uploadStatus[index] && (
                    <div style={{ 
                      marginTop: '0.5rem',
                      color: uploadStatus[index].includes('success') || uploadStatus[index].includes('successful') ? 'green' : 'red', 
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {uploadStatus[index]}
                    </div>
                  )}
                  {fileStatus[index].uploaded && fileStatus[index].file && (
                    <div style={{ 
                      marginTop: '0.25rem',
                      fontSize: '12px',
                      color: '#888',
                      fontStyle: 'italic'
                    }}>
                      File: {fileStatus[index].file.filename}
                    </div>
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