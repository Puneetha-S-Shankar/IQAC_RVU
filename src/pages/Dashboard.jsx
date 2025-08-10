import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { AuthContext } from "../context/AuthContext";

const criteria = [
  "Curriculum ",
  "Teaching and Learning",
  "Research",
  "Infrastructure and Learning",
  "Student Support and Progression",
  "Governance Leadership and Management",
  "Institutional Values and Best Practices",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: contextUser } = useContext(AuthContext);
  const [userRole, setUserRole] = useState('viewer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get user role from AuthContext or localStorage
  useEffect(() => {
    let user = null;
    let token = null;
    
    // First check AuthContext
    if (contextUser) {
      user = contextUser;
      token = 'logged-in';
    } else {
      // Fallback to localStorage
      try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
        token = localStorage.getItem('token');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    if (user && user._id && token) {
      setUserRole(user.role || 'viewer');
      setIsAuthenticated(true);
    } else {
      setUserRole('viewer');
      setIsAuthenticated(false);
    }
  }, [contextUser]);

  const handleCurriculumClick = () => {
    navigate("/curriculum");
  };

  const handleTeachingAndLearningClick = () => {
    navigate("/teaching-and-learning");
  };

  const handleRoleManagementClick = () => {
    if (userRole !== 'admin') {
      alert('Access denied. Role management is only available to administrators.');
      return;
    }
    navigate("/roles");
  };

  // Function to check if user can access restricted content
  const canAccessRestrictedContent = () => {
    return isAuthenticated && userRole !== 'viewer';
  };

  return (
    <div className="dashboard">
      {/* Top Row */}
      <div className="dashboard-top-row">
        <div className="dashboard-card">
          <div className="dashboard-image-placeholder">{/* Image here */}</div>
          <div className="dashboard-card-title">Socse Mission and Vision</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-image-placeholder">{/* Image here */}</div>
          <div className="dashboard-card-title">Program Outcomes</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-image-placeholder">{/* Image here */}</div>
          <div className="dashboard-card-title">Program Educational Objectives</div>
        </div>
        
        {/* Role Management - Only for admins */}
        {userRole === 'admin' && (
          <div className="dashboard-card">
            <div 
              className="dashboard-image-placeholder"
              onClick={handleRoleManagementClick}
              style={{ cursor: "pointer" }}
            >
              {/* Admin icon */}
            </div>
            <div 
              className="dashboard-card-title"
              onClick={handleRoleManagementClick}
              style={{ cursor: "pointer", color: "#D5AB5D" }}
            >
              Role Management
            </div>
          </div>
        )}
      </div>

      {/* Criteria Heading */}
      <div className="dashboard-criteria-heading">Criteria</div>

      {/* Criteria Cards - flexbox layout */}
      <div className="criteria-flex-row">
        <div
          key={criteria[0]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={handleCurriculumClick}
          style={{ cursor: "pointer" }}
        >
          <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[0]}</div>
        </div>
        
        {/* Teaching and Learning - Show for authenticated users */}
        {isAuthenticated && (
          <div
            key={criteria[1]}
            className="dashboard-card criteria-animated-btn"
            tabIndex={0}
            onClick={handleTeachingAndLearningClick}
            style={{ cursor: "pointer" }}
          >
            <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
            <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[1]}</div>
          </div>
        )}
        
        <div
          key={criteria[2]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={undefined}
          style={{ cursor: "default" }}
        >
          <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[2]}</div>
        </div>
        <div
          key={criteria[3]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={undefined}
          style={{ cursor: "default" }}
        >
          <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[3]}</div>
        </div>
      </div>
      <div className="criteria-flex-row criteria-flex-row-bottom">
        <div
          key={criteria[4]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={undefined}
          style={{ cursor: "default" }}
        >
          <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[4]}</div>
        </div>
        <div
          key={criteria[5]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={undefined}
          style={{ cursor: "default" }}
        >
          <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[5]}</div>
        </div>
        <div
          key={criteria[6]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={undefined}
          style={{ cursor: "default" }}
        >
          <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[6]}</div>
        </div>
      </div>
    </div>
  );
}
