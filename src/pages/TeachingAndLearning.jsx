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
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentModalData, setCommentModalData] = useState({ assignmentId: null, action: null });
  const [reviewComment, setReviewComment] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState('');

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

  // No access restriction - allow all authenticated users
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.email) {
      fetchUserAssignments();
    }
  }, [isAuthenticated, currentUser]);

  const fetchUserAssignments = async () => {
    try {
      // Use different endpoints based on user role
      const endpoint = userRole === 'admin' 
        ? `http://localhost:5000/api/assignments/assignments`
        : `http://localhost:5000/api/assignments/assignments/my-tasks`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const assignments = await response.json();
        setAssignments(assignments);
      } else {
        const errorData = await response.json();
        showMessage(errorData.error || 'Failed to fetch assignments', 'error');
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

  // Helper functions for workflow
  const canUploadFile = (assignment) => {
    if (!currentUser || !assignment) return false;
    
    // Check if user is the initiator
    const isInitiator = assignment.assignedToInitiator?.email === currentUser.email;
    
    // Check if assignment is in correct status
    const canUpload = assignment.status === 'assigned';
    
    // Check if deadline hasn't passed
    const notOverdue = !isOverdue(assignment.deadline);
    
    return isInitiator && canUpload && notOverdue;
  };

  const canReview = (assignment) => {
    if (!currentUser || !assignment) return false;
    
    // Check if user is the reviewer
    const isReviewer = assignment.assignedToReviewer?.email === currentUser.email;
    
    // Check if assignment has file uploaded and ready for review
    const hasFileForReview = assignment.status === 'file-uploaded';
    
    // Check if deadline hasn't passed
    const notOverdue = !isOverdue(assignment.deadline);
    
    return isReviewer && hasFileForReview && notOverdue;
  };

  const canAdminApprove = (assignment) => {
    if (!currentUser || !assignment) return false;
    
    // Check if user is admin
    const isAdmin = currentUser.role === 'admin';
    
    // Check if assignment is approved by reviewer
    const reviewerApproved = assignment.status === 'approved-by-reviewer';
    
    return isAdmin && reviewerApproved;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'assigned': 'Awaiting Upload',
      'file-uploaded': 'Under Review',
      'approved-by-reviewer': 'Awaiting Admin Approval',
      'approved-by-admin': 'Completed',
      'rejected': 'Rejected - Needs Resubmission',
      'completed': 'Published'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'assigned': '#6c757d',           // Gray - waiting
      'file-uploaded': '#007bff',      // Blue - in progress  
      'approved-by-reviewer': '#ffc107', // Yellow - pending admin
      'approved-by-admin': '#28a745',  // Green - approved
      'rejected': '#dc3545',           // Red - rejected
      'completed': '#28a745'           // Green - completed
    };
    return colorMap[status] || '#6c757d';
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

  const handleReview = async (assignmentId, action, comment = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/assignments/${assignmentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action,
          comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Assignment ${action}d successfully!`, 'success');
        await fetchUserAssignments(); // Refresh assignments
        setShowCommentModal(false);
        setReviewComment('');
      } else {
        showMessage(data.error || `Failed to ${action} assignment`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing assignment:`, error);
      showMessage(`Error ${action}ing assignment`, 'error');
    }
  };

  const openCommentModal = (assignmentId, action) => {
    setCommentModalData({ assignmentId, action });
    setReviewComment('');
    setShowCommentModal(true);
  };

  const handleCommentSubmit = () => {
    if (commentModalData.action === 'reject' && !reviewComment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    handleReview(commentModalData.assignmentId, commentModalData.action, reviewComment);
  };

  const handlePreviewDocument = (assignment) => {
    if (assignment.fileId) {
      setPreviewFileUrl(`http://localhost:5000/api/files/${assignment.fileId}/download`);
      setShowPreviewModal(true);
    }
  };

  const handleAdminApprove = async (assignmentId, comment = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/assignments/${assignmentId}/admin-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ comment })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Assignment approved by admin and completed!', 'success');
        await fetchUserAssignments(); // Refresh assignments
      } else {
        showMessage(data.error || 'Failed to approve assignment', 'error');
      }
    } catch (error) {
      console.error('Error approving assignment:', error);
      showMessage('Error approving assignment', 'error');
    }
  };

  const handleAdminApproval = async (assignmentId) => {
    await handleAdminApprove(assignmentId, '');
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
                  <div className="header-actions">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(assignment.status) }}
                    >
                      {getStatusDisplay(assignment.status)}
                    </span>
                  </div>
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
                    
                    {/* Preview Button */}
                    {assignment.fileId && (
                      <div className="preview-section">
                        <button 
                          className="preview-btn"
                          onClick={() => handlePreviewDocument(assignment)}
                        >
                          📄 Preview Document
                        </button>
                      </div>
                    )}
                    
                    <div className="review-actions">
                      <button 
                        className="review-btn approve"
                        onClick={() => openCommentModal(assignment._id, 'approve')}
                      >
                        Approve
                      </button>
                      <button 
                        className="review-btn reject"
                        onClick={() => openCommentModal(assignment._id, 'reject')}
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Approval Section - Only for admins on reviewer-approved assignments */}
                {canAdminApprove(assignment) && (
                  <div className="admin-approval-section">
                    <h4>Admin Final Approval</h4>
                    <p>Document has been approved by reviewer and needs admin approval to complete.</p>
                    <div className="admin-actions">
                      <button 
                        className="review-btn approve"
                        onClick={() => handleAdminApproval(assignment._id)}
                      >
                        Final Approve & Publish
                      </button>
                    </div>
                  </div>
                )}

                {/* Assignment Information */}
                <div className="assignment-info">
                  {assignment.status === 'assigned' && !canUploadFile(assignment) && (
                    <div className="status-message">
                      {assignment.assignedToInitiator?.email === currentUser?.email 
                        ? 'Awaiting your file upload'
                        : 'Awaiting initiator file upload'
                      }
                    </div>
                  )}
                  
                  {assignment.status === 'file-uploaded' && !canReview(assignment) && (
                    <div className="status-message">
                      {assignment.assignedToReviewer?.email === currentUser?.email 
                        ? 'Ready for your review'
                        : 'Document under review'
                      }
                      {assignment.fileId && (
                        <button 
                          className="preview-btn small"
                          onClick={() => handlePreviewDocument(assignment)}
                        >
                          📄 View Document
                        </button>
                      )}
                    </div>
                  )}
                  
                  {assignment.status === 'rejected' && (
                    <div className="status-message rejection">
                      Document rejected. Reason: {assignment.rejectionReason || 'No reason provided'}
                    </div>
                  )}
                  
                  {assignment.status === 'completed' && (
                    <div className="status-message completed">
                      Document completed and published for course {assignment.courseCode}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{commentModalData.action === 'approve' ? 'Approve Document' : 'Request Changes'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCommentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <label>
                {commentModalData.action === 'approve' ? 'Approval Comment (Optional):' : 'Reason for Rejection:'}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  commentModalData.action === 'approve' 
                    ? 'Add any comments about the approval...'
                    : 'Please explain what needs to be changed...'
                }
                rows={4}
                required={commentModalData.action === 'reject'}
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`btn ${commentModalData.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleCommentSubmit}
              >
                {commentModalData.action === 'approve' ? 'Approve Document' : 'Request Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Document Preview</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPreviewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body preview-body">
              <iframe
                src={previewFileUrl}
                width="100%"
                height="600px"
                style={{ border: 'none', borderRadius: '4px' }}
                title="Document Preview"
              />
            </div>
            <div className="modal-footer">
              <a 
                href={previewFileUrl}
                download
                className="btn btn-secondary"
              >
                📥 Download
              </a>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachingAndLearning;
