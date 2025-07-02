const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'IQAC API is running',
    version: '1.0.0',
    database: 'JSON File System'
  });
});

// Routes
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const database = require('./utils/database');
    const stats = await database.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Backup endpoint
app.post('/api/backup', async (req, res) => {
  try {
    const database = require('./utils/database');
    const backupPath = await database.backup();
    res.json({ 
      message: 'Backup created successfully',
      backupPath: path.basename(backupPath)
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Server error during backup' });
  }
});

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
  console.log(`Database: JSON File System`);
  console.log(`Upload directory: ${path.join(__dirname, 'uploads')}`);
}); 