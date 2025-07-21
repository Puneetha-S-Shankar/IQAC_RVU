import React, { useState, useEffect, useRef } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';
import './PDFViewer.css';

GlobalWorkerOptions.workerSrc = workerSrc;

const PDFViewer = ({ fileUrl, showControls = true, initialScale = 1.5, fitParentWidth = false }) => {
  const canvasRef = useRef(null);
  const [pdfRef, setPdfRef] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(initialScale);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadingTask = getDocument(fileUrl);
    loadingTask.promise
      .then(loadedPdf => {
        setPdfRef(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load PDF file. It might be corrupted or in an unsupported format.');
        setLoading(false);
        console.error('PDF loading error:', err);
      });
  }, [fileUrl]);

  useEffect(() => {
    if (pdfRef && canvasRef.current) {
      pdfRef.getPage(currentPage).then(page => {
        let scaleToRender = scale;
        if (fitParentWidth && canvasRef.current.parentElement) {
          const parentWidth = canvasRef.current.parentElement.clientWidth;
          scaleToRender = parentWidth / page.getViewport({ scale: 1.0 }).width;
        }
        const viewport = page.getViewport({ scale: scaleToRender });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        page.render(renderContext);
      });
    }
  }, [pdfRef, currentPage, scale]);

  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(numPages, prev + 1));
  const zoomIn = () => setScale(prev => prev + 0.2);
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.2));

  return (
    <div className="pdf-viewer-container">
      {loading && <div className="pdf-viewer-message">Loading PDF...</div>}
      {error && <div className="pdf-viewer-message" style={{ color: '#ff4a4a' }}>{error}</div>}
      
      {!loading && !error && (
        <>
          {showControls && (
            <div className="pdf-controls">
              <button onClick={goToPrevPage} disabled={currentPage <= 1}>
                Prev
              </button>
              <span className="page-info">
                Page {currentPage} of {numPages}
              </span>
              <button onClick={goToNextPage} disabled={currentPage >= numPages}>
                Next
              </button>
              <button onClick={zoomOut} disabled={scale <= 0.5}>Zoom Out</button>
              <button onClick={zoomIn}>Zoom In</button>
              <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </div>
          )}
          <div className="pdf-canvas-wrapper">
            <canvas ref={canvasRef} className="pdf-canvas" />
          </div>
        </>
      )}
    </div>
  );
};

export default PDFViewer; 