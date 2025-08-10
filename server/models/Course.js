const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'syllabus',
      'lesson_plan', 
      'course_file',
      'cie_marks',
      'see_marks',
      'question_paper',
      'answer_key',
      'course_outcome',
      'program_outcome',
      'co_po_mapping',
      'attainment_report'
    ]
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'under_review', 'approved', 'rejected'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  reviewDocumentId: {
    type: mongoose.Schema.Types.ObjectId, // Consolidated review comments PDF
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  reviews: [{
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comments: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const courseSchema = new mongoose.Schema({
  // Master identifier: year_courseCode (e.g., 2022_CS101)
  courseId: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{4}_[A-Z]{2,4}\d{3}$/ // Format: YYYY_CCNNN
  },
  
  // Course details
  courseCode: {
    type: String,
    required: true,
    match: /^[A-Z]{2,4}\d{3}$/ // Format: CCNNN (e.g., CS101)
  },
  
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  
  year: {
    type: String,
    required: true,
    match: /^\d{4}$/ // Format: YYYY
  },
  
  // LTP Configuration (Lecture-Tutorial-Practical)
  ltp: {
    lecture: {
      type: Number,
      required: true,
      min: 0
    },
    tutorial: {
      type: Number,
      required: true,
      min: 0
    },
    practical: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  // Examination pattern (e.g., "70_30" for 70% external, 30% internal)
  examPattern: {
    type: String,
    required: true,
    match: /^\d{2}_\d{2}$/ // Format: NN_NN
  },
  
  // All documents for this course
  documents: [documentSchema],
  
  // Course metadata
  department: {
    type: String,
    required: true
  },
  
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  
  credits: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Course coordinators and faculty
  courseCoordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  faculty: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying (courseId unique already creates index)
courseSchema.index({ courseCode: 1, year: 1 });
courseSchema.index({ year: 1 });
courseSchema.index({ department: 1 });

// Static method to generate courseId
courseSchema.statics.generateCourseId = function(year, courseCode) {
  return `${year}_${courseCode}`;
};

// Static method to parse courseId
courseSchema.statics.parseCourseId = function(courseId) {
  const [year, courseCode] = courseId.split('_');
  return { year, courseCode };
};

// Method to get all documents by type
courseSchema.methods.getDocumentsByType = function(type) {
  return this.documents.filter(doc => doc.type === type);
};

// Method to get approved documents only
courseSchema.methods.getApprovedDocuments = function() {
  return this.documents.filter(doc => doc.status === 'approved');
};

// Method to add document
courseSchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

// Method to update document status
courseSchema.methods.updateDocumentStatus = function(documentId, status, reviewData = null) {
  const document = this.documents.id(documentId);
  if (document) {
    document.status = status;
    if (reviewData) {
      document.reviews.push(reviewData);
    }
    if (status === 'approved') {
      document.approvedAt = new Date();
    }
    return this.save();
  }
  throw new Error('Document not found');
};

module.exports = mongoose.model('Course', courseSchema);
