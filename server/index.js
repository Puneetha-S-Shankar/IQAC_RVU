const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mongoose connection
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'IQAC API is running',
    version: '1.0.0',
    database: 'MongoDB Atlas'
  });
});

// Routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: MongoDB Atlas`);
  console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
}); 