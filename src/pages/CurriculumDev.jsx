import React from "react";
import { useNavigate } from "react-router-dom";
import "./CurriculumDev.css";

const CurriculumDev = () => {
  const navigate = useNavigate();

  const handleProgramClick = (program) => {
    navigate(`/program?name=${program}`);
  };

  return (
    <div className="curriculum-dev-container">
      <h1 className="curriculum-dev-main-heading">Curriculum </h1>

      <div className="curriculum-dev-about-section">
        <h2 className="curriculum-dev-subheading">About curriculum </h2>
        <p className="curriculum-dev-about-text">
          Curriculum development is a dynamic process that involves the design, implementation, and evaluation of educational programs. It ensures that the content, teaching methods, and assessments are aligned with the latest academic standards and industry requirements. Through continuous improvement, curriculum development aims to provide students with relevant knowledge, practical skills, and critical thinking abilities to succeed in their chosen fields. Collaboration among faculty, industry experts, and stakeholders is essential to create a curriculum that meets the evolving needs of society and prepares graduates for future challenges.
        </p>
      </div>

      <div className="curriculum-dev-columns">
        <div className="curriculum-dev-column">
          <div className="curriculum-dev-image-placeholder">UG Image</div>
          <div className="curriculum-dev-btn-group">
            <button className="curriculum-dev-nav-btn" onClick={() => handleProgramClick("BTECH")}>BTECH</button>
            <button className="curriculum-dev-nav-btn" onClick={() => handleProgramClick("BCA")}>BCA</button>
            <button className="curriculum-dev-nav-btn" onClick={() => handleProgramClick("BSC")}>BSC</button>
          </div>
        </div>
        <div className="curriculum-dev-column">
          <div className="curriculum-dev-image-placeholder">PG Image</div>
          <div className="curriculum-dev-btn-group">
            <button className="curriculum-dev-nav-btn" onClick={() => handleProgramClick("MTECH")}>MTECH</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumDev;
