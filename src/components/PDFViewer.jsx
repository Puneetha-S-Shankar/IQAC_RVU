import React, { useState, useEffect } from 'react';
import './PDFViewer.css';

const PDFViewer = ({ 
  fileUrl, 
  showControls = true, 
  fitParentWidth = false,
  height = '600px' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [pdfExists, setPdfExists] = useState(false);

  useEffect(() => {
    // Check if PDF exists
    const checkPdfExists = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (response.ok) {
          setPdfExists(true);
        } else {
          setPdfExists(false);
          setHasError(true);
        }
      } catch (error) {
        console.error('PDF check error:', error);
        setPdfExists(false);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (fileUrl) {
      checkPdfExists();
    }
  }, [fileUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-message">Loading PDF...</div>
      </div>
    );
  }

  if (hasError || !pdfExists) {
    return (
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-message" style={{ color: '#ff6b6b' }}>
          PDF not found or failed to load
        </div>
        {showControls && (
          <div className="pdf-controls">
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  const containerStyle = {
    width: fitParentWidth ? '100%' : 'auto',
    height: height
  };

  return (
    <div className="pdf-viewer-container" style={containerStyle}>
      {showControls && (
        <div className="pdf-controls">
          <button onClick={handleDownload}>
            📥 Download
          </button>
          <button onClick={openInNewTab}>
            🔗 Open in New Tab
          </button>
        </div>
      )}
      
      <div className="pdf-iframe-wrapper" style={{ height: showControls ? 'calc(100% - 60px)' : '100%' }}>
        <iframe
          src={fileUrl}
          title="PDF Viewer"
          width="100%"
          height="100%"
          style={{
            border: 'none',
            borderRadius: '4px'
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
};

export default PDFViewer;