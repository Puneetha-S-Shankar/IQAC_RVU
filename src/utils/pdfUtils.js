import { PDFDocument } from 'pdf-lib';

/**
 * Fetch PDF as array buffer from URL
 */
const fetchPdfAsArrayBuffer = async (url, token) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  
  return await response.arrayBuffer();
};

/**
 * Merge multiple PDFs into one
 */
export const mergePDFs = async (pdfUrls, token, progressCallback) => {
  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    const totalFiles = pdfUrls.length;
    let processedFiles = 0;

    for (let i = 0; i < pdfUrls.length; i++) {
      const pdfUrl = pdfUrls[i];
      
      // Update progress
      if (progressCallback) {
        progressCallback(`Fetching document ${i + 1} of ${totalFiles}...`, (processedFiles / totalFiles) * 50);
      }

      try {
        // Fetch PDF data
        const pdfArrayBuffer = await fetchPdfAsArrayBuffer(pdfUrl.url, token);
        
        // Load the PDF
        const pdf = await PDFDocument.load(pdfArrayBuffer);
        
        // Update progress
        if (progressCallback) {
          progressCallback(`Processing document ${i + 1}: ${pdfUrl.title}...`, 50 + (processedFiles / totalFiles) * 40);
        }
        
        // Copy all pages from this PDF to the merged PDF
        const pageCount = pdf.getPageCount();
        for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
          const [copiedPage] = await mergedPdf.copyPages(pdf, [pageIndex]);
          mergedPdf.addPage(copiedPage);
        }
        
        processedFiles++;
        
      } catch (error) {
        console.error(`Error processing PDF ${pdfUrl.title}:`, error);
        // Continue with other PDFs even if one fails
      }
    }

    // Update progress
    if (progressCallback) {
      progressCallback('Finalizing merged document...', 95);
    }

    // Generate the final PDF
    const pdfBytes = await mergedPdf.save();
    
    // Update progress
    if (progressCallback) {
      progressCallback('Complete!', 100);
    }
    
    return pdfBytes;
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw error;
  }
};

/**
 * Download PDF bytes as file
 */
export const downloadPDF = (pdfBytes, filename) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};
