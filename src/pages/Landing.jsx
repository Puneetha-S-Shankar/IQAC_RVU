import React from "react";
import iqac1 from "../assets/iqac1.jpg";
import iqac2 from "../assets/iqac2.jpg";
import iqac3 from "../assets/iqac3.jpg";
import iqac4 from "../assets/iqac4.jpg";

const Landing = () => {
  const containerStyle = {
    backgroundColor: "#001730",
    minHeight: "100vh",
    width: "100vw",
    padding: "4rem 0",
    margin: "0",
    boxSizing: "border-box",
    color: "white",
  };

  const headingStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "3.8rem",
    textAlign: "center",
    marginBottom: "3rem",
    color: "rgba(255, 215, 0, 0.35)",
    letterSpacing: "2px",
    userSelect: "none",
    transition: "all 0.3s ease-in-out",
    cursor: "default",
  };

  const headingHoverStyle = {
    textShadow: "0 0 15px rgba(255, 215, 0, 0.6)",
    color: "rgba(255, 215, 0, 0.6)",
    transform: "scale(1.01)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "2rem",
    padding: "0 4rem",
    width: "100%",
    boxSizing: "border-box",
  };

  const boxStyle = {
    backgroundColor: "#002b5e",
    padding: "1rem",
    borderRadius: "10px",
    textAlign: "center",
    color: "#FFD700",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  };

  const imgStyle = {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "6px",
    marginBottom: "1rem",
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div style={containerStyle}>
      <h1
        style={{
          ...headingStyle,
          ...(isHovered ? headingHoverStyle : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        IQAC Portal
      </h1>

      <div style={gridStyle}>
        <div style={boxStyle}>
          <img src={iqac1} alt="Quality Monitoring" style={imgStyle} />
          <p>IQAC ensures continuous improvement in academic quality.</p>
        </div>
        <div style={boxStyle}>
          <img src={iqac2} alt="Assessment" style={imgStyle} />
          <p>We oversee assessment and accreditation processes.</p>
        </div>
        <div style={boxStyle}>
          <img src={iqac3} alt="Support" style={imgStyle} />
          <p>IQAC provides institutional support for academic growth.</p>
        </div>
        <div style={boxStyle}>
          <img src={iqac4} alt="Engagement" style={imgStyle} />
          <p>We engage all stakeholders in the pursuit of excellence.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
