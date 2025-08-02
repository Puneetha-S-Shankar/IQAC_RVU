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
    enum: ['initiator', 'reviewer', 'none'],
    default: 'none'
  },
  courseCode: { type: String }, // e.g., "CS101"
  courseName: { type: String }, // e.g., "DSCA"
  department: { type: String }, // For organizing users
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

// Virtual for full name
userSchema.virtual('name').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username || this.email;
});

// Include virtuals when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 