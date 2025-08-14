const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  // Basic file information
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  
  // Unique file identifier in format: year_coursecode_docname
  fileID: { type: String, unique: true, sparse: true },
  
  // Unified metadata - covers all file types
  metadata: {
    // File categorization
    category: { 
      type: String, 
      enum: ['curriculum', 'assignment', 'general', 'syllabus', 'course-document'],
      default: 'general'
    },
    
    // Academic structure
    programme: { type: String }, // BTECH, MTECH, etc.
    year: { type: String },      // 2023, 2024, etc.
    batch: { type: String },     // 1st year, 2nd year, etc.
    semester: { type: String },  // 1st semester, 2nd semester, etc.
    courseCode: { type: String }, // CS101, CS102, etc.
    courseName: { type: String }, // DSCA, Data Structures, etc.
    docLevel: { type: String },   // course, programme, department, etc.
    docType: { type: String },    // Course Analysis, Syllabus, etc.
    docNumber: { type: Number },  // For multiple documents of same type
    
    // Assignment specific (if applicable)
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    uploaderEmail: { type: String },
    reviewerEmail: { type: String },
    
    // General metadata
    description: { type: String },
    tags: [{ type: String }],
    status: { 
      type: String, 
      enum: ['pending', 'uploaded', 'in-review', 'approved', 'rejected', 'archived'],
      default: 'pending'
    },
    
    // Upload information
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    
    // Review information
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewComments: { type: String },
    
    // File location (GridFS bucket and ID)
    gridfsBucket: { type: String, default: 'master-files' },
    gridfsId: { type: mongoose.Schema.Types.ObjectId },
    
    // Version control
    version: { type: Number, default: 1 },
    isLatest: { type: Boolean, default: true },
    previousVersion: { type: mongoose.Schema.Types.ObjectId, ref: 'File' }
  },
  
  // System fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'master_files'
});

// Indexes for efficient querying
fileSchema.index({ 'metadata.category': 1 });
fileSchema.index({ 'metadata.programme': 1, 'metadata.year': 1, 'metadata.courseCode': 1 });
fileSchema.index({ 'metadata.assignmentId': 1 });
fileSchema.index({ 'metadata.uploadedBy': 1 });
fileSchema.index({ 'metadata.status': 1 });
fileSchema.index({ 'metadata.uploadedAt': -1 });
fileSchema.index({ filename: 1 }); // Index for filename searches
fileSchema.index({ fileID: 1 }); // Index for fileID searches

// Virtual for full academic path
fileSchema.virtual('academicPath').get(function() {
  const meta = this.metadata;
  const parts = [];
  
  if (meta.programme) parts.push(meta.programme);
  if (meta.year) parts.push(meta.year);
  if (meta.batch) parts.push(meta.batch);
  if (meta.courseCode) parts.push(meta.courseCode);
  if (meta.docType) parts.push(meta.docType);
  
  return parts.join(' → ');
});

// Virtual for file type
fileSchema.virtual('fileType').get(function() {
  if (this.metadata.category === 'assignment') return 'Assignment';
  if (this.metadata.category === 'curriculum') return 'Curriculum';
  if (this.metadata.category === 'syllabus') return 'Syllabus';
  return 'General';
});

// Method to generate fileID from metadata
fileSchema.methods.generateFileID = function() {
  const meta = this.metadata;
  const parts = [];
  
  // Add year if available
  if (meta.year) {
    parts.push(meta.year);
  }
  
  // Add course code if available
  if (meta.courseCode) {
    parts.push(meta.courseCode.replace(/\s+/g, '').toUpperCase());
  }
  
  // Add document name/type if available
  if (meta.docType) {
    parts.push(meta.docType.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''));
  } else if (meta.docLevel) {
    parts.push(meta.docLevel.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, ''));
  }
  
  // If we have at least 2 parts, create the fileID
  if (parts.length >= 2) {
    return parts.join('_');
  }
  
  return null;
};

// Pre-save middleware
fileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate fileID if not already set and we have the required metadata
  if (!this.fileID && this.metadata) {
    this.fileID = this.generateFileID();
  }
  
  // Generate academic path for easy searching
  if (this.metadata.programme && this.metadata.year && this.metadata.courseCode) {
    this.metadata.academicPath = this.academicPath;
  }
  
  next();
});

// Static method to find files by academic criteria
fileSchema.statics.findByAcademicCriteria = function(criteria) {
  const query = {};
  
  if (criteria.programme) query['metadata.programme'] = criteria.programme;
  if (criteria.year) query['metadata.year'] = criteria.year;
  if (criteria.batch) query['metadata.batch'] = criteria.batch;
  if (criteria.courseCode) query['metadata.courseCode'] = criteria.courseCode;
  if (criteria.docType) query['metadata.docType'] = criteria.docType;
  if (criteria.category) query['metadata.category'] = criteria.category;
  
  return this.find(query).sort({ 'metadata.uploadedAt': -1 });
};

// Static method to find assignment files
fileSchema.statics.findAssignmentFiles = function(assignmentId) {
  return this.find({ 'metadata.assignmentId': assignmentId });
};

// Static method to find curriculum files
fileSchema.statics.findCurriculumFiles = function(programme, year, courseCode) {
  const query = { 'metadata.category': 'curriculum' };
  
  if (programme) query['metadata.programme'] = programme;
  if (year) query['metadata.year'] = year;
  if (courseCode) query['metadata.courseCode'] = courseCode;
  
  return this.find(query).sort({ 'metadata.uploadedAt': -1 });
};

// Static method to find files by new naming convention
fileSchema.statics.findByFormattedFilename = function(searchPattern) {
  const parts = searchPattern.split('_');
  const query = {};
  
  if (parts.length >= 2) {
    // First part could be year or course code
    const firstPart = parts[0];
    const secondPart = parts[1];
    
    // Check if first part is a year (4 digits)
    if (/^\d{4}$/.test(firstPart)) {
      query['metadata.year'] = firstPart;
      if (secondPart) {
        query['metadata.courseCode'] = secondPart;
      }
    } else {
      // First part is course code
      query['metadata.courseCode'] = firstPart;
      if (secondPart) {
        // Second part could be year or part of filename
        if (/^\d{4}$/.test(secondPart)) {
          query['metadata.year'] = secondPart;
        }
      }
    }
  } else if (parts.length === 1) {
    // Single part search - could be year, course code, or filename
    const part = parts[0];
    if (/^\d{4}$/.test(part)) {
      query['metadata.year'] = part;
    } else {
      // Search in course code or filename
      query['$or'] = [
        { 'metadata.courseCode': { $regex: part, $options: 'i' } },
        { filename: { $regex: part, $options: 'i' } }
      ];
    }
  }
  
  return this.find(query).sort({ 'metadata.uploadedAt': -1 });
};

// Include virtuals when converting to JSON
fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('File', fileSchema);
