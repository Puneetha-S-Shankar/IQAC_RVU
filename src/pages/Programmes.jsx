import React from "react";
import Navbar from "../components/Navbar";
import "./Programmes.css";

const Programmes = () => {
  return (
    <div>
      <Navbar />
      <div className="programmes">
        <h1>Our Programmes</h1>
        <div className="programme-list">
          <div className="programme-card">
            <h3>B.Tech in Computer Science</h3>
            <p>A 4-year programme focusing on AI, web, and systems.</p>
          </div>
          <div className="programme-card">
            <h3>BA in Economics</h3>
            <p>Explore global markets and policy-making in this 3-year course.</p>
          </div>
          <div className="programme-card">
            <h3>BBA in Finance</h3>
            <p>Designed for future business leaders and analysts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Programmes;
