import React, { useContext } from "react";
import "./Dashboard.css";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext) || {};
  if (!user) return null;

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
      <div className="dashboard-criteria-heading">Criteras</div>

      {/* Criteria Grid - 4 cards */}
      <div className="dashboard-criteria-grid">
        <div className="criteria-card">
          <button className="criteria-black-btn">CD</button>
          <div className="criteria-label">curriculum development</div>
        </div>
        <div className="criteria-card">
          <button className="criteria-black-btn"></button>
          <div className="criteria-label">teaching and learning,</div>
        </div>
        <div className="criteria-card">
          <button className="criteria-black-btn"></button>
          <div className="criteria-label">Research</div>
        </div>
        <div className="criteria-card">
          <button className="criteria-black-btn"></button>
          <div className="criteria-label">infrastructure and learning,</div>
        </div>
      </div>
      {/* Criteria Grid - 3 cards, styled like top cards */}
      <div className="dashboard-criteria-grid bottom-row">
        <div className="dashboard-card criteria-bottom-card">
          <div className="dashboard-image-placeholder">{/* Image here */}</div>
          <button className="criteria-black-btn"></button>
          <div className="dashboard-card-title">student support and progression</div>
        </div>
        <div className="dashboard-card criteria-bottom-card">
          <div className="dashboard-image-placeholder">{/* Image here */}</div>
          <button className="criteria-black-btn"></button>
          <div className="dashboard-card-title">governance leadership and management</div>
        </div>
        <div className="dashboard-card criteria-bottom-card">
          <div className="dashboard-image-placeholder">{/* Image here */}</div>
          <button className="criteria-black-btn"></button>
          <div className="dashboard-card-title">institutional values and best practices</div>
        </div>
      </div>
    </div>
  );
}
