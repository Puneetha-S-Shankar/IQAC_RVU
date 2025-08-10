# MongoDB Setup Guide

## Overview
This guide will help you set up MongoDB Atlas for the IQAC application with GridFS for file storage.

## Prerequisites

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier recommended)
4. Set up database access:
   - Create a database user with username/password
   - Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)
5. Get your connection string from the cluster

### 2. Environment Configuration

Create a `.env` file in the server directory:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/iqac?retryWrites=true&w=majority

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important**: Replace the MongoDB URI with your actual Atlas connection string.

## Installation Steps

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set up Database
```bash
npm run setup
```

This will:
- Connect to MongoDB Atlas
- Create necessary collections
- Create default users (admin, user, viewer)
- Set up indexes for better performance

### 3. Start the Server
```bash
npm run dev
```

The server will automatically:
- Connect to MongoDB Atlas
- Display connection status
- Be ready to handle requests

## Default Users

The setup script creates these default users:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | admin@iqac.com | admin123 | admin |
| user | user@iqac.com | user123 | user |
| viewer | viewer@iqac.com | viewer123 | viewer |

## File Storage with GridFS

### Features
- Files stored directly in MongoDB using GridFS
- Automatic metadata storage
- Better scalability and backup capabilities
- No local file system dependencies
- Support for large files (up to 10MB by default)

### File Operations
- Upload: `POST /api/files/upload`
- Download: `GET /api/files/:id/download`
- List: `GET /api/files`
- Update: `PUT /api/files/:id`
- Delete: `DELETE /api/files/:id`

## What You Need to Do Physically

### 1. MongoDB Atlas Setup
1. Create MongoDB Atlas account
2. Create a cluster
3. Set up database user
4. Configure IP whitelist
5. Get connection string

### 2. Environment Variables
Create the `.env` file with your MongoDB Atlas connection string.

### 3. Run Setup
Execute `npm run setup` to initialize the database.

## Benefits of MongoDB Atlas

1. **Cloud Managed**: No server maintenance required
2. **Scalability**: Automatic scaling based on usage
3. **Reliability**: 99.95% uptime SLA
4. **Security**: Built-in security features
5. **Backup**: Automated backups
6. **Monitoring**: Built-in monitoring and alerts

## Troubleshooting

### Connection Issues
- Check if MongoDB Atlas cluster is running
- Verify your connection string
- Ensure your IP is whitelisted
- Check network connectivity

### Setup Issues
- Check server logs for detailed error messages
- Verify MongoDB Atlas credentials
- Ensure proper environment variables

### File Upload Issues
- Check file size limits (currently 10MB)
- Verify file types are allowed
- Check GridFS bucket permissions

## Production Deployment

For production deployment:

1. **Use MongoDB Atlas** for managed database
2. **Set strong JWT_SECRET**
3. **Enable SSL/TLS** for database connections
4. **Set up proper backup strategies**
5. **Configure environment variables** properly
6. **Use PM2 or similar** for process management
7. **Set up proper CORS** for your domain

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - List files
- `GET /api/files/:id` - Get file details
- `GET /api/files/:id/download` - Download file
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete file

### Statistics
- `GET /api/stats` - Get database statistics

## Support

If you encounter issues:
1. Check the server logs
2. Verify MongoDB Atlas connection
3. Test with the provided endpoints
4. Review the setup status 