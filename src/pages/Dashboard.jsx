import React, { useState } from "react";
import "./Dashboard.css"; // Optional

export default function Dashboard() {
  const [showProgrammes, setShowProgrammes] = useState(false);
  const [showCourses, setShowCourses] = useState(false);

  const handleUpload = (programme) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*";
    input.click();
  };

  const pageStyle = {
    backgroundColor: "#001730",
    minHeight: "100vh",
    width: "100vw",
    padding: "2rem 4rem",
    margin: "0",
    boxSizing: "border-box",
    color: "white",
  };

  const headingStyle = {
    fontSize: "2.8rem",
    textAlign: "center",
    color: "#FFD700",
    marginBottom: "3rem",
    letterSpacing: "1px",
  };

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "2rem",
    width: "100%",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    backgroundColor: "#003366",
    color: "#FFD700",
    border: "2px solid #FFD700",
    padding: "1.5rem",
    fontSize: "1rem",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center",
    minHeight: "120px",
  };

  const buttonHoverStyle = {
    backgroundColor: "#FFD700",
    color: "#001730",
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div style={pageStyle}>
      <h1 style={headingStyle}>Criteria</h1>

      <div style={rowStyle}>
        <div
          style={{
            ...buttonStyle,
            ...(hoveredIndex === 0 ? buttonHoverStyle : {}),
          }}
          onMouseEnter={() => setHoveredIndex(0)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setShowProgrammes(!showProgrammes)}
        >
          Curriculum Development
          {showProgrammes && (
            <div style={{ marginTop: "1rem", color: "#fff" }}>
              <div
                onClick={() => setShowCourses(!showCourses)}
                style={{ cursor: "pointer" }}
              >
                Programmes
              </div>
              {showCourses && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div onClick={() => handleUpload("BTech")}>BTech – Upload</div>
                  <div onClick={() => handleUpload("BSc")}>BSc – Upload</div>
                  <div onClick={() => handleUpload("BCA")}>BCA – Upload</div>
                </div>
              )}
            </div>
          )}
        </div>

        {[
          "Faculty",
          "Events",
          "Workshops",
          "Publication",
          "Accreditation",
          "Feedback",
        ].map((label, index) => (
          <div
            key={index + 1}
            style={{
              ...buttonStyle,
              ...(hoveredIndex === index + 1 ? buttonHoverStyle : {}),
            }}
            onMouseEnter={() => setHoveredIndex(index + 1)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
