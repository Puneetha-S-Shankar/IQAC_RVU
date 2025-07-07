import React, { useState, useRef, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CurriculumDev.css";
import { AuthContext } from "../context/AuthContext";

const YEARS = [2022, 2023, 2024, 2025];
const BATCHES = ["1st year", "2nd year", "3rd year", "4th year"];
const COURSE_DOC_TYPES = [
  "Syllabus",
  "Course analysis document",
  "Internal review",
  "External review",
  "Change document",
];

function NestedDropdown({ label, docType, onSelect, role }) {
  const [year, setYear] = useState("");
  const [batch, setBatch] = useState("");
  const [doc, setDoc] = useState("");
  const [action, setAction] = useState("");

  return (
    <div className="program-nested-dropdown">
      <div className="dropdown-label">{label}</div>
      <select value={year} onChange={e => { setYear(e.target.value); setBatch(""); setDoc(""); setAction(""); }}>
        <option value="">Select Year</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      {year && (
        <select value={batch} onChange={e => { setBatch(e.target.value); setDoc(""); setAction(""); }}>
          <option value="">Select Batch</option>
          {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      )}
      {year && batch && docType && (
        <select value={doc} onChange={e => { setDoc(e.target.value); setAction(""); }}>
          <option value="">Select Document Type</option>
          {COURSE_DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
      {year && batch && (!docType || doc) && (
        <div className="dropdown-actions">
          {role === "admin" && (
            <button onClick={() => onSelect({ year, batch, doc: docType ? doc : null, action: "upload" })}>Upload</button>
          )}
          <button
            onClick={() => {
              console.log("View button clicked with:", { year, batch, doc });
              onSelect({ year, batch, doc: docType ? doc : null, action: "view" });
            }}
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}

const ProgramPage = ({ aboutTexts }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const programName = params.get("name") || "BTECH";
  const aboutText = aboutTexts[programName] || aboutTexts["BTECH"];

  const [mainView, setMainView] = useState("about");
  const [docInfo, setDocInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [viewedFile, setViewedFile] = useState(null);
  const [viewStatus, setViewStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const handleDropdownSelect = (info) => {
    setDocInfo(info);
    setMainView(info.action);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const getFileMetadata = () => {
    return {
      programme: programName,
      docLevel: docInfo?.doc ? "course" : "programme",
      year: docInfo?.year,
      batch: docInfo?.batch,
      semester: docInfo?.batch, // Always set semester to batch value
      docType: docInfo?.doc || ""
    };
  };

  const handleUpload = async () => {
    if (!selectedFile || !docInfo) {
      setUploadStatus("Please select a file and document info.");
      return;
    }
    setUploadStatus("");
    const meta = getFileMetadata();
    const formData = new FormData();
    formData.append("file", selectedFile);
    Object.entries(meta).forEach(([key, value]) => formData.append(key, value));
    formData.append("uploadedBy", "admin"); // Replace with actual user if available

    try {
      const response = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadStatus("File uploaded successfully!");
      } else {
        setUploadStatus(data.error || "Upload failed.");
      }
    } catch (err) {
      setUploadStatus("Upload failed: " + err.message);
    }
  };

  const handleView = async () => {
    setViewStatus("");
    setViewedFile(null);
    if (!docInfo) {
      setViewStatus("Please select document info.");
      return;
    }
    const meta = getFileMetadata();
    const params = new URLSearchParams(meta);
    try {
      const response = await fetch(`http://localhost:5000/api/files?${params.toString()}`);
      const data = await response.json();
      console.log("Files returned from backend:", data.files); // DEBUG
      if (response.ok && data.files && data.files.length > 0) {
        setViewedFile(data.files[0]);
      } else {
        setViewStatus("No file found for this selection.");
      }
    } catch (err) {
      setViewStatus("Failed to fetch file: " + err.message);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleClickDropArea = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (mainView === "view" && docInfo) {
      handleView();
    }
    // eslint-disable-next-line
  }, [mainView, docInfo]);

  return (
    <div className="program-page-root curriculum-dev-container" style={{ display: "flex", gap: 32, minHeight: 600 }}>
      {/* Sidebar */}
      <div className="program-sidebar" style={{ flex: 1, maxWidth: 320 }}>
        <button className="curriculum-dev-nav-btn" style={{ marginBottom: 16 }} onClick={() => navigate("/curriculum")}>Curriculum Development</button>
        <button className="curriculum-dev-nav-btn" style={{ marginBottom: 24 }} onClick={() => setMainView("about")}>About {programName}</button>
        <NestedDropdown label="Course Documents" docType={true} onSelect={handleDropdownSelect} role={role} />
        <NestedDropdown label="Program Documents" docType={false} onSelect={handleDropdownSelect} role={role} />
      </div>
      {/* Divider */}
      <div style={{ width: 2, background: "#D5AB5D33", margin: "0 24px" }} />
      {/* Main Content */}
      <div className="program-main-content" style={{ flex: 3, display: "flex", flexDirection: "column", gap: 32 }}>
        <h2 className="curriculum-dev-main-heading" style={{ textAlign: "left", marginTop: 0 }}>
          Curriculum Development - {programName}
        </h2>
        {mainView === "about" && (
          <div className="program-about-card curriculum-dev-about-section">
            {aboutText}
          </div>
        )}
        {mainView === "upload" && role === "admin" && (
          <div className="program-upload-card curriculum-dev-about-section">
            <h3>Upload Document</h3>
            <p>Year: {docInfo?.year}, Batch: {docInfo?.batch}{docInfo?.doc ? `, Document: ${docInfo.doc}` : ""}</p>
            <div
              className={`drag-drop-area${dragActive ? " drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleClickDropArea}
              style={{
                border: dragActive ? "2px solid #D5AB5D" : "2px dashed #D5AB5D",
                borderRadius: 8,
                padding: 24,
                textAlign: "center",
                background: dragActive ? "#223b47" : "#223b4733",
                cursor: "pointer",
                marginBottom: 12
              }}
            >
              {dragActive ? (
                <span>Drop your file here...</span>
              ) : (
                <span>Drag & drop a file here, or click to select</span>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <span className="file-name">{selectedFile ? selectedFile.name : "No file chosen"}</span>
            <button className="curriculum-dev-nav-btn" style={{ marginTop: 12 }} onClick={handleUpload}>Upload</button>
            {uploadStatus && <div style={{ marginTop: 8, color: uploadStatus.includes("success") ? "green" : "red" }}>{uploadStatus}</div>}
          </div>
        )}
        {mainView === "view" && (
          <div className="program-view-card curriculum-dev-about-section">
            <h3>View Document</h3>
            <p>Year: {docInfo?.year}, Batch: {docInfo?.batch}{docInfo?.doc ? `, Document: ${docInfo.doc}` : ""}</p>
            {viewedFile ? (
              <div style={{ marginTop: 12 }}>
                {console.log("Viewing file:", viewedFile)} {/* DEBUG */}
                <div style={{ marginBottom: 8 }}>
                  <a href={`http://localhost:5000/uploads/${viewedFile.filename}`} target="_blank" rel="noopener noreferrer">View Fullscreen</a>
                </div>
                {viewedFile.mimetype === "application/pdf" ? (
                  <iframe
                    src={`http://localhost:5000/uploads/${viewedFile.filename}`}
                    title={viewedFile.originalName}
                    width="100%"
                    height="500px"
                    style={{ border: "1px solid #D5AB5D", borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ color: "#D5AB5D" }}>
                    Document preview not supported. <a href={`http://localhost:5000/uploads/${viewedFile.filename}`} target="_blank" rel="noopener noreferrer">Open in new tab</a>
                  </div>
                )}
                {role === "user" && (
                  <a
                    href={`http://localhost:5000/api/files/${viewedFile._id}/download`}
                    className="curriculum-dev-nav-btn"
                    style={{ marginTop: 16, display: "inline-block" }}
                    download
                  >
                    Download
                  </a>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 12, color: "#D5AB5D" }}>{viewStatus}</div>
            )}
          </div>
        )}
        {mainView === "about" && (
          <div className="program-outcomes-card curriculum-dev-about-section" style={{ marginTop: 24 }}>
            <h3 style={{ color: "#D5AB5D" }}>Program Specific Outcomes</h3>
            <p>[Add program specific outcomes here]</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramPage; 