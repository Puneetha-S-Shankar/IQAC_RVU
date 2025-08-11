const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT middleware for protected routes
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Auth middleware - Header:', authHeader ? 'Present' : 'Missing');
  console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth middleware - Decoded:', decoded);
    
    // Add timeout and retry for database query
    const user = await Promise.race([
      User.findById(decoded.userId).select('-password').lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 15000)
      )
    ]);
    
    console.log('Auth middleware - User found:', user ? {
      id: user._id,
      email: user.email,
      role: user.role
    } : 'No user found');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    
    // Specific error handling for different types of errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    } else if (error.message === 'Database query timeout') {
      return res.status(503).json({ error: 'Database temporarily unavailable' });
    } else {
      return res.status(403).json({ error: 'Authentication failed' });
    }
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password, firstName, lastName, role, courseCode, courseName } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      username,
      email,
      password: hashedPassword, // Store hashed password
      firstName,
      lastName,
      role: role || 'user', // Use provided role or default to 'user'
      courseCode: courseCode || '',
      courseName: courseName || '',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    const user = await User.create(userData);
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        courseCode: user.courseCode,
        courseName: user.courseName
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Return user data and token
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.firstName + ' ' + user.lastName,
        role: user.role,
        subrole: user.subrole,
        courseCode: user.courseCode,
        courseName: user.courseName,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const updateData = { firstName, lastName, email };
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users); // Return array directly
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create admin user (development only)
router.post('/create-admin', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const adminData = {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    const admin = await User.create(adminData);
    res.status(201).json({ 
      message: 'Admin user created successfully',
      user: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Server error during admin creation' });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'user', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (admin only)
router.patch('/users/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated this way
    delete updateData.password;
    delete updateData._id;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected route to verify token and get user data
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        name: req.user.firstName + ' ' + req.user.lastName,
        role: req.user.role,
        subrole: req.user.subrole,
        courseCode: req.user.courseCode,
        courseName: req.user.courseName,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;