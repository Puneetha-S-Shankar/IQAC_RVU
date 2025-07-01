import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./Dashboard.css"; // Optional

export default function Dashboard() {
  const [showProgrammes, setShowProgrammes] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Dropzone logic for each programme (hooks always called in same order)
  const onDropBTech = useCallback((acceptedFiles) => {
    console.log("Uploading for BTech:", acceptedFiles);
    // TODO: send to backend
  }, []);
  const {
    getRootProps: getRootPropsBTech,
    getInputProps: getInputPropsBTech,
    isDragActive: isDragActiveBTech,
    open: openBTech,
  } = useDropzone({ onDrop: onDropBTech, noClick: true });

  const onDropBSc = useCallback((acceptedFiles) => {
    console.log("Uploading for BSc:", acceptedFiles);
    // TODO: send to backend
  }, []);
  const {
    getRootProps: getRootPropsBSc,
    getInputProps: getInputPropsBSc,
    isDragActive: isDragActiveBSc,
    open: openBSc,
  } = useDropzone({ onDrop: onDropBSc, noClick: true });

  const onDropBCA = useCallback((acceptedFiles) => {
    console.log("Uploading for BCA:", acceptedFiles);
    // TODO: send to backend
  }, []);
  const {
    getRootProps: getRootPropsBCA,
    getInputProps: getInputPropsBCA,
    isDragActive: isDragActiveBCA,
    open: openBCA,
  } = useDropzone({ onDrop: onDropBCA, noClick: true });

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
        >
          <span
            style={{ display: "block", cursor: "pointer" }}
            onClick={() => setShowProgrammes(!showProgrammes)}
          >
            Curriculum Development
          </span>
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
                  <div {...getRootPropsBTech()} style={{ cursor: "pointer", marginBottom: 8, border: '1px dashed #FFD700', padding: 8 }}>
                    <input {...getInputPropsBTech()} />
                    <div onClick={(e) => { e.stopPropagation(); openBTech(); }}>
                      {isDragActiveBTech ? (
                        <span>Drop file here ...</span>
                      ) : (
                        <span>BTech – Upload (Click or Drag)</span>
                      )}
                    </div>
                  </div>
                  <div {...getRootPropsBSc()} style={{ cursor: "pointer", marginBottom: 8, border: '1px dashed #FFD700', padding: 8 }}>
                    <input {...getInputPropsBSc()} />
                    <div onClick={(e) => { e.stopPropagation(); openBSc(); }}>
                      {isDragActiveBSc ? (
                        <span>Drop file here ...</span>
                      ) : (
                        <span>BSc – Upload (Click or Drag)</span>
                      )}
                    </div>
                  </div>
                  <div {...getRootPropsBCA()} style={{ cursor: "pointer", marginBottom: 8, border: '1px dashed #FFD700', padding: 8 }}>
                    <input {...getInputPropsBCA()} />
                    <div onClick={(e) => { e.stopPropagation(); openBCA(); }}>
                      {isDragActiveBCA ? (
                        <span>Drop file here ...</span>
                      ) : (
                        <span>BCA – Upload (Click or Drag)</span>
                      )}
                    </div>
                  </div>
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
