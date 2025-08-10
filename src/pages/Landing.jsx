import React from "react";
import iqac1 from "../assets/iqac1.jpg";
import iqac2 from "../assets/iqac2.jpg";
import iqac3 from "../assets/iqac3.jpg";
import iqac4 from "../assets/iqac4.jpg";
import './Landing.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from "framer-motion"; 
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const pdfFiles = [
  "BB 1st.pdf",
  "BB 2nd.pdf",
  "BB 3rd.pdf",
  "BB 4th.pdf",
  "BB 5th.pdf",
  "BB 6th.pdf"
];

const AchievementsSection = () => {
  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
      <h2
        style={{
          color: "#D5AB5D",
          fontSize: "3rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          fontFamily: "'Playfair Display', serif",
          textShadow: "0 0 20px rgba(213, 171, 93, 0.5)",
        }}
      >
        Our Achievements
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2rem",
          padding: "0 2rem",
          justifyItems: "center",
        }}
      >
        {pdfFiles.map((file, index) => (
          <div
            key={index}
            style={{
              background: "linear-gradient(145deg, #203947, #121f28)",
              border: "1px solid rgba(213, 171, 93, 0.3)",
              borderRadius: "15px",
              padding: "1rem",
              width: "220px",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              boxShadow:
                "0 8px 16px rgba(0,0,0,0.4), inset 1px 1px 3px rgba(255,255,255,0.05)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <a
              href={`/pdfs/${file}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#D5AB5D" }}
            >
              <Document
                file={`/pdfs/${file}`}
                loading="Loading..."
                renderMode="canvas"
              >
                <Page
                  pageNumber={1}
                  width={200}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              <p style={{ marginTop: "0.8rem", fontWeight: "bold" }}>
                View {file.replace(".pdf", "")}
              </p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

const Landing = () => {
  const containerStyle = {
    background: "linear-gradient(180deg, #182E37, #101e27)",
    minHeight: "100vh",
    width: "100vw",
    padding: "1.0rem 0 1.0rem 0",
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
    margin: "0",
    paddingTop: "0.5rem",
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
    boxShadow: "0 25px 40px rgba(0,0,0,0.6), inset 1px 1px 3px rgba(213,171,93,0.1)",
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
    background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.1), transparent)",
    transform: "skewX(-20deg)",
    animation: "shine 2s forwards",
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [hoveredBox, setHoveredBox] = React.useState(null);

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes shine {
          0% { left: -75%; }
          100% { left: 125%; }
        }
        @keyframes floatmist {
          0% { transform: translate(0px, 0px) scale(1); opacity: 0.8; }
          100% { transform: translate(-30px, -20px) scale(1.05); opacity: 1; }
        }
      `}</style>

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
                  ...(hoveredBox === index ? { transform: "scale(1.06)" } : {}),
                }}
              />
              <p>{descriptions[index]}</p>
            </div>
          );
        })}
      </div>

      {/* ✅ Render Achievements Section */}
      <AchievementsSection />

      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-left">
            <h2>RV University</h2>
            <p>RV Vidyanikethan Post<br />
              8th Mile, Mysuru Road, Bengaluru - 560 059<br />India</p>
            <p>📞 +91 89511 79896</p>
            <p>✉️ admissions@rvu.edu.in</p>
            <p>🌐 <a href="https://rvu.edu.in/" target="_blank" rel="noopener noreferrer">rvu.edu.in</a></p>
          </div>

          <div className="footer-mid">
            <h4>Vision</h4>
            <p>To nurture future leaders with innovation and integrity.</p>
            <h4>Mission</h4>
            <p>To deliver quality education, foster research, and develop responsible citizens.</p>
          </div>

          <div className="footer-links">
            <a href="/iqac">IQAC</a>
            <a href="/research">Research</a>
            <a href="/admissions">Admissions</a>
            <a href="/library">Library</a>
            <a href="/alumni">Alumni</a>
            <a href="/careers">Careers</a>
          </div>
        </div>

        <div className="footer-social">
          <a href="https://www.facebook.com/RV.University1/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
          <a href="https://x.com/_RVUniversity_" target="_blank" rel="noopener noreferrer"><i className="fab fa-x-twitter"></i></a>
          <a href="https://www.youtube.com/c/RVUniversity" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
          <a href="https://www.instagram.com/rv.university/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="https://in.linkedin.com/school/rv-university/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RV University | Privacy Policy</p>
        </div>

        <a href="#top" className="back-to-top">↑</a>

        <div className="chat-popup">
          <div className="chat-bot">
            🤖 Hi! This is YourBot. <br />
            <i><b>Note:</b><br /> Applications are open for UG and PG courses - 2025-26</i>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
