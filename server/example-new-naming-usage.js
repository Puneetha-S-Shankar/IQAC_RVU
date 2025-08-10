const mongoose = require('mongoose');
const UnifiedFileService = require('./services/unifiedFileService');
const File = require('./models/File');

// Example usage of the new naming convention
async function demonstrateNewNaming() {
  try {
    console.log('🎯 Demonstrating new file naming convention usage...\n');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/iqac_rvu', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    const unifiedFileService = new UnifiedFileService();
    await unifiedFileService.initialize();
    
    // Example 1: Upload a curriculum file
    console.log('📤 Example 1: Uploading a curriculum file');
    console.log('   This will automatically generate the new filename format\n');
    
    const curriculumMetadata = {
      category: 'curriculum',
      programme: 'BTECH',
      year: '2023',
      batch: '1st year',
      semester: '1st semester',
      courseCode: 'CS101',
      courseName: 'Digital Systems and Computer Architecture',
      docType: 'Course Analysis',
      docLevel: 'course',
      description: 'Comprehensive analysis of CS101 course',
      uploadedBy: new mongoose.Types.ObjectId()
    };
    
    // Simulate file data (in real scenario, this would come from multer)
    const mockFileData = {
      originalName: 'Course_Analysis_Report.pdf',
      mimetype: 'application/pdf',
      size: 2048576
    };
    
    const mockFileBuffer = Buffer.from('Mock PDF content for demonstration');
    
    console.log('   Metadata:', JSON.stringify(curriculumMetadata, null, 2));
    console.log('   Original filename:', mockFileData.originalName);
    
    // Generate filename to show what it would look like
    const generatedFilename = unifiedFileService.generateFormattedFilename(
      curriculumMetadata,
      mockFileData.originalName
    );
    
    console.log('   Generated filename:', generatedFilename);
    console.log('   Expected format: year_courseCode_originalName.pdf\n');
    
    // Example 2: Upload an assignment file
    console.log('📤 Example 2: Uploading an assignment file');
    
    const assignmentMetadata = {
      category: 'assignment',
      programme: 'BTECH',
      year: '2024',
      batch: '2nd year',
      semester: '3rd semester',
      courseCode: 'CS201',
      courseName: 'Data Structures and Algorithms',
      docType: 'Assignment Submission',
      assignmentId: new mongoose.Types.ObjectId(),
      uploaderEmail: 'student@rvu.ac.in',
      description: 'Assignment 1 submission for CS201',
      uploadedBy: new mongoose.Types.ObjectId()
    };
    
    const mockAssignmentData = {
      originalName: 'Assignment1_Submission.pdf',
      mimetype: 'application/pdf',
      size: 1048576
    };
    
    const generatedAssignmentFilename = unifiedFileService.generateFormattedFilename(
      assignmentMetadata,
      mockAssignmentData.originalName
    );
    
    console.log('   Metadata:', JSON.stringify(assignmentMetadata, null, 2));
    console.log('   Original filename:', mockAssignmentData.originalName);
    console.log('   Generated filename:', generatedAssignmentFilename);
    console.log('   Expected format: year_courseCode_originalName.pdf\n');
    
    // Example 3: Search by naming convention
    console.log('🔍 Example 3: Searching files by naming convention');
    console.log('   Different search patterns you can use:\n');
    
    const searchExamples = [
      {
        pattern: '2023_CS101',
        description: 'Find all 2023 CS101 files'
      },
      {
        pattern: 'CS201',
        description: 'Find all CS201 files (any year)'
      },
      {
        pattern: '2024',
        description: 'Find all 2024 files'
      },
      {
        pattern: 'CS101_Course',
        description: 'Find CS101 files with "Course" in filename'
      }
    ];
    
    searchExamples.forEach((example, index) => {
      console.log(`   ${index + 1}. Pattern: "${example.pattern}"`);
      console.log(`      Description: ${example.description}`);
      console.log(`      API Call: GET /api/unified-files/search-by-filename?pattern=${example.pattern}\n`);
    });
    
    // Example 4: Display files in UI
    console.log('📱 Example 4: Displaying files in frontend UI');
    console.log('   How to show files with new naming convention:\n');
    
    console.log('   // In your React component:');
    console.log('   const FileList = ({ files }) => {');
    console.log('     return (');
    console.log('       <div>');
    console.log('         {files.map(file => (');
    console.log('           <div key={file._id}>');
    console.log('             <span>📄 {file.filename}</span>');
    console.log('             <span>(Original: {file.originalName})</span>');
    console.log('             <span>📚 {file.metadata.courseCode} - {file.metadata.docType}</span>');
    console.log('           </div>');
    console.log('         ))}');
    console.log('       </div>');
    console.log('     );');
    console.log('   };');
    console.log('');
    
    console.log('   // This will display:');
    console.log('   // 📄 2023_CS101_Course_Analysis_Report.pdf');
    console.log('   // (Original: Course_Analysis_Report.pdf)');
    console.log('   // 📚 CS101 - Course Analysis');
    console.log('');
    
    // Example 5: Download with new filename
    console.log('📥 Example 5: Downloading files with new naming convention');
    console.log('   When users download files, they will see the new filename:\n');
    
    console.log('   // Download response headers:');
    console.log('   Content-Type: application/pdf');
    console.log('   Content-Disposition: inline; filename="2023_CS101_Course_Analysis_Report.pdf"');
    console.log('   Content-Length: 2048576');
    console.log('');
    
    console.log('   // The downloaded file will be named:');
    console.log('   // 2023_CS101_Course_Analysis_Report.pdf');
    console.log('');
    
    // Example 6: Benefits summary
    console.log('🎯 Benefits of the new naming convention:');
    console.log('   1. 📁 Consistent file organization');
    console.log('   2. 🔍 Easy pattern-based searching');
    console.log('   3. 📚 Clear academic context');
    console.log('   4. 🎯 Intuitive file identification');
    console.log('   5. 📊 Better file management');
    console.log('   6. 🔄 Consistent across all file types');
    console.log('');
    
    console.log('✅ Demonstration completed!');
    console.log('🚀 Your files will now be automatically named using this convention.');
    console.log('🔍 Use the search endpoints to find files by pattern.');
    console.log('📱 Update your frontend to display the new filenames.');
    
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateNewNaming();
}

module.exports = { demonstrateNewNaming };
