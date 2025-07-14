// Template.jsx
import React, { useState } from 'react';

const templateList = [
  'Template 1',
  'Template 2',
  'Template 3',
  'Template 4',
  'Template 5',
  'Template 6',
  'Template 7',
  'Template 8',
  'Template 9',
  'Template 10',
];

const Template = () => {
  const [showTemplates, setShowTemplates] = useState(false);

  // Responsive styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#182E37', // changed from gradient to solid dashboard color
    fontFamily: 'Segoe UI, sans-serif',
    padding: '2vw',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  };

  const headerStyle = {
    background: '#223b47',
    border: '2px solid #D5AB5D',
    borderRadius: '8px',
    padding: '1.2rem 2rem',
    margin: '2vw 0 3vw 0',
    fontSize: '1.7rem',
    color: '#D5AB5D',
    fontWeight: 600,
    letterSpacing: '1px',
    width: '100%',
    maxWidth: 700,
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(213,171,93,0.08)',
  };

  const mainRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '2vw',
    width: '100%',
    maxWidth: 1100,
    justifyContent: 'center',
    alignItems: 'flex-start',
  };

  const sidebarStyle = {
    background: '#223b47',
    border: '2px solid rgba(150, 130, 13, 0.3)', // dashboard card border
    borderRadius: '0px', // dashboard card border radius
    color: '#fff',
    padding: '2rem 1.2rem',
    minWidth: '18vw',
    maxWidth: '28vw',
    width: '100%',
    flex: '1 1 22vw',
    marginBottom: '2vw',
    boxShadow: '0 4px 16px rgba(24,46,55,0.10)', // dashboard card shadow
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '1.1rem',
    textAlign: 'center',
  };

  const buttonStyle = {
    background: '#D5AB5D',
    color: '#223b47',
    border: 'none',
    borderRadius: '6px',
    padding: '0.9rem 1.2rem',
    fontWeight: 600,
    fontSize: '1.08rem',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(213,171,93,0.18)',
    transition: 'background 0.2s, color 0.2s, transform 0.15s',
  };

  const mainBoxStyle = {
    background: '#223b47',
    border: '2px solid rgba(150, 130, 13, 0.3)',
    borderRadius: '0px',
    color: '#fff',
    padding: '2rem 2vw',
    minWidth: '32vw',
    maxWidth: '60vw',
    width: '100%',
    flex: '2 1 48vw',
    minHeight: '320px',
    boxShadow: '0 4px 16px rgba(24,46,55,0.10)',
    fontSize: '1.1rem',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  };

  const templateListStyle = {
    marginTop: '1.2rem',
    paddingLeft: '1.2rem',
    color: '#223b47',
    fontSize: '1.08rem',
  };

  // Mobile responsive and dashboard card hover effect
  const mediaQuery = `@media (max-width: 700px) { .template-main-row { flex-direction: column; gap: 1.5rem; align-items: stretch; } }`;
  const dashboardCardHover = `
    .dashboard-card.criteria-animated-btn {
      transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1);
    }
    .dashboard-card.criteria-animated-btn:hover, .dashboard-card.criteria-animated-btn:focus {
      transform: scale(1.045);
      box-shadow: 0 8px 32px rgba(213,171,93,0.18), 0 2px 8px rgba(24,46,55,0.10);
      outline: none;
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{mediaQuery + dashboardCardHover}</style>
      <div style={headerStyle}>SOCSE TEMPLATES
      </div>
      <div className="template-main-row" style={mainRowStyle}>
        <div className="dashboard-card criteria-animated-btn" style={sidebarStyle}>
          <div style={{ marginBottom: '1rem' }}>
            Course files - when clicked should list out all the templates like course files
          </div>
          <button style={buttonStyle} onClick={() => setShowTemplates((v) => !v)}>
            {showTemplates ? 'Hide Course Files' : 'Show Course Files'}
          </button>
        </div>
        <div className="dashboard-card criteria-animated-btn" style={mainBoxStyle}>
          <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#D5AB5D' }}>
            List of all the course files templates
          </div>
          {showTemplates && (
            <ul style={templateListStyle}>
              {templateList.map((t, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', listStyle: 'disc', color: '#fff' }}>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template;
