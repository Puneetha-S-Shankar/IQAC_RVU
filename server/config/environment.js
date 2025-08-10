require('dotenv').config();

const environment = {
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/iqac_rvu',
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // File System Configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  
  // GridFS Configuration
  MASTER_BUCKET_NAME: 'master-files',
  MASTER_COLLECTION_NAME: 'master_files',
  
  // Security Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // File Naming Convention
  FILE_NAMING_FORMAT: 'year_course.code_file.name',
  
  // Migration Configuration
  ENABLE_MIGRATION: process.env.ENABLE_MIGRATION === 'true' || false,
  MIGRATION_BATCH_SIZE: parseInt(process.env.MIGRATION_BATCH_SIZE) || 100
};

// Validation
if (!environment.MONGODB_URI) {
  console.warn('⚠️  Warning: MONGODB_URI not set, using default localhost');
}

if (environment.NODE_ENV === 'production' && environment.JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️  Warning: Using default JWT secret in production!');
}

module.exports = environment;
