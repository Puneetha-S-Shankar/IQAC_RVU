import React, { useContext } from "react";
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
  // const { user } = useContext(AuthContext) || {};
  // if (!user) return null;

  const handleCurriculumClick = () => {
    navigate("/curriculum");
  };

  const handleTeachingAndLearningClick = () => {
    navigate("/teaching-and-learning");
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
