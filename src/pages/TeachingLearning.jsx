import React, { useState, useEffect, useRef } from "react";
import "./CurriculumDev.css";

const BTECH_COURSES = [
  "CS1005 - Programming in C",
  "CS1101 - DSCA",
  "CS1307 - Web fundamentals and ux design",
  "CS1805 - Engineering explorations",
  "CS1807 - Exploring Science",
  "CS1803 - Discrete mathematics and graph theory",
  "CS1902 - Structured innovation and design thinking",
  "CS1909- Consitution of India and professional Ethics"
];

const FILE_TYPES = ["Syllabus", "Lesson Plan", "Student List"];

const getFileTypeKey = (type) => type.toLowerCase().replace(/ /g, "_");

const fetchDeadline = async () => {
  const res = await fetch("/api/files/deadline");
  const data = await res.json();
  return data.deadline ? new Date(data.deadline) : null;
};

const fetchFiles = async (course) => {
  const params = new URLSearchParams({ programme: "BTECH", docLevel: "course", courseName: course });
  const res = await fetch(`/api/files?${params.toString()}`);
  const data = await res.json();
  return data.files || [];
};

const uploadFile = async (file, course, fileType) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("programme", "BTECH");
  formData.append("docLevel", "course");
  formData.append("courseName", course);
  formData.append("docType", fileType);
  formData.append("uploadedBy", "user");
  const res = await fetch("/api/files/upload", { method: "POST", body: formData });
  return res.json();
};

const mergeFiles = async (fileIds) => {
  const res = await fetch("/api/files/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileIds, mergedFileName: `coursefile-${Date.now()}.pdf` })
  });
  return res.json();
};

