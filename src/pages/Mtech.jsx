import React from "react";
import { Link } from "react-router-dom";

const Mtech = () => {
  return (
    <div style={styles.container}>
      <h1 style={{marginTop: '90px', ...styles.heading}}>M.Tech Program Page</h1>
      <p style={styles.text}>This is a placeholder for the M.Tech program details.</p>

      <div style={styles.navLinks}>
        <Link to="/dashboard" style={styles.link}>← Back to Dashboard</Link>
        <Link to="/curriculum" style={styles.link}>← Back to Curriculum Development</Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "2.5rem",
    color: "#0d47a1",
  },
  text: {
    fontSize: "1.1rem",
    marginTop: "20px",
    marginBottom: "30px",
  },
  navLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
  },
  link: {
    fontSize: "1rem",
    color: "#1976d2",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Mtech;
