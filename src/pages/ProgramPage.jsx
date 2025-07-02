import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CurriculumDev.css";

const YEARS = [2022, 2023, 2024, 2025];
const BATCHES = ["1st year", "2nd year", "3rd year", "4th year"];
const COURSE_DOC_TYPES = [
  "Syllabus",
  "Course analysis document",
  "Internal review",
  "External review",
  "Change document",
];

function NestedDropdown({ label, docType, onSelect }) {
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
          <button onClick={() => onSelect({ year, batch, doc: docType ? doc : null, action: "upload" })}>Upload</button>
          <button onClick={() => onSelect({ year, batch, doc: docType ? doc : null, action: "view" })}>View</button>
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

  const handleDropdownSelect = (info) => {
    setDocInfo(info);
    setMainView(info.action);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="program-page-root curriculum-dev-container" style={{ display: "flex", gap: 32, minHeight: 600 }}>
      {/* Sidebar */}
      <div className="program-sidebar" style={{ flex: 1, maxWidth: 320 }}>
        <button className="curriculum-dev-nav-btn" style={{ marginBottom: 16 }} onClick={() => navigate("/curriculum")}>Curriculum Development</button>
        <button className="curriculum-dev-nav-btn" style={{ marginBottom: 24 }} onClick={() => setMainView("about")}>About {programName}</button>
        <NestedDropdown label="Course Documents" docType={true} onSelect={handleDropdownSelect} />
        <NestedDropdown label="Program Documents" docType={false} onSelect={handleDropdownSelect} />
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
        {mainView === "upload" && (
          <div className="program-upload-card curriculum-dev-about-section">
            <h3>Upload Document</h3>
            <p>Year: {docInfo?.year}, Batch: {docInfo?.batch}{docInfo?.doc ? `, Document: ${docInfo.doc}` : ""}</p>
            <label className="custom-file-label">
              Choose File
              <input type="file" onChange={handleFileChange} />
            </label>
            <span className="file-name">{selectedFile ? selectedFile.name : "No file chosen"}</span>
            <button className="curriculum-dev-nav-btn" style={{ marginTop: 12 }}>Upload</button>
          </div>
        )}
        {mainView === "view" && (
          <div className="program-view-card curriculum-dev-about-section">
            <h3>View Document</h3>
            <p>Year: {docInfo?.year}, Batch: {docInfo?.batch}{docInfo?.doc ? `, Document: ${docInfo.doc}` : ""}</p>
            <div style={{ height: 200, background: "#223b47", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#D5AB5D" }}>
              [Document preview here]
            </div>
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