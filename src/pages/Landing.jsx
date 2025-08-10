import React from "react";
import AIChatbot from '../components/AIChatbot.jsx';
import iqac1 from "../assets/iqac1.jpg";
import iqac2 from "../assets/iqac2.jpg";
import iqac3 from "../assets/iqac3.jpg";
import iqac4 from "../assets/iqac4.jpg";
import './Landing.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import PDFViewer from '../components/PDFViewer.jsx'; // Corrected import path


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
    <div style={{ 
      padding: "4rem 2rem", 
      textAlign: "center",
      position: "relative",
      background: "linear-gradient(135deg, rgba(24, 46, 55, 0.9), rgba(16, 30, 39, 0.9))",
      borderRadius: "30px",
      margin: "2rem 1rem",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(213, 171, 93, 0.2)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
    }}>
      {/* Floating background elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "100px",
        height: "100px",
        background: "radial-gradient(circle, rgba(213, 171, 93, 0.1), transparent)",
        borderRadius: "50%",
        animation: "floatUp 6s ease-in-out infinite"
      }}></div>
      <div style={{
        position: "absolute",
        top: "60%",
        right: "8%",
        width: "80px",
        height: "80px",
        background: "radial-gradient(circle, rgba(213, 171, 93, 0.08), transparent)",
        borderRadius: "50%",
        animation: "floatDown 8s ease-in-out infinite"
      }}></div>

      <h2
        style={{
          background: "linear-gradient(135deg, #D5AB5D, #FFD700, #D5AB5D)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontSize: "3.5rem",
          fontWeight: "bold",
          marginBottom: "2.5rem",
          fontFamily: "'Playfair Display', serif",
          textShadow: "0 0 30px rgba(213, 171, 93, 0.6), 0 0 60px rgba(213, 171, 93, 0.4)",
          position: "relative",
          zIndex: 2
        }}
      >
        Our Achievements
        <div style={{
          position: "absolute",
          bottom: "-10px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "150px",
          height: "3px",
          background: "linear-gradient(90deg, transparent, #D5AB5D, transparent)",
          boxShadow: "0 0 15px rgba(213, 171, 93, 0.8)"
        }}></div>
      </h2>
      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "2rem",
          padding: "0 2rem",
          justifyItems: "center",
          position: "relative",
          zIndex: 2
        }}
      >
        {pdfFiles.map((file, index) => (
          <div
            key={index}
            style={{
              background: "linear-gradient(145deg, rgba(32, 57, 71, 0.9), rgba(18, 31, 40, 0.9))",
              border: "1px solid rgba(213, 171, 93, 0.4)",
              borderRadius: "20px",
              padding: "1.2rem",
              width: "240px",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              boxShadow: `
                0 10px 25px rgba(0,0,0,0.5), 
                inset 1px 1px 0 rgba(255,255,255,0.1),
                inset 0 0 20px rgba(213, 171, 93, 0.05),
                0 0 0 1px rgba(213, 171, 93, 0.2)
              `,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(10px)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.05) rotateY(5deg)";
              e.currentTarget.style.boxShadow = `
                0 20px 40px rgba(0,0,0,0.6), 
                inset 1px 1px 0 rgba(255,255,255,0.2),
                inset 0 0 30px rgba(213, 171, 93, 0.1),
                0 0 30px rgba(213, 171, 93, 0.4)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1) rotateY(0deg)";
              e.currentTarget.style.boxShadow = `
                0 10px 25px rgba(0,0,0,0.5), 
                inset 1px 1px 0 rgba(255,255,255,0.1),
                inset 0 0 20px rgba(213, 171, 93, 0.05),
                0 0 0 1px rgba(213, 171, 93, 0.2)
              `;
            }}
          >
            {/* Shine effect overlay */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
              transition: "left 0.6s ease",
              pointerEvents: "none"
            }} 
            onMouseEnter={() => {
              // Trigger shine effect on parent hover
            }}
            ></div>

            <a
              href={`/pdfs/${file}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "#D5AB5D" }}
            >
              <div style={{ 
                width: '200px', 
                height: '160px', 
                background: "linear-gradient(135deg, #fff, #f8f9fa)",
                borderRadius: '12px', 
                overflow: 'hidden',
                boxShadow: "0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
                border: "1px solid rgba(213, 171, 93, 0.3)",
                transition: "transform 0.3s ease"
              }}>
                <PDFViewer
                  fileUrl={`/pdfs/${file}`}
                  showControls={false}
                  fitParentWidth={true}
                />
              </div>
              <p style={{ 
                marginTop: "1rem", 
                fontWeight: "bold", 
                fontSize: "1rem",
                background: "linear-gradient(45deg, #D5AB5D, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
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
    background: `
      linear-gradient(135deg, #182E37 0%, #101e27 50%, #182E37 100%),
      radial-gradient(circle at 25% 25%, rgba(213, 171, 93, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)
    `,
    minHeight: "100vh",
    width: "100vw",
    padding: "1.0rem 0 1.0rem 0",
    margin: "0",
    boxSizing: "border-box",
    color: "white",
    overflowX: "hidden",
    position: "relative",
  };

  // Add floating background elements
  const floatingElements = (
    <>
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "200px",
        height: "200px",
        background: "radial-gradient(circle, rgba(213, 171, 93, 0.08), transparent 70%)",
        borderRadius: "50%",
        animation: "floatUp 8s ease-in-out infinite",
        zIndex: 0
      }}></div>
      <div style={{
        position: "absolute",
        top: "60%",
        right: "10%",
        width: "150px",
        height: "150px",
        background: "radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent 70%)",
        borderRadius: "50%",
        animation: "floatDown 6s ease-in-out infinite",
        zIndex: 0
      }}></div>
    </>
  );

  const headingStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "4rem",
    textAlign: "center",
    margin: "0",
    paddingTop: "0.5rem",
    background: "linear-gradient(135deg, rgba(213, 171, 93, 0.6), rgba(255, 215, 0, 0.8), rgba(213, 171, 93, 0.6))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "3px",
    userSelect: "none",
    cursor: "default",
    transition: "all 0.4s ease-in-out",
    position: "relative",
    zIndex: 2
  };

  const headingHoverStyle = {
    textShadow: "0 0 30px rgba(213, 171, 93, 0.8), 0 0 60px rgba(213, 171, 93, 0.6)",
    transform: "scale(1.05)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "2.5rem",
    padding: "0 4rem",
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
    zIndex: 2
  };

  const boxStyle = {
    background: `
      linear-gradient(145deg, rgba(32, 57, 71, 0.95), rgba(18, 31, 40, 0.95)),
      radial-gradient(circle at 30% 30%, rgba(213, 171, 93, 0.1), transparent 70%)
    `,
    padding: "2rem",
    borderRadius: "25px",
    textAlign: "center",
    color: "#D5AB5D",
    border: "1px solid rgba(213, 171, 93, 0.4)",
    boxShadow: `
      0 20px 40px rgba(0,0,0,0.5), 
      inset 2px 2px 10px rgba(255,255,255,0.08), 
      inset -3px -3px 8px rgba(0,0,0,0.4),
      0 0 0 1px rgba(213, 171, 93, 0.2)
    `,
    transformStyle: "preserve-3d",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    perspective: "1000px",
    overflow: "hidden",
    position: "relative",
    backdropFilter: "blur(15px)"
  };

  const boxHoverStyle = {
    transform: "translateY(-15px) scale(1.08) rotateX(5deg)",
    boxShadow: `
      0 35px 60px rgba(0,0,0,0.7), 
      inset 1px 1px 3px rgba(213,171,93,0.15),
      0 0 40px rgba(213, 171, 93, 0.4)
    `,
  };

  const imgStyle = {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "15px",
    marginBottom: "1.5rem",
    boxShadow: `
      0 15px 30px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.2)
    `,
    transition: "all 0.4s ease",
    border: "1px solid rgba(213, 171, 93, 0.3)"
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [hoveredBox, setHoveredBox] = React.useState(null);

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.8; }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.5; }
          50% { transform: translateY(15px) scale(0.9); opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {floatingElements}

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ textAlign: "center", marginBottom: "4rem", position: "relative", zIndex: 2 }}
      >
        <h1
          style={{
            ...headingStyle,
            ...(isHovered ? headingHoverStyle : {}),
            fontSize: "6rem",
            marginBottom: "0.5rem",
            textShadow: isHovered 
              ? "0 0 40px rgba(213, 171, 93, 0.9), 0 0 80px rgba(213, 171, 93, 0.6)" 
              : "0 0 20px rgba(213, 171, 93, 0.5)"
          }}
        >
          IQAC
          {/* Underline effect */}
          <div style={{
            position: "absolute",
            bottom: "-15px",
            left: "50%",
            transform: "translateX(-50%)",
            width: isHovered ? "200px" : "150px",
            height: "4px",
            background: "linear-gradient(90deg, transparent, #D5AB5D, #FFD700, #D5AB5D, transparent)",
            borderRadius: "2px",
            boxShadow: "0 0 20px rgba(213, 171, 93, 0.8)",
            transition: "all 0.4s ease"
          }}></div>
        </h1>
        <p
          style={{
            fontSize: "1.4rem",
            background: "linear-gradient(45deg, rgba(213, 171, 93, 0.7), rgba(255, 215, 0, 0.9))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontStyle: "italic",
            letterSpacing: "2px",
            fontWeight: 400,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
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
              {/* Enhanced shine effect */}
              <div style={{
                position: "absolute",
                top: 0,
                left: hoveredBox === index ? "100%" : "-100%",
                width: "100%",
                height: "100%",
                background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.15), rgba(213,171,93,0.1), transparent)",
                transform: "skewX(-20deg)",
                transition: "left 0.8s ease",
                pointerEvents: "none",
                zIndex: 1
              }}></div>
              
              {/* Glow effect */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at center, rgba(213, 171, 93, 0.1), transparent 70%)",
                opacity: hoveredBox === index ? 1 : 0,
                transition: "opacity 0.4s ease",
                pointerEvents: "none",
                borderRadius: "25px"
              }}></div>

              <img
                src={img}
                alt={`IQAC ${index + 1}`}
                style={{
                  ...imgStyle,
                  transform: hoveredBox === index ? "scale(1.08) rotateY(2deg)" : "scale(1)",
                  zIndex: 2,
                  position: "relative"
                }}
              />
              <p style={{
                background: "linear-gradient(45deg, #D5AB5D, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "1rem",
                lineHeight: "1.6",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                position: "relative",
                zIndex: 2
              }}>
                {descriptions[index]}
              </p>
            </div>
          );
        })}
      </div>

      {/* ✅ Render Enhanced Achievements Section */}
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

        
            
          
      </footer>
      <AIChatbot />
    </div>
  );
};

export default Landing;