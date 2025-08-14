const mongoose = require('mongoose');
const File = require('./models/File');

// Test fileID generation
async function testFileIDGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://samarthkadam2004:IqcQfzpyEXllLxm2@cluster0.iqkur.mongodb.net/iqac-system?retryWrites=true&w=majority');
    
    console.log('Connected to MongoDB');
    
    // Test case 1: Complete metadata
    const testFile1 = new File({
      filename: 'test-syllabus.pdf',
      gridfsFileId: new mongoose.Types.ObjectId(),
      metadata: {
        year: '2024',
        courseCode: 'CS101',
        docType: 'syllabus',
        programme: 'Computer Science',
        semester: '3'
      }
    });
    
    console.log('Test 1 - Before save:');
    console.log('fileID:', testFile1.fileID);
    
    await testFile1.save();
    
    console.log('Test 1 - After save:');
    console.log('fileID:', testFile1.fileID);
    console.log('Generated ID should be: 2024_CS101_syllabus');
    
    // Test case 2: Minimal metadata
    const testFile2 = new File({
      filename: 'assignment.pdf',
      gridfsFileId: new mongoose.Types.ObjectId(),
      metadata: {
        year: '2023',
        courseCode: 'MATH 205',
        docType: 'assignment submission'
      }
    });
    
    console.log('\nTest 2 - Before save:');
    console.log('fileID:', testFile2.fileID);
    
    await testFile2.save();
    
    console.log('Test 2 - After save:');
    console.log('fileID:', testFile2.fileID);
    console.log('Generated ID should be: 2023_MATH205_assignmentsubmission');
    
    // Test case 3: Insufficient metadata
    const testFile3 = new File({
      filename: 'document.pdf',
      gridfsFileId: new mongoose.Types.ObjectId(),
      metadata: {
        year: '2024',
        // Missing courseCode and docType
      }
    });
    
    console.log('\nTest 3 - Before save (insufficient metadata):');
    console.log('fileID:', testFile3.fileID);
    
    await testFile3.save();
    
    console.log('Test 3 - After save:');
    console.log('fileID:', testFile3.fileID);
    console.log('Should be null due to insufficient metadata');
    
    // Cleanup test files
    await File.deleteMany({ filename: { $in: ['test-syllabus.pdf', 'assignment.pdf', 'document.pdf'] } });
    console.log('\nTest files cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testFileIDGeneration();
