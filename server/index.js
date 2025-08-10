const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Import configurations
const environment = require('./config/environment');
const databaseConfig = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: environment.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
async function connectDatabase() {
  try {
    await databaseConfig.connect();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }
}

// Connect to database before starting server
connectDatabase();

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'IQAC API is running',
    version: '2.0.0',
    system: 'Unified File System',
    database: 'MongoDB Atlas',
    namingConvention: environment.FILE_NAMING_FORMAT,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: databaseConfig.isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const unifiedFileRoutes = require('./routes/unifiedFiles');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes); // Keep old routes for backward compatibility
app.use('/api/unified-files', unifiedFileRoutes); // New unified file system
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: environment.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      '/api/auth',
      '/api/files',
      '/api/unified-files',
      '/api/tasks',
      '/api/notifications',
      '/api/assignments'
    ],
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await databaseConfig.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await databaseConfig.disconnect();
  process.exit(0);
});

// Start server
app.listen(environment.PORT, () => {
  console.log(`🚀 Server running on port ${environment.PORT}`);
  console.log(`🌍 Environment: ${environment.NODE_ENV}`);
  console.log(`📊 Database: MongoDB Atlas`);
  console.log(`📦 Master GridFS bucket: ${environment.MASTER_BUCKET_NAME}`);
  console.log(`📁 File naming: ${environment.FILE_NAMING_FORMAT}`);
  console.log(`🔗 Frontend: ${environment.CORS_ORIGIN}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
}); 