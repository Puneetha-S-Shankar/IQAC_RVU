const mongoose = require('mongoose');
const UnifiedFileService = require('./services/unifiedFileService');
const File = require('./models/File');

// Test the new naming convention
async function testNewNamingConvention() {
  try {
    console.log('🧪 Testing new file naming convention...\n');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/iqac_rvu', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Test filename generation
    console.log('📝 Testing filename generation:');
    
    const testCases = [
      {
        metadata: { year: '2023', courseCode: 'CS101' },
        originalName: 'Course_Analysis.pdf',
        expected: '2023_CS101_Course_Analysis.pdf'
      },
      {
        metadata: { year: '2024', courseCode: 'CS102' },
        originalName: 'Syllabus.pdf',
        expected: '2024_CS102_Syllabus.pdf'
      },
      {
        metadata: { courseCode: 'CS103' },
        originalName: 'Assignment1.pdf',
        expected: 'CS103_Assignment1.pdf'
      },
      {
        metadata: { year: '2023' },
        originalName: 'General_Document.docx',
        expected: '2023_General_Document.docx'
      }
    ];
    
    const unifiedFileService = new UnifiedFileService();
    
    testCases.forEach((testCase, index) => {
      const generatedFilename = unifiedFileService.generateFormattedFilename(
        testCase.metadata, 
        testCase.originalName
      );
      
      const status = generatedFilename === testCase.expected ? '✅' : '❌';
      console.log(`${status} Test ${index + 1}:`);
      console.log(`   Metadata: ${JSON.stringify(testCase.metadata)}`);
      console.log(`   Original: ${testCase.originalName}`);
      console.log(`   Expected: ${testCase.expected}`);
      console.log(`   Generated: ${generatedFilename}`);
      console.log('');
    });
    
    // Test searching by formatted filename
    console.log('🔍 Testing search by formatted filename:');
    
    // Create some test files with the new naming convention
    const testFiles = [
      {
        filename: '2023_CS101_Course_Analysis.pdf',
        originalName: 'Course_Analysis.pdf',
        contentType: 'application/pdf',
        size: 1024,
        metadata: {
          category: 'curriculum',
          year: '2023',
          courseCode: 'CS101',
          docType: 'Course Analysis',
          programme: 'BTECH',
          uploadedBy: new mongoose.Types.ObjectId(),
          gridfsId: new mongoose.Types.ObjectId(),
          gridfsBucket: 'master-files'
        }
      },
      {
        filename: '2024_CS102_Syllabus.pdf',
        originalName: 'Syllabus.pdf',
        contentType: 'application/pdf',
        size: 2048,
        metadata: {
          category: 'syllabus',
          year: '2024',
          courseCode: 'CS102',
          docType: 'Syllabus',
          programme: 'BTECH',
          uploadedBy: new mongoose.Types.ObjectId(),
          gridfsId: new mongoose.Types.ObjectId(),
          gridfsBucket: 'master-files'
        }
      }
    ];
    
    // Save test files
    for (const testFile of testFiles) {
      const file = new File(testFile);
      await file.save();
      console.log(`✅ Created test file: ${testFile.filename}`);
    }
    
    console.log('');
    
    // Test searches
    const searchTests = [
      '2023_CS101',
      'CS102',
      '2024',
      'CS101_Course'
    ];
    
    for (const searchPattern of searchTests) {
      console.log(`🔍 Searching for: "${searchPattern}"`);
      const results = await unifiedFileService.searchByFormattedFilename(searchPattern);
      console.log(`   Found ${results.length} files:`);
      results.forEach(file => {
        console.log(`   - ${file.filename} (${file.metadata.docType})`);
      });
      console.log('');
    }
    
    // Test static method
    console.log('📚 Testing static method:');
    const staticResults = await File.findByFormattedFilename('2023_CS101');
    console.log(`   Static method found ${staticResults.length} files for "2023_CS101"`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test files
    try {
      await File.deleteMany({ 
        filename: { 
          $in: ['2023_CS101_Course_Analysis.pdf', '2024_CS102_Syllabus.pdf'] 
        } 
      });
      console.log('🧹 Cleaned up test files');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup failed:', cleanupError.message);
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testNewNamingConvention();
}

module.exports = { testNewNamingConvention };
