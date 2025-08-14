// Simple test without MongoDB connection
function generateFileID(metadata) {
  if (!metadata || !metadata.year || !metadata.courseCode || !metadata.docType) {
    return null;
  }

  const cleanString = (str) => {
    return str.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const parts = [
    metadata.year,
    cleanString(metadata.courseCode),
    cleanString(metadata.docType)
  ].filter(part => part && part.length > 0);

  if (parts.length < 2) {
    return null;
  }

  return parts.join('_');
}

// Test cases
console.log('Testing fileID generation...\n');

// Test 1: Complete metadata
const test1 = {
  year: '2024',
  courseCode: 'CS101',
  docType: 'syllabus'
};
console.log('Test 1:', generateFileID(test1));
console.log('Expected: 2024_cs101_syllabus\n');

// Test 2: With special characters
const test2 = {
  year: '2023',
  courseCode: 'MATH 205',
  docType: 'assignment submission'
};
console.log('Test 2:', generateFileID(test2));
console.log('Expected: 2023_math205_assignmentsubmission\n');

// Test 3: Insufficient metadata
const test3 = {
  year: '2024'
  // Missing courseCode and docType
};
console.log('Test 3:', generateFileID(test3));
console.log('Expected: null\n');

// Test 4: With numbers and special chars
const test4 = {
  year: '2024',
  courseCode: 'ENG-101A',
  docType: 'Mid-Term Exam'
};
console.log('Test 4:', generateFileID(test4));
console.log('Expected: 2024_eng101a_midtermexam\n');

console.log('fileID generation test completed!');
