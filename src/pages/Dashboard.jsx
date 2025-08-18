import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { AuthContext } from "../context/AuthContext";
import { 
  FaBullseye, 
  FaBook, 
  FaGraduationCap, 
  FaCog,
  FaBookOpen,
  FaChalkboardTeacher,
  FaMicroscope,
  FaBuilding,
  FaUsers,
  FaUniversity,
  FaStar
} from "react-icons/fa";

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
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaBullseye style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">MISSION</div>
              <div className="placeholder-subtext">Excellence in Education</div>
            </div>
          </div>
          <div className="dashboard-card-title">Socse Mission and Vision</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaBook style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">OUTCOMES</div>
              <div className="placeholder-subtext">Student Success</div>
            </div>
          </div>
          <div className="dashboard-card-title">Program Outcomes</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaGraduationCap style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">OBJECTIVES</div>
              <div className="placeholder-subtext">Academic Goals</div>
            </div>
          </div>
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
              <div className="placeholder-content">
                <div className="placeholder-icon">
                  <FaCog style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
                </div>
                <div className="placeholder-text">ADMIN</div>
                <div className="placeholder-subtext">Role Control</div>
              </div>
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
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaBookOpen style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">CURRICULUM</div>
              <div className="placeholder-subtext">Course Design</div>
            </div>
          </div>
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
            <div className="dashboard-image-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">
                  <FaChalkboardTeacher style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
                </div>
                <div className="placeholder-text">TEACHING</div>
                <div className="placeholder-subtext">Learning Methods</div>
              </div>
            </div>
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
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaMicroscope style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">RESEARCH</div>
              <div className="placeholder-subtext">Innovation</div>
            </div>
          </div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[2]}</div>
        </div>
        <div
          key={criteria[3]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={undefined}
          style={{ cursor: "default" }}
        >
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaBuilding style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">INFRASTRUCTURE</div>
              <div className="placeholder-subtext">Facilities</div>
            </div>
          </div>
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
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaUsers style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">STUDENT SUPPORT</div>
              <div className="placeholder-subtext">Guidance</div>
            </div>
          </div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[4]}</div>
        </div>
        <div
          key={criteria[5]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={undefined}
          style={{ cursor: "default" }}
        >
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaUniversity style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">GOVERNANCE</div>
              <div className="placeholder-subtext">Leadership</div>
            </div>
          </div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[5]}</div>
        </div>
        <div
          key={criteria[6]}
          className="dashboard-card criteria-animated-btn"
          tabIndex={0}
          onClick={undefined}
          style={{ cursor: "default" }}
        >
          <div className="dashboard-image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <FaStar style={{ color: '#D5AB5D', fontSize: '2.5rem' }} />
              </div>
              <div className="placeholder-text">VALUES</div>
              <div className="placeholder-subtext">Best Practices</div>
            </div>
          </div>
          <div className="dashboard-card-title" style={{ marginTop: 0 }}>{criteria[6]}</div>
        </div>
      </div>
    </div>
  );
}