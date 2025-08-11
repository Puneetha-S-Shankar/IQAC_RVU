import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './TeachingAndLearning.css';

const API_BASE = 'http://localhost:5000';

const TeachingAndLearning = () => {
  const { user: contextUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('viewer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  // Get user info from AuthContext or localStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      let user = null;
      let token = null;
      
      if (contextUser) {
        user = contextUser;
        token = 'logged-in';
      } else {
        try {
          user = JSON.parse(localStorage.getItem('user') || 'null');
          token = localStorage.getItem('token');
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      if (user && user._id && token) {
        setCurrentUser(user);
        setUserRole(user.role || 'viewer');
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setUserRole('viewer');
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
  }, [contextUser]);

  // Redirect viewers away from this page
  useEffect(() => {
    if (!isAuthenticated || userRole === 'viewer') {
      alert('Access denied. This page is only available to authenticated users.');
      navigate('/dashboard');
    }
  }, [isAuthenticated, userRole, navigate]);

  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.email) {
      fetchUserAssignments();
    }
  }, [isAuthenticated, currentUser]);

  const fetchUserAssignments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const allAssignments = await response.json();
        
        // Filter assignments based on user role
        let userAssignments = [];
        if (userRole === 'admin') {
          userAssignments = allAssignments; // Admins see all assignments
        } else {
          // Regular users see assignments where they are initiator or reviewer
          userAssignments = allAssignments.filter(assignment => 
            (assignment.assignedToInitiator && assignment.assignedToInitiator.email === currentUser.email) ||
            (assignment.assignedToReviewer && assignment.assignedToReviewer.email === currentUser.email)
          );
        }
        
        setAssignments(userAssignments);
      } else {
        showMessage('Failed to fetch assignments', 'error');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showMessage('Error fetching assignments', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleFileSelect = (assignmentId, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [assignmentId]: file
    }));
  };

  const handleFileUpload = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) {
      showMessage('Please select a file first', 'error');
      return;
    }

    setUploadingAssignmentId(assignmentId);
    setUploadStatus(prev => ({ ...prev, [assignmentId]: 'Uploading...' }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'teaching-and-learning');
      formData.append('assignmentId', assignmentId);
      formData.append('uploaderEmail', currentUser.email);

      const response = await fetch(`${API_BASE}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showMessage('File uploaded successfully!', 'success');
        setUploadStatus(prev => ({ ...prev, [assignmentId]: 'Uploaded' }));
        await fetchUserAssignments(); // Refresh assignments
      } else {
        const errorData = await response.json();
        showMessage(errorData.error || 'Upload failed', 'error');
        setUploadStatus(prev => ({ ...prev, [assignmentId]: 'Failed' }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Upload failed', 'error');
      setUploadStatus(prev => ({ ...prev, [assignmentId]: 'Failed' }));
    } finally {
      setUploadingAssignmentId(null);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'assigned': '#6c757d',
      'file-uploaded': '#007bff',
      'in-review': '#ffc107',
      'approved-by-reviewer': '#28a745',
      'approved-by-admin': '#17a2b8',
      'completed': '#28a745'
    };
    return statusColors[status] || '#6c757d';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlineNear = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysDiff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 3 && daysDiff >= 0;
  };

  const isOverdue = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const canUploadFile = (assignment) => {
    // Initiators can upload if status is 'assigned'
    if (assignment.assignedToInitiator && assignment.assignedToInitiator.email === currentUser.email) {
      return assignment.status === 'assigned';
    }
    return false;
  };

  const canReview = (assignment) => {
    // Reviewers can review if status is 'file-uploaded' or 'in-review'
    if (assignment.assignedToReviewer && assignment.assignedToReviewer.email === currentUser.email) {
      return assignment.status === 'file-uploaded' || assignment.status === 'in-review';
    }
    return false;
  };

  // If not authorized, show loading or redirect message
  if (!isAuthenticated || userRole === 'viewer') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#182E37',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#D5AB5D',
        fontSize: '1.5rem'
      }}>
        Redirecting...
      </div>
    );
  }

  return (
    <div className="teaching-learning-container">
      <div className="teaching-learning-header">
        <h1 className="teaching-learning-title">Teaching and Learning - Course Documents</h1>
        <p className="teaching-learning-subtitle">
          {userRole === 'admin' ? 'Manage all course assignments' : 'Your assigned courses and documents'}
        </p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="assignments-container">
        {assignments.length === 0 ? (
          <div className="no-assignments">
            <h3>No assignments found</h3>
            <p>
              {userRole === 'admin' 
                ? 'Create assignments in the Role Management section.'
                : 'You have no course assignments at this time.'}
            </p>
          </div>
        ) : (
          <div className="assignments-grid">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="assignment-card">
                <div className="assignment-header">
                  <h3>{assignment.courseCode}</h3>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(assignment.status) }}
                  >
                    {assignment.status.replace(/-/g, ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="assignment-details">
                  <h4>{assignment.courseName}</h4>
                  <p className="assignment-description">{assignment.description}</p>
                  
                  <div className="assignment-roles">
                    <div className="role-info">
                      <strong>Initiator:</strong> {assignment.assignedToInitiator?.name} ({assignment.assignedToInitiator?.email})
                    </div>
                    <div className="role-info">
                      <strong>Reviewer:</strong> {assignment.assignedToReviewer?.name} ({assignment.assignedToReviewer?.email})
                    </div>
                  </div>
                  
                  <div className="assignment-deadline" style={{
                    color: isOverdue(assignment.deadline) ? '#dc3545' : 
                           isDeadlineNear(assignment.deadline) ? '#ffc107' : '#D5AB5D'
                  }}>
                    <strong>Deadline:</strong> {formatDate(assignment.deadline)}
                    {isOverdue(assignment.deadline) && <span className="overdue"> (OVERDUE)</span>}
                    {isDeadlineNear(assignment.deadline) && !isOverdue(assignment.deadline) && <span className="due-soon"> (DUE SOON)</span>}
                  </div>
                </div>

                {/* File Upload Section - Only for initiators */}
                {canUploadFile(assignment) && (
                  <div className="upload-section">
                    <h4>Upload Course Document</h4>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={(e) => handleFileSelect(assignment._id, e.target.files[0])}
                        disabled={uploadingAssignmentId === assignment._id}
                      />
                      <button
                        className="upload-btn"
                        onClick={() => handleFileUpload(assignment._id)}
                        disabled={!selectedFiles[assignment._id] || uploadingAssignmentId === assignment._id}
                      >
                        {uploadingAssignmentId === assignment._id ? 'Uploading...' : 'Upload Document'}
                      </button>
                    </div>
                    {uploadStatus[assignment._id] && (
                      <div className={`upload-status ${uploadStatus[assignment._id].toLowerCase()}`}>
                        {uploadStatus[assignment._id]}
                      </div>
                    )}
                  </div>
                )}

                {/* Review Section - Only for reviewers */}
                {canReview(assignment) && (
                  <div className="review-section">
                    <h4>Review Document</h4>
                    <p>Document has been uploaded and is ready for review.</p>
                    <div className="review-actions">
                      <button className="review-btn approve">Approve</button>
                      <button className="review-btn reject">Request Changes</button>
                    </div>
                  </div>
                )}

                {/* View Only Section - For completed assignments */}
                {assignment.status === 'completed' && (
                  <div className="completed-section">
                    <h4>✅ Assignment Completed</h4>
                    <p>Document has been approved and the assignment is complete.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachingAndLearning;
