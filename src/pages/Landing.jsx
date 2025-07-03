import React from "react";
import iqac1 from "../assets/iqac1.jpg";
import iqac2 from "../assets/iqac2.jpg";
import iqac3 from "../assets/iqac3.jpg";
import iqac4 from "../assets/iqac4.jpg";

const Landing = () => {
  const containerStyle = {
  background: "linear-gradient(180deg, #182E37, #101e27)",
  minHeight: "100vh",
  width: "100vw",
  padding: "1.0rem 0 1.0rem 0", // Reduced top padding
  margin: "0",
  boxSizing: "border-box",
  color: "white",
  overflowX: "hidden",
  position: "relative",
};


  const headingStyle = {
  fontFamily: "'Playfair Display', serif",
  fontSize: "4rem",
  textAlign: "center",
  margin: "0",                    // ✅ remove default spacing
  paddingTop: "0.5rem",           // ✅ optional slight padding
  color: "rgba(213, 171, 93, 0.5)",
  letterSpacing: "2px",
  userSelect: "none",
  cursor: "default",
  transition: "all 0.4s ease-in-out",
};


  const headingHoverStyle = {
    textShadow: "0 0 20px rgba(213, 171, 93, 0.7)",
    color: "rgba(213, 171, 93, 0.7)",
    transform: "scale(1.03)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "2.5rem",
    padding: "0 4rem",
    width: "100%",
    boxSizing: "border-box",
  };

  const boxStyle = {
    background: "linear-gradient(145deg, #203947, #121f28)",
    padding: "1.8rem",
    borderRadius: "20px",
    textAlign: "center",
    color: "#D5AB5D",
    border: "1px solid rgba(213, 171, 93, 0.25)",
    boxShadow:
      "0 15px 25px rgba(0,0,0,0.4), inset 2px 2px 8px rgba(255,255,255,0.05), inset -3px -3px 6px rgba(0,0,0,0.5)",
    transformStyle: "preserve-3d",
    transition: "all 0.4s ease-in-out",
    perspective: "1000px",
    overflow: "hidden",
    position: "relative",
  };

  const boxHoverStyle = {
    transform: "translateY(-10px) scale(1.05)",
    boxShadow:
      "0 25px 40px rgba(0,0,0,0.6), inset 1px 1px 3px rgba(213,171,93,0.1)",
  };

  const imgStyle = {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "1.2rem",
    boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
    transition: "transform 0.4s ease",
  };

  const shineStyle = {
    content: "''",
    position: "absolute",
    top: 0,
    left: "-75%",
    width: "50%",
    height: "100%",
    background:
      "linear-gradient(120deg, transparent, rgba(255,255,255,0.1), transparent)",
    transform: "skewX(-20deg)",
    animation: "shine 2s forwards",
  };

  const smokeOverlay = {
    content: "''",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at 30% 30%, rgba(60, 90, 110, 0.15), transparent 60%), radial-gradient(circle at 70% 60%, rgba(90, 120, 150, 0.15), transparent 65%)",
    animation: "floatmist 4s forwards",
    pointerEvents: "none",
    zIndex: 0,
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [hoveredBox, setHoveredBox] = React.useState(null);

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes shine {
            0% { left: -75%; }
            100% { left: 125%; }
          }
          @keyframes floatmist {
            0% {
              transform: translate(0px, 0px) scale(1);
              opacity: 0.8;
            }
            100% {
              transform: translate(-30px, -20px) scale(1.05);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  style={{ textAlign: "center", marginBottom: "4rem" }}
>
  <h1
    style={{
      ...headingStyle,
      ...(isHovered ? headingHoverStyle : {}),
      fontSize: "5rem",
      marginBottom: "0.5rem",
    }}
  >
    IQAC
  </h1>
  <p
    style={{
      fontSize: "1.2rem",
      color: "#D5AB5D99",
      fontStyle: "italic",
      letterSpacing: "1px",
      fontWeight: 300,
    }}
  >
    Internal Quality Assurance Cell
  </p>
</div>


      <div style={gridStyle}>
        {[iqac1, iqac2, iqac3, iqac4].map((img, index) => {
          const descriptions = [
            "IQAC ensures continuous improvement in academic quality.",
            "We oversee assessment and accreditation processes.",
            "IQAC provides institutional support for academic growth.",
            "We engage all stakeholders in the pursuit of excellence.",
          ];
          return (
            <div
              key={index}
              style={{
                ...boxStyle,
                ...(hoveredBox === index ? boxHoverStyle : {}),
              }}
              onMouseEnter={() => setHoveredBox(index)}
              onMouseLeave={() => setHoveredBox(null)}
            >
              <div style={shineStyle}></div>
              <img
                src={img}
                alt={`IQAC ${index + 1}`}
                style={{
                  ...imgStyle,
                  ...(hoveredBox === index
                    ? { transform: "scale(1.06)" }
                    : {}),
                }}
              />
              <p>{descriptions[index]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Landing;
