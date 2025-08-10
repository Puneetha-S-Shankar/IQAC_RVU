const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  // Basic file information
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  
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

// Pre-save middleware
fileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
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

// Include virtuals when converting to JSON
fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('File', fileSchema);
