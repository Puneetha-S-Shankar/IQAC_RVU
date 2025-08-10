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

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    initiatorId: '',
    reviewerId: '',
    assignmentType: '',
    description: ''
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

  // Data state
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedInitiator, setSelectedInitiator] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);

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
      const response = await fetch('http://localhost:5000/api/assignments/assignments', {
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
    try {
      const response = await fetch('http://localhost:5000/api/assignments/users', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        showMessage('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('Error fetching users', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Course code/name handlers
  const handleCourseCodeChange = (e) => {
    const courseCode = e.target.value;
    const courseName = getCourseNameByCode(courseCode);
    
    setUserForm({
      ...userForm, 
      courseCode,
      courseName
    });
  };

  const handleCourseNameChange = (e) => {
    const courseName = e.target.value;
    const courseCode = getCourseCodeByName(courseName);
    
    setUserForm({
      ...userForm, 
      courseCode: courseCode || userForm.courseCode, // Keep existing code if no match
      courseName
    });
  };

  // Edit assignment functions
  const handleEditAssignment = (assignment) => {
    setEditingAssignment({
      ...assignment,
      assignedToInitiator: assignment.assignedToInitiator?._id || '',
      assignedToReviewer: assignment.assignedToReviewer?._id || '',
      deadline: new Date(assignment.deadline).toISOString().split('T')[0] // Format for date input
    });
    setShowEditModal(true);
  };

  const handleUpdateAssignment = async () => {
    try {
      // Check if same person is assigned as both initiator and reviewer
      if (editingAssignment.assignedToInitiator === editingAssignment.assignedToReviewer) {
        showMessage('Initiator and reviewer cannot be the same person', 'error');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/assignments/assignments/${editingAssignment._id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          assignedToInitiator: editingAssignment.assignedToInitiator,
          assignedToReviewer: editingAssignment.assignedToReviewer,
          deadline: editingAssignment.deadline,
          courseCode: editingAssignment.courseCode,
          courseName: editingAssignment.courseName
        })
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
    setLoading(true);

    if (!selectedInitiator || !selectedReviewer) {
      showMessage('Please select both initiator and reviewer', 'error');
      setLoading(false);
      return;
    }

    if (selectedInitiator._id === selectedReviewer._id) {
      showMessage('Initiator and reviewer cannot be the same person', 'error');
      setLoading(false);
      return;
    }

    try {
      const assignmentData = {
        initiatorEmail: selectedInitiator.email,
        reviewerEmail: selectedReviewer.email,
        courseCode: selectedInitiator.courseCode,
        courseName: selectedInitiator.courseName,
        assignmentType: assignmentForm.assignmentType,
        description: assignmentForm.description
      };

      const response = await fetch('http://localhost:5000/api/assignments/assignments', {
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
          initiatorId: '',
          reviewerId: '',
          assignmentType: '',
          description: ''
        });
        setSelectedInitiator(null);
        setSelectedReviewer(null);
        await fetchAssignments();
        await fetchUsers();
      } else {
        showMessage(data.error || 'Failed to create assignment', 'error');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      showMessage('Error creating assignment', 'error');
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

  const handleUserRoleUpdate = async (userId, field, value) => {
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/users/${userId}`, {
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
    const nonAdminUsers = users.filter(u => u.role !== 'admin' && u.role !== 'viewer');
    
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
            <div className="form-group">
              <label>Select Initiator (User)</label>
              <select
                value={assignmentForm.initiatorId}
                onChange={(e) => {
                  const userId = e.target.value;
                  const selectedUser = nonAdminUsers.find(u => u._id === userId);
                  setSelectedInitiator(selectedUser);
                  setAssignmentForm({...assignmentForm, initiatorId: userId});
                }}
                required
              >
                <option value="">Choose a user...</option>
                {nonAdminUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {selectedInitiator && (
                <div className="user-details">
                  <small>
                    <strong>Subrole:</strong> {selectedInitiator.subrole || 'Not set'} | 
                    <strong> Course:</strong> {selectedInitiator.courseCode || 'Not set'} | 
                    <strong> ID:</strong> {selectedInitiator._id}
                  </small>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Select Reviewer (User)</label>
              <select
                value={assignmentForm.reviewerId}
                onChange={(e) => {
                  const userId = e.target.value;
                  const selectedUser = nonAdminUsers.find(u => u._id === userId);
                  setSelectedReviewer(selectedUser);
                  setAssignmentForm({...assignmentForm, reviewerId: userId});
                }}
                required
              >
                <option value="">Choose a reviewer...</option>
                {nonAdminUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {selectedReviewer && (
                <div className="user-details">
                  <small>
                    <strong>Subrole:</strong> {selectedReviewer.subrole || 'Not set'} | 
                    <strong> Course:</strong> {selectedReviewer.courseCode || 'Not set'} | 
                    <strong> ID:</strong> {selectedReviewer._id}
                  </small>
                </div>
              )}
            </div>
          </div>

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
                    {assignment.assignedToInitiator ? (
                      <div>
                        <div>{assignment.assignedToInitiator.name}</div>
                        <small>{assignment.assignedToInitiator.email}</small>
                      </div>
                    ) : (
                      'Not assigned'
                    )}
                  </td>
                  <td>
                    {assignment.assignedToReviewer ? (
                      <div>
                        <div>{assignment.assignedToReviewer.name}</div>
                        <small>{assignment.assignedToReviewer.email}</small>
                      </div>
                    ) : (
                      'Not assigned'
                    )}
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
              {users.map((user) => (
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
            <small className="form-help">Primary key - selecting this will auto-fill course name</small>
          </div>
          <div className="form-group">
            <label>Course Name</label>
            <input
              type="text"
              value={userForm.courseName}
              onChange={handleCourseNameChange}
              placeholder="Auto-filled when course code is selected"
              disabled={!!userForm.courseCode}
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

      {activeTab === 'assignments' && renderAssignments()}
      {activeTab === 'records' && renderRecords()}
      {activeTab === 'create' && renderUserCreate()}
      {activeTab === 'users' && renderUserRoles()}

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
                  {users.filter(user => user.role !== 'admin').map(user => (
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
                  {users.filter(user => user.role !== 'admin').map(user => (
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
