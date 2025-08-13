import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  COURSE_MAP, 
  getCourseNameByCode, 
  getCourseCodeByName, 
  getAllCourses, 
  isValidCourseCode,
  isValidCourseName 
} from '../utils/courseMapping';
import './Roles.css';

const Roles = () => {
  const { user, getToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assignments');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Assignment form state (Simplified for Dynamic Users)
  const [assignmentForm, setAssignmentForm] = useState({
    assignmentType: '',
    description: '',
    deadline: ''
  });

  // User creation form state
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    courseCode: '',
    courseName: ''
  });

  // Data state (Simplified for Dynamic Assignment)
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedInitiators, setSelectedInitiators] = useState([]);   // Dynamic initiators list
  const [selectedReviewers, setSelectedReviewers] = useState([]);     // Dynamic reviewers list

  // Edit assignment modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Assignment types
  const assignmentTypes = [
    'Course Document 1',
    'Course Document 2', 
    'Course Document 3',
    'Course Document 4'
  ];

  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    await Promise.all([fetchAssignments(), fetchUsers()]);
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        showMessage('Failed to fetch assignments', 'error');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showMessage('Error fetching assignments', 'error');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched users data:', data); // Debug log
        console.log('Data type:', typeof data); // Debug log
        console.log('Is array:', Array.isArray(data)); // Debug log
        
        // Handle both direct array and wrapped object formats
        let usersArray;
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (data && Array.isArray(data.users)) {
          usersArray = data.users;
        } else {
          console.error('Users data is not in expected format:', data);
          setUsers([]);
          showMessage('Invalid users data format', 'error');
          setLoading(false);
          return;
        }
        
        console.log('Final users array:', usersArray);
        
        // Enhance users with course information
        const enhancedUsers = usersArray.map(user => ({
          ...user,
          courseCode: user.courseIds?.[0] || '',
          courseName: user.courseIds?.[0] ? getCourseNameByCode(user.courseIds[0]) : ''
        }));
        
        setUsers(enhancedUsers);
      } else if (response.status === 401) {
        console.error('Authentication failed - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch users:', response.status, errorData);
        setUsers([]);
        showMessage('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      showMessage('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Course code/name handlers
  const handleCourseCodeChange = (e) => {
    const courseCode = e.target.value;
    
    setUserForm({
      ...userForm, 
      courseCode,
      // Don't auto-fill course name
    });
  };

  const handleCourseNameChange = (e) => {
    const courseName = e.target.value;
    
    setUserForm({
      ...userForm, 
      courseName
      // Don't auto-fill course code
    });
  };

  // Edit assignment functions (Enhanced for Multiple Users)
  const handleEditAssignment = (assignment) => {
    // Extract all initiators and reviewers (both array and legacy format)
    const allInitiators = [];
    const allReviewers = [];
    
    if (assignment.assignedToInitiators && assignment.assignedToInitiators.length > 0) {
      allInitiators.push(...assignment.assignedToInitiators);
    }
    if (assignment.assignedToInitiator && 
        !allInitiators.some(init => init._id === assignment.assignedToInitiator._id)) {
      allInitiators.push(assignment.assignedToInitiator);
    }
    
    if (assignment.assignedToReviewers && assignment.assignedToReviewers.length > 0) {
      allReviewers.push(...assignment.assignedToReviewers);
    }
    if (assignment.assignedToReviewer && 
        !allReviewers.some(rev => rev._id === assignment.assignedToReviewer._id)) {
      allReviewers.push(assignment.assignedToReviewer);
    }

    setEditingAssignment({
      ...assignment,
      allInitiators,
      allReviewers,
      deadline: new Date(assignment.deadline).toISOString().split('T')[0] // Format for date input
    });
    setShowEditModal(true);
  };

  const handleUpdateAssignment = async () => {
    try {
      // Validation for multiple users
      if (!editingAssignment.allInitiators || !editingAssignment.allReviewers ||
          editingAssignment.allInitiators.length === 0 || editingAssignment.allReviewers.length === 0) {
        showMessage('Assignment must have at least one initiator and one reviewer', 'error');
        return;
      }

      // Check for user overlap
      const initiatorIds = editingAssignment.allInitiators.map(user => user._id);
      const reviewerIds = editingAssignment.allReviewers.map(user => user._id);
      const hasOverlap = initiatorIds.some(id => reviewerIds.includes(id));
      
      if (hasOverlap) {
        showMessage('Users cannot be both initiator and reviewer for the same task', 'error');
        return;
      }

      const updateData = {
        deadline: editingAssignment.deadline,
        courseCode: editingAssignment.courseCode,
        courseName: editingAssignment.courseName
      };

      // Set assignment data based on number of users
      if (editingAssignment.allInitiators.length === 1) {
        updateData.assignedToInitiator = editingAssignment.allInitiators[0]._id;
        updateData.assignedToInitiators = [editingAssignment.allInitiators[0]._id];
      } else {
        updateData.assignedToInitiators = editingAssignment.allInitiators.map(user => user._id);
        updateData.assignedToInitiator = null; // Clear legacy field for multiple users
      }

      if (editingAssignment.allReviewers.length === 1) {
        updateData.assignedToReviewer = editingAssignment.allReviewers[0]._id;
        updateData.assignedToReviewers = [editingAssignment.allReviewers[0]._id];
      } else {
        updateData.assignedToReviewers = editingAssignment.allReviewers.map(user => user._id);
        updateData.assignedToReviewer = null; // Clear legacy field for multiple users
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${editingAssignment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        showMessage('Assignment updated successfully!', 'success');
        setShowEditModal(false);
        await fetchAssignments();
      } else {
        const errorData = await response.json();
        showMessage(errorData.error || 'Failed to update assignment', 'error');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      showMessage('Error updating assignment', 'error');
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (loading) {
      return;
    }
    
    setLoading(true);

    // Validation - Must have at least one initiator and one reviewer
    if (!selectedInitiators.length || !selectedReviewers.length) {
      showMessage('Please select at least one initiator and one reviewer', 'error');
      setLoading(false);
      return;
    }

    // Check for overlapping users
    const initiatorIds = selectedInitiators.map(user => user._id);
    const reviewerIds = selectedReviewers.map(user => user._id);
    const hasOverlap = initiatorIds.some(id => reviewerIds.includes(id));
    
    if (hasOverlap) {
      showMessage('Users cannot be both initiator and reviewer for the same task', 'error');
      setLoading(false);
      return;
    }

    // Check for duplicate assignments
    const duplicateAssignment = assignments.find(assignment => {
      const existingInitiators = assignment.assignedToInitiators || (assignment.assignedToInitiator ? [assignment.assignedToInitiator] : []);
      const existingReviewers = assignment.assignedToReviewers || (assignment.assignedToReviewer ? [assignment.assignedToReviewer] : []);
      
      return assignment.assignmentType === assignmentForm.assignmentType &&
             assignment.courseCode === selectedInitiators[0]?.courseCode &&
             assignment.deadline === assignmentForm.deadline &&
             existingInitiators.some(init => selectedInitiators.some(sel => sel._id === init._id)) &&
             existingReviewers.some(rev => selectedReviewers.some(sel => sel._id === rev._id));
    });

    if (duplicateAssignment) {
      showMessage('A similar assignment already exists for these users', 'error');
      setLoading(false);
      return;
    }

    try {
      // Get course information from the first initiator
      const firstInitiator = selectedInitiators[0];
      let courseCode = '';
      let courseName = '';
      
      if (firstInitiator) {
        // Try to get courseCode from different possible sources
        if (firstInitiator.courseIds && firstInitiator.courseIds.length > 0) {
          courseCode = firstInitiator.courseIds[0];
        } else if (firstInitiator.courseCode) {
          courseCode = firstInitiator.courseCode;
        }
        
        // Get course name from course code
        if (courseCode) {
          courseName = getCourseNameByCode(courseCode);
        }
      }
      
      // If no course information available, use assignment type as fallback
      if (!courseCode) {
        courseCode = 'GENERAL';
        courseName = assignmentForm.assignmentType || 'General Assignment';
      }
      
      const assignmentData = {
        assignmentType: assignmentForm.assignmentType,
        description: assignmentForm.description,
        deadline: assignmentForm.deadline,
        courseCode: courseCode,
        courseName: courseName
      };

      // Always use array format for consistency
      if (selectedInitiators.length === 1) {
        // Single initiator - use both formats for backward compatibility
        assignmentData.assignedToInitiator = selectedInitiators[0]._id;
        assignmentData.assignedToInitiators = [selectedInitiators[0]._id];
      } else {
        // Multiple initiators - use array format only
        assignmentData.assignedToInitiators = selectedInitiators.map(user => user._id);
      }

      if (selectedReviewers.length === 1) {
        // Single reviewer - use both formats for backward compatibility
        assignmentData.assignedToReviewer = selectedReviewers[0]._id;
        assignmentData.assignedToReviewers = [selectedReviewers[0]._id];
      } else {
        // Multiple reviewers - use array format only
        assignmentData.assignedToReviewers = selectedReviewers.map(user => user._id);
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(assignmentData)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Assignment created successfully!', 'success');
        setAssignmentForm({
          assignmentType: '',
          description: '',
          deadline: ''
        });
        setSelectedInitiators([]);
        setSelectedReviewers([]);
        await fetchAssignments();
        await fetchUsers();
      } else {
        showMessage(data.error || 'Failed to create assignment', 'error');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      if (error.message === 'Failed to fetch' || error.name === 'NetworkError') {
        showMessage('Network error: Unable to connect to server. Please check your connection and try again.', 'error');
      } else {
        showMessage('Error creating assignment. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(userForm)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('User created successfully!', 'success');
        setUserForm({
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'user',
          courseCode: '',
          courseName: ''
        });
        await fetchUsers();
      } else {
        showMessage(data.error || 'Failed to create user', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showMessage('Error creating user', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for multiple user selection
  const addInitiator = (user) => {
    if (!selectedInitiators.find(u => u._id === user._id)) {
      setSelectedInitiators([...selectedInitiators, user]);
    }
  };

  const removeInitiator = (userId) => {
    setSelectedInitiators(selectedInitiators.filter(u => u._id !== userId));
  };

  const addReviewer = (user) => {
    if (!selectedReviewers.find(u => u._id === user._id)) {
      setSelectedReviewers([...selectedReviewers, user]);
    }
  };

  const removeReviewer = (userId) => {
    setSelectedReviewers(selectedReviewers.filter(u => u._id !== userId));
  };

  const clearAllSelections = () => {
    setSelectedInitiators([]);
    setSelectedReviewers([]);
    setAssignmentForm({
      assignmentType: '',
      description: '',
      deadline: ''
    });
  };

  // Helper functions for edit modal
  const addInitiatorToEdit = (user) => {
    if (!editingAssignment.allInitiators.find(u => u._id === user._id)) {
      setEditingAssignment({
        ...editingAssignment,
        allInitiators: [...editingAssignment.allInitiators, user]
      });
    }
  };

  const removeInitiatorFromEdit = (userId) => {
    setEditingAssignment({
      ...editingAssignment,
      allInitiators: editingAssignment.allInitiators.filter(u => u._id !== userId)
    });
  };

  const addReviewerToEdit = (user) => {
    if (!editingAssignment.allReviewers.find(u => u._id === user._id)) {
      setEditingAssignment({
        ...editingAssignment,
        allReviewers: [...editingAssignment.allReviewers, user]
      });
    }
  };

  const removeReviewerFromEdit = (userId) => {
    setEditingAssignment({
      ...editingAssignment,
      allReviewers: editingAssignment.allReviewers.filter(u => u._id !== userId)
    });
  };

  const handleUserRoleUpdate = async (userId, field, value) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ [field]: value })
      });

      if (response.ok) {
        showMessage('User updated successfully!', 'success');
        await fetchUsers();
      } else {
        const data = await response.json();
        showMessage(data.error || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showMessage('Error updating user', 'error');
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

  const renderAssignments = () => {
    console.log('renderAssignments - users:', users); // Debug log
    console.log('renderAssignments - users type:', typeof users); // Debug log
    console.log('renderAssignments - users is array:', Array.isArray(users)); // Debug log
    
    // Ensure users is always an array
    const safeUsers = Array.isArray(users) ? users : [];
    const nonAdminUsers = safeUsers.filter(u => u && u.role !== 'admin' && u.role !== 'viewer');
    
    console.log('renderAssignments - nonAdminUsers:', nonAdminUsers); // Debug log
    
    return (
      <div className="roles-content">
        <h2>Create New Assignment</h2>
        
        {message.text && (
          <div className={`roles-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="assignment-form" onSubmit={handleAssignmentSubmit}>
          <div className="form-row">
            {/* Initiators Section */}
            <div className="form-group dynamic-user-group">
              <label>Select Initiators 👤</label>
              
              {/* Add Initiator Dropdown */}
              <select
                onChange={(e) => {
                  const userId = e.target.value;
                  if (userId) {
                    const selectedUser = nonAdminUsers.find(u => u._id === userId);
                    addInitiator(selectedUser);
                    e.target.value = ''; // Reset select
                  }
                }}
              >
                <option value="">Add an initiator...</option>
                {nonAdminUsers
                  .filter(user => !selectedInitiators.find(u => u._id === user._id))
                  .filter(user => !selectedReviewers.find(u => u._id === user._id)) // Prevent overlap
                  .map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
              </select>
              
              {/* Selected Initiators Display */}
              {selectedInitiators.length > 0 && (
                <div className="selected-users">
                  <h4>Selected Initiators ({selectedInitiators.length}):</h4>
                  {selectedInitiators.map((user, index) => (
                    <div key={user._id} className="selected-user-item">
                      <span>
                        {index + 1}. {user.firstName} {user.lastName} ({user.email})
                        <small className="user-course"> - {user.courseCode}</small>
                      </span>
                      <button
                        type="button"
                        className="remove-user-btn"
                        onClick={() => removeInitiator(user._id)}
                        title="Remove initiator"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Another Initiator Button */}
                  {selectedInitiators.length >= 1 && (
                    <div className="add-more-section">
                      <small className="add-more-hint">
                        💡 Need another initiator? Select from the dropdown above to add more team members.
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Reviewers Section */}
            <div className="form-group dynamic-user-group">
              <label>Select Reviewers �️</label>
              
              {/* Add Reviewer Dropdown */}
              <select
                onChange={(e) => {
                  const userId = e.target.value;
                  if (userId) {
                    const selectedUser = nonAdminUsers.find(u => u._id === userId);
                    addReviewer(selectedUser);
                    e.target.value = ''; // Reset select
                  }
                }}
              >
                <option value="">Add a reviewer...</option>
                {nonAdminUsers
                  .filter(user => !selectedReviewers.find(u => u._id === user._id))
                  .filter(user => !selectedInitiators.find(u => u._id === user._id)) // Prevent overlap
                  .map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
              </select>
              
              {/* Selected Reviewers Display */}
              {selectedReviewers.length > 0 && (
                <div className="selected-users">
                  <h4>Selected Reviewers ({selectedReviewers.length}):</h4>
                  {selectedReviewers.map((user, index) => (
                    <div key={user._id} className="selected-user-item">
                      <span>
                        {index + 1}. {user.firstName} {user.lastName} ({user.email})
                        <small className="user-course"> - {user.courseCode}</small>
                      </span>
                      <button
                        type="button"
                        className="remove-user-btn"
                        onClick={() => removeReviewer(user._id)}
                        title="Remove reviewer"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Another Reviewer Button */}
                  {selectedReviewers.length >= 1 && (
                    <div className="add-more-section">
                      <small className="add-more-hint">
                        💡 Need another reviewer? Select from the dropdown above to add more team members.
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Clear All Button */}
          {(selectedInitiators.length > 0 || selectedReviewers.length > 0) && (
            <div className="clear-selections">
              <button 
                type="button" 
                className="clear-btn"
                onClick={clearAllSelections}
              >
                🗑️ Clear All Selections
              </button>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Assignment Type</label>
              <select
                value={assignmentForm.assignmentType}
                onChange={(e) => setAssignmentForm({...assignmentForm, assignmentType: e.target.value})}
                required
              >
                <option value="">Choose assignment type...</option>
                {assignmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                placeholder="Assignment description and instructions..."
                required
              />
            </div>
            
            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                value={assignmentForm.deadline}
                onChange={(e) => setAssignmentForm({...assignmentForm, deadline: e.target.value})}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Assignment...' : 'Create Assignment'}
          </button>
        </form>
      </div>
    );
  };

  const renderRecords = () => (
    <div className="roles-content">
      <h2>Assignment Records</h2>
      
      {assignments.length === 0 ? (
        <div className="roles-message">No assignments found</div>
      ) : (
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Initiator</th>
                <th>Reviewer</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td>
                    <div>
                      <strong>{assignment.courseCode}</strong>
                      <br />
                      <small>{assignment.courseName}</small>
                    </div>
                  </td>
                  <td>
                    {(() => {
                      // Handle multiple initiators
                      const initiators = assignment.assignedToInitiators || 
                                        (assignment.assignedToInitiator ? [assignment.assignedToInitiator] : []);
                      
                      if (initiators.length === 0) {
                        return 'Not assigned';
                      }
                      
                      if (initiators.length === 1) {
                        return (
                          <div>
                            <div>{initiators[0].firstName} {initiators[0].lastName}</div>
                            <small>{initiators[0].email}</small>
                          </div>
                        );
                      }
                      
                      return (
                        <div>
                          <div><strong>{initiators.length} Initiators:</strong></div>
                          {initiators.map((initiator, index) => (
                            <div key={initiator._id || index} style={{ marginBottom: '4px' }}>
                              <small>{initiator.firstName} {initiator.lastName} ({initiator.email})</small>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    {(() => {
                      // Handle multiple reviewers
                      const reviewers = assignment.assignedToReviewers || 
                                       (assignment.assignedToReviewer ? [assignment.assignedToReviewer] : []);
                      
                      if (reviewers.length === 0) {
                        return 'Not assigned';
                      }
                      
                      if (reviewers.length === 1) {
                        return (
                          <div>
                            <div>{reviewers[0].firstName} {reviewers[0].lastName}</div>
                            <small>{reviewers[0].email}</small>
                          </div>
                        );
                      }
                      
                      return (
                        <div>
                          <div><strong>{reviewers.length} Reviewers:</strong></div>
                          {reviewers.map((reviewer, index) => (
                            <div key={reviewer._id || index} style={{ marginBottom: '4px' }}>
                              <small>{reviewer.firstName} {reviewer.lastName} ({reviewer.email})</small>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(assignment.status) }}
                    >
                      {assignment.status.replace(/-/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{
                    color: isOverdue(assignment.deadline) ? '#dc3545' : 
                           isDeadlineNear(assignment.deadline) ? '#ffc107' : '#fff'
                  }}>
                    {formatDate(assignment.deadline)}
                    {isOverdue(assignment.deadline) && <><br /><small>OVERDUE</small></>}
                    {isDeadlineNear(assignment.deadline) && !isOverdue(assignment.deadline) && <><br /><small>DUE SOON</small></>}
                  </td>
                  <td>{formatDate(assignment.createdAt)}</td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditAssignment(assignment)}
                      title="Edit Assignment"
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUserRoles = () => (
    <div className="roles-content">
      <h2>User Role Management</h2>
      
      {users.length === 0 ? (
        <div className="roles-message">No users found</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Subrole</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleUpdate(user._id, 'role', e.target.value)}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={user.subrole || 'none'}
                      onChange={(e) => handleUserRoleUpdate(user._id, 'subrole', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="initiator">Initiator</option>
                      <option value="reviewer">Reviewer</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={user.courseCode || ''}
                      onChange={(e) => handleUserRoleUpdate(user._id, 'courseCode', e.target.value)}
                      placeholder="Course Code"
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={user.courseName || ''}
                      onChange={(e) => handleUserRoleUpdate(user._id, 'courseName', e.target.value)}
                      placeholder="Course Name"
                      style={{ width: '150px' }}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => showMessage('User updated successfully!', 'success')}
                      style={{ 
                        padding: '5px 10px', 
                        fontSize: '12px',
                        backgroundColor: '#D5AB5D',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUserCreate = () => (
    <div className="roles-content">
      <h2>Create New User</h2>
      
      {message.text && (
        <div className={`roles-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="assignment-form" onSubmit={handleUserCreate}>
        <div className="form-row">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={userForm.username}
              onChange={(e) => setUserForm({...userForm, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({...userForm, password: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({...userForm, role: e.target.value})}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <small style={{color: '#D5AB5D', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>
              Note: Viewers are for non-logged in website visitors and cannot be assigned tasks
            </small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={userForm.firstName}
              onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={userForm.lastName}
              onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Course Code *</label>
            <select
              value={userForm.courseCode}
              onChange={handleCourseCodeChange}
              required
            >
              <option value="">Select Course Code</option>
              {getAllCourses().map(course => (
                <option key={course.code} value={course.code}>
                  {course.code}
                </option>
              ))}
            </select>
            <small className="form-help">Select the course code for the user</small>
          </div>
          <div className="form-group">
            <label>Course Name</label>
            <input
              type="text"
              value={userForm.courseName}
              onChange={handleCourseNameChange}
              placeholder="Enter course name"
            />
            <small className="form-help">Auto-filled from course code selection</small>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating User...' : 'Create User'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="roles-container">
      <h1 className="roles-heading">Admin Role Management</h1>
      
      <div className="roles-tabs">
        <button 
          className={`roles-tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button 
          className={`roles-tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          Records
        </button>
        <button 
          className={`roles-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Users
        </button>
        <button 
          className={`roles-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
      </div>

      {activeTab === 'assignments' && Array.isArray(users) && renderAssignments()}
      {activeTab === 'assignments' && !Array.isArray(users) && (
        <div className="roles-content">
          <h2>Loading...</h2>
          <p>Loading user data...</p>
        </div>
      )}
      {activeTab === 'records' && renderRecords()}
      {activeTab === 'create' && renderUserCreate()}
      {activeTab === 'users' && Array.isArray(users) && renderUserRoles()}
      {activeTab === 'users' && !Array.isArray(users) && (
        <div className="roles-content">
          <h2>Loading...</h2>
          <p>Loading user data...</p>
        </div>
      )}

      {/* Assignment Edit Modal */}
      {showEditModal && editingAssignment && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Assignment</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Course Code:</label>
                <input
                  type="text"
                  value={editingAssignment.courseCode}
                  onChange={(e) => setEditingAssignment({...editingAssignment, courseCode: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Course Name:</label>
                <input
                  type="text"
                  value={editingAssignment.courseName}
                  onChange={(e) => setEditingAssignment({...editingAssignment, courseName: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Initiator:</label>
                <select
                  value={editingAssignment.assignedToInitiator}
                  onChange={(e) => setEditingAssignment({...editingAssignment, assignedToInitiator: e.target.value})}
                >
                  <option value="">Select Initiator</option>
                  {(users || []).filter(user => user.role !== 'admin').map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Reviewer:</label>
                <select
                  value={editingAssignment.assignedToReviewer}
                  onChange={(e) => setEditingAssignment({...editingAssignment, assignedToReviewer: e.target.value})}
                >
                  <option value="">Select Reviewer</option>
                  {(users || []).filter(user => user.role !== 'admin').map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Deadline:</label>
                <input
                  type="date"
                  value={editingAssignment.deadline}
                  onChange={(e) => setEditingAssignment({...editingAssignment, deadline: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateAssignment}
              >
                Update Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
