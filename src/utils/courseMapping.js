// Course code to course name mapping
// Course code is the primary key
export const COURSE_MAP = {
  'CS101': 'Data Structures and Computer Algorithms (DSCA)',
  'CS102': 'Object Oriented Programming (OOP)',
  'CS103': 'Database Management Systems (DBMS)',
  'CS104': 'Computer Networks',
  'CS105': 'Operating Systems',
  'CS106': 'Software Engineering',
  'CS201': 'Advanced Data Structures',
  'CS202': 'Machine Learning',
  'CS203': 'Artificial Intelligence',
  'CS204': 'Web Technologies',
  'CS205': 'Mobile Application Development',
  'CS206': 'Cloud Computing',
  'IT101': 'Information Technology Fundamentals',
  'IT102': 'Network Security',
  'IT103': 'System Administration',
  'IT104': 'Cyber Security',
  'IT105': 'IT Project Management',
  'EC101': 'Electronic Circuits',
  'EC102': 'Digital Electronics',
  'EC103': 'Microprocessors',
  'EC104': 'Communication Systems',
  'EC105': 'VLSI Design',
  'ME101': 'Engineering Mechanics',
  'ME102': 'Thermodynamics',
  'ME103': 'Fluid Mechanics',
  'ME104': 'Machine Design',
  'ME105': 'Manufacturing Processes',
  'EE101': 'Electrical Circuits',
  'EE102': 'Power Systems',
  'EE103': 'Control Systems',
  'EE104': 'Electrical Machines',
  'EE105': 'Power Electronics'
};

// Helper functions
export const getCourseNameByCode = (courseCode) => {
  return COURSE_MAP[courseCode] || '';
};

export const getCourseCodeByName = (courseName) => {
  const entry = Object.entries(COURSE_MAP).find(([code, name]) => 
    name.toLowerCase() === courseName.toLowerCase()
  );
  return entry ? entry[0] : null;
};

export const getAllCourses = () => {
  return Object.entries(COURSE_MAP).map(([code, name]) => ({
    code,
    name,
    display: `${code} - ${name}`
  }));
};

export const isValidCourseCode = (courseCode) => {
  return courseCode in COURSE_MAP;
};

export const isValidCourseName = (courseName) => {
  return Object.values(COURSE_MAP).includes(courseName);
};
