const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'user', 'viewer'], 
    default: 'viewer' 
  },
  subrole: {
    type: String,
    enum: ['initiator', 'reviewer', 'both', 'none'],
    default: 'none'
  },
  
  // SIMPLIFIED: Course IDs for admin reference only (not for access control)
  courseIds: [{ 
    type: String  // e.g., ["CS101", "CS201", "EC301"] - just for tracking
  }],
  
  department: { type: String }, // For organizing users
  isActive: { type: Boolean, default: true },
  isPasswordSet: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

// Virtual for full name
userSchema.virtual('name').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username || this.email;
});

// Method to add course ID for tracking
userSchema.methods.addCourseId = function(courseId) {
  if (!this.courseIds.includes(courseId)) {
    this.courseIds.push(courseId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove course ID
userSchema.methods.removeCourseId = function(courseId) {
  this.courseIds = this.courseIds.filter(id => id !== courseId);
  return this.save();
};

// Static method to find users by course (for admin reference)
userSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseIds: courseId, isActive: true });
};

// Include virtuals when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 