// Template.jsx
import React, { useState } from 'react';

// Static categories and templates
const categories = [
  { name: 'Category 1', templates: ['Template A1', 'Template A2', 'Template A3'] },
  { name: 'Category 2', templates: ['Template B1', 'Template B2'] },
  { name: 'Category 3', templates: ['Template C1', 'Template C2', 'Template C3', 'Template C4'] },
  { name: 'Category 4', templates: ['Template D1'] },
];

const Template = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    background: '#182E37',
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

  // Layout for categories and templates
  const mainRowStyle = {
    display: 'flex',
    flexDirection: selectedCategory !== null ? 'row' : 'column',
    alignItems: selectedCategory !== null ? 'flex-start' : 'center',
    justifyContent: 'center',
    gap: selectedCategory !== null ? '2vw' : '0',
    width: '100%',
    maxWidth: 1100,
    minHeight: '50vh',
  };

  const categoriesListStyle = {
    background: selectedCategory !== null ? '#223b47' : 'transparent',
    border: selectedCategory !== null ? '2px solid rgba(150, 130, 13, 0.3)' : 'none',
    borderRadius: '0px',
    color: '#fff',
    padding: selectedCategory !== null ? '2rem 1.2rem' : '0',
    minWidth: selectedCategory !== null ? '18vw' : '0',
    maxWidth: selectedCategory !== null ? '28vw' : 'none',
    width: selectedCategory !== null ? '100%' : 'auto',
    flex: selectedCategory !== null ? '1 1 22vw' : 'none',
    marginBottom: selectedCategory !== null ? '2vw' : '0',
    boxShadow: selectedCategory !== null ? '0 4px 16px rgba(24,46,55,0.10)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '1.1rem',
    textAlign: 'center',
    gap: selectedCategory !== null ? '0' : '1.5rem',
  };

  const categoryButtonStyle = (active) => ({
    background: active ? '#D5AB5D' : '#223b47',
    color: active ? '#223b47' : '#D5AB5D',
    border: '2px solid #D5AB5D',
    borderRadius: '6px',
    padding: '1rem 2.5rem',
    fontWeight: 600,
    fontSize: '1.15rem',
    margin: '0.5rem 0',
    cursor: 'pointer',
    boxShadow: active ? '0 2px 8px rgba(213,171,93,0.18)' : 'none',
    transition: 'background 0.2s, color 0.2s, transform 0.15s',
    width: '100%',
    minWidth: '260px',
    maxWidth: '320px',
    textAlign: 'center',
    display: 'block',
  });

  const templatesBoxStyle = {
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
    color: '#fff',
    fontSize: '1.08rem',
  };

  // Responsive
  const mediaQuery = `@media (max-width: 700px) { .template-main-row { flex-direction: column; gap: 1.5rem; align-items: stretch; } }`;

  return (
    <div style={containerStyle}>
      <style>{mediaQuery}</style>
      <div style={headerStyle}>SOCSE TEMPLATES</div>
      <div className="template-main-row" style={mainRowStyle}>
        <div style={categoriesListStyle}>
          {categories.map((cat, idx) => (
            <button
              key={cat.name}
              style={categoryButtonStyle(selectedCategory === idx)}
              onClick={() => setSelectedCategory(idx)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {selectedCategory !== null && (
          <div style={templatesBoxStyle}>
            <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#D5AB5D' }}>
              Templates in {categories[selectedCategory].name}
            </div>
            <ul style={templateListStyle}>
              {categories[selectedCategory].templates.map((t, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', listStyle: 'disc', color: '#fff' }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Template;
