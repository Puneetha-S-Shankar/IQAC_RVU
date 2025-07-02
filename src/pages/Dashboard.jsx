import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { AuthContext } from "../context/AuthContext";

const criteria = [
  "curriculum development",
  "teaching and learning,",
  "Research",
  "infrastructure and learning,",
  "student support and progression",
  "governance leadership and management",
  "institutional values and best practices",
];

export default function Dashboard() {
  const navigate = useNavigate();
  // const { user } = useContext(AuthContext) || {};
  // if (!user) return null;

  const handleCurriculumClick = () => {
    navigate("/curriculum");
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
        {criteria.slice(0, 4).map((label) => (
          <div
            key={label}
            className="dashboard-card criteria-animated-btn"
            tabIndex={0}
            onClick={label.toLowerCase().includes("curriculum") ? handleCurriculumClick : undefined}
            style={{ cursor: label.toLowerCase().includes("curriculum") ? "pointer" : "default" }}
          >
            <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
            <div className="dashboard-card-title" style={{ marginTop: 0 }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="criteria-flex-row criteria-flex-row-bottom">
        {criteria.slice(4).map((label) => (
          <div
            key={label}
            className="dashboard-card criteria-animated-btn"
            tabIndex={0}
            onClick={label.toLowerCase().includes("curriculum") ? handleCurriculumClick : undefined}
            style={{ cursor: label.toLowerCase().includes("curriculum") ? "pointer" : "default" }}
          >
            <div className="dashboard-image-placeholder">{/* Optionally add icon/image */}</div>
            <div className="dashboard-card-title" style={{ marginTop: 0 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