const TeachingLearning = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [search, setSearch] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [mergedFile, setMergedFile] = useState(null);
  const [merging, setMerging] = useState(false);
  const [expanded, setExpanded] = useState(null); // which box is open
  const [viewing, setViewing] = useState({ type: null, file: null });
  const fileInputs = {
    Syllabus: useRef(),
    "Lesson Plan": useRef(),
    "Student List": useRef(),
  };

  // Ensure allUploaded is declared before any use
  const allUploaded = FILE_TYPES.every(t => files[getFileTypeKey(t)]);

  const filteredCourses = BTECH_COURSES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchDeadline().then(setDeadline);
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchFiles(selectedCourse).then(fetched => {
        const byType = {};
        for (const t of FILE_TYPES) {
          byType[getFileTypeKey(t)] = fetched.find(f => f.docType === t);
        }
        setFiles(byType);
      });
      setMergedFile(null); // Only reset when course changes
    }
    // eslint-disable-next-line
  }, [selectedCourse]);

  // Automatically trigger merge when all files are uploaded and selectedCourse changes or uploadStatus changes
  useEffect(() => {
    if (selectedCourse && allUploaded && !merging && !mergedFile) {
      handleMerge();
    }
    // eslint-disable-next-line
  }, [selectedCourse, allUploaded, uploadStatus]);

  const handleUpload = async (file, fileType) => {
    setUploading(u => ({ ...u, [fileType]: true }));
    setUploadStatus(s => ({ ...s, [fileType]: "" }));
    try {
      const res = await uploadFile(file, selectedCourse, fileType);
      if (res.file) {
        setUploadStatus(s => ({ ...s, [fileType]: "success" }));
        // Immediately update files state so View link appears
        setFiles(f => ({ ...f, [getFileTypeKey(fileType)]: res.file }));
      } else {
        setUploadStatus(s => ({ ...s, [fileType]: res.error || "Upload failed" }));
      }
    } catch (e) {
      setUploadStatus(s => ({ ...s, [fileType]: "Upload failed" }));
    }
    setUploading(u => ({ ...u, [fileType]: false }));
  };

  const handleMerge = async () => {
    setMerging(true);
    try {
      const fileIds = FILE_TYPES.map(t => files[getFileTypeKey(t)]._id);
      const res = await mergeFiles(fileIds);
      if (res.file) {
        setMergedFile(res.file);
        // Immediately re-fetch files so merged file appears in UI
        const fetched = await fetchFiles(selectedCourse);
        const byType = {};
        for (const t of FILE_TYPES) {
          byType[getFileTypeKey(t)] = fetched.find(f => f.docType === t);
        }
        // Only add merged file for the current course
        byType['merged'] = fetched.find(f => f.docType === 'merged' && f.courseName === selectedCourse);
        setFiles(byType);
      } else {
        alert(res.error || 'Failed to merge PDFs.');
      }
    } finally {
      setMerging(false);
    }
  };

  const getUploadButtonColor = (fileType) => {
    if (!deadline) return "#D5AB5D";
    const now = new Date();
    if (files[getFileTypeKey(fileType)]) return "#2ecc40"; // green
    if (now > deadline) return "#e74c3c"; // red
    return "#ff9800"; // orange
  };

  return (
    <div className="program-page-root curriculum-dev-container" style={{ display: "flex", gap: 32, minHeight: 600 }}>
      {/* Sidebar */}
      <div className="program-sidebar" style={{ flex: 1, maxWidth: 320 }}>
        <div className="program-nested-dropdown">
          <div className="dropdown-label">Course Files</div>
          <input
            type="text"
            placeholder="Search or select course"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", marginBottom: 10, padding: "10px 12px", border: "1.5px solid #D5AB5D", background: "#182E37", color: "#fff", borderRadius: 0, boxSizing: "border-box" }}
          />
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #D5AB5D", background: "#182E37", color: "#fff", borderRadius: 0, boxSizing: "border-box" }}
          >
            <option value="">Select Course</option>
            {filteredCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Divider */}
      <div style={{ width: 2, background: "#D5AB5D33", margin: "0 24px" }} />
      {/* Main Content */}
      <div className="program-main-content" style={{ flex: 3, display: "flex", flexDirection: "column", gap: 32, alignItems: 'center' }}>
        <h2 className="curriculum-dev-main-heading" style={{ textAlign: "left", marginTop: 0 }}>
          Teaching and Learning - BTECH
        </h2>
        {!selectedCourse ? (
          <div className="program-about-card curriculum-dev-about-section">
            <span style={{ color: "#D5AB5D" }}>Select a course to manage files.</span>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: 'center', width: '100%' }}>
              {FILE_TYPES.map(fileType => {
                const key = getFileTypeKey(fileType);
                const file = files[key];
                const isOpen = expanded === fileType;
                return (
                  <div
                    className="curriculum-dev-about-section"
                    style={{ flex: 1, minWidth: 260, maxWidth: 340, cursor: isOpen ? "default" : "pointer", border: isOpen ? "2.5px solid #D5AB5D" : undefined }}
                    key={fileType}
                    onClick={() => !isOpen && setExpanded(fileType)}
                  >
                    <h3 style={{ color: "#D5AB5D", marginBottom: 0 }}>{fileType}</h3>
                    {!isOpen && <div style={{ height: 40 }}></div>}
                    {isOpen && (
                      <div style={{ marginTop: 16 }} onClick={e => e.stopPropagation()}>
                        <div style={{ marginBottom: 10 }}>
                          {file ? (
                            <button
                              className="curriculum-dev-nav-btn"
                              style={{ background: "#223b47", color: "#D5AB5D", border: "1.5px solid #D5AB5D", marginBottom: 8, fontSize: "0.95rem" }}
                              onClick={() => setViewing({ type: fileType, file })}
                            >
                              View
                            </button>
                          ) : (
                            <span style={{ color: "#D5AB5D99" }}>No file uploaded</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="application/pdf"
                          style={{ display: "none" }}
                          ref={fileInputs[fileType]}
                          onChange={e => {
                            if (e.target.files[0]) handleUpload(e.target.files[0], fileType);
                          }}
                        />
                        <button
                          className="curriculum-dev-nav-btn"
                          style={{ background: getUploadButtonColor(fileType), color: "#fff", marginTop: 4 }}
                          disabled={uploading[fileType]}
                          onClick={() => fileInputs[fileType].current && fileInputs[fileType].current.click()}
                        >
                          {uploading[fileType] ? "Uploading..." : "Upload"}
                        </button>
                        {uploadStatus[fileType] && (
                          <div style={{ color: uploadStatus[fileType] === "success" ? "#2ecc40" : "#e74c3c", marginTop: 6 }}>
                            {uploadStatus[fileType] === "success" ? "Uploaded!" : uploadStatus[fileType]}
                          </div>
                        )}
                        <div style={{ marginTop: 10 }}>
                          <button
                            className="curriculum-dev-nav-btn"
                            style={{ background: "#223b47", color: "#D5AB5D", border: "1.5px solid #D5AB5D", marginTop: 8, fontSize: "0.95rem" }}
                            onClick={() => setExpanded(null)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedCourse && allUploaded && files.merged && files.merged.courseName === selectedCourse && (
              <div style={{ marginTop: 40, width: '100%', display: 'flex', justifyContent: 'center' }}>
                {merging ? (
                  <div style={{ color: '#D5AB5D', fontWeight: 600, fontSize: '1.1rem' }}>Merging course files...</div>
                ) : (
                  <a
                    href={`http://localhost:5000/uploads/${files.merged.filename}`}
                    className="curriculum-dev-nav-btn"
                    style={{ background: "#D5AB5D", color: "#182E37", fontWeight: 700, fontSize: "1.1rem", display: "inline-block" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Merged Course File
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {viewing.file && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setViewing({ type: null, file: null })}>
          <div style={{ background: "#223b47", padding: 24, borderRadius: 8, maxWidth: "90vw", maxHeight: "90vh", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button style={{ position: "absolute", top: 8, right: 8, background: "#e74c3c", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", cursor: "pointer" }} onClick={() => setViewing({ type: null, file: null })}>Close</button>
            <iframe
              src={`http://localhost:5000/uploads/${viewing.file.filename}`}
              title={viewing.file.originalName}
              width="800px"
              height="600px"
              style={{ border: "1.5px solid #D5AB5D", borderRadius: 8, background: "#fff" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachingLearning; 