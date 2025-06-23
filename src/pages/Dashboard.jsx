import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

export default function Dashboard() {
  const [showProgrammes, setShowProgrammes] = useState(false);
  const [showCourses, setShowCourses] = useState(false);

  const handleUpload = (programme) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*";
    input.click();
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard">
        <h1 className="criteria-heading">Criteria</h1>
        <div className="criteria-row">
          <div className="criteria-button">
            <button onClick={() => setShowProgrammes(!showProgrammes)}>Curriculum Development</button>
            {showProgrammes && (
              <div className="dropdown">
                <div onClick={() => setShowCourses(!showCourses)}>Programmes</div>
                {showCourses && (
                  <div className="nested-dropdown">
                    <div onClick={() => handleUpload("BTech")}>BTech – Upload</div>
                    <div onClick={() => handleUpload("BSc")}>BSc – Upload</div>
                    <div onClick={() => handleUpload("BCA")}>BCA – Upload</div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="criteria-button">Faculty</button>
          <button className="criteria-button">Events</button>
          <button className="criteria-button">Workshops</button>
          <button className="criteria-button">Publication</button>
          <button className="criteria-button">Accreditation</button>
          <button className="criteria-button">Feedback</button>
        </div>
      </div>
    </div>
  );
}
