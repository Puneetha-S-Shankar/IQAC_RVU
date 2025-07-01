const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Multer storage (memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

let gfsBucket;

mongoose.connection.once('open', () => {
  const db = mongoose.connection.db;
  gfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
  console.log('GridFSBucket set up');
});

app.get('/', (req, res) => {
  res.send('API is running');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// File upload route
app.post('/api/upload/:programme', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!gfsBucket) return res.status(500).json({ error: 'GridFS not initialized' });

  const { programme } = req.params;
  const filename = `${programme}_${Date.now()}_${req.file.originalname}`;

  const uploadStream = gfsBucket.openUploadStream(filename, {
    metadata: {
      programme,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date(),
    },
  });

  uploadStream.end(req.file.buffer);

  uploadStream.on('finish', (file) => {
    res.status(201).json({ message: 'File uploaded', file });
  });

  uploadStream.on('error', (err) => {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  });
});

// List uploaded files
app.get('/api/files', async (req, res) => {
  if (!gfsBucket) return res.status(500).json({ error: 'GridFS not initialized' });
  const files = await gfsBucket.find().toArray();
  res.json(files);
});

// Download a file by id
app.get('/api/files/:id', async (req, res) => {
  if (!gfsBucket) return res.status(500).json({ error: 'GridFS not initialized' });
  const { id } = req.params;
  try {
    const _id = new mongoose.Types.ObjectId(id);
    const downloadStream = gfsBucket.openDownloadStream(_id);
    downloadStream.on('error', () => res.status(404).json({ error: 'File not found' }));
    res.set('Content-Type', 'application/octet-stream');
    downloadStream.pipe(res);
  } catch (err) {
    res.status(400).json({ error: 'Invalid file id' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 