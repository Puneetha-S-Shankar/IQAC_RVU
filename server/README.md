# IQAC Server - JSON Database System

This server uses a JSON file-based database system that mimics MongoDB structure for easy migration to MongoDB later.

## Features

- **JSON File Database**: MongoDB-like structure stored in `database.json`
- **File Storage**: Local file storage with metadata tracking
- **User Management**: Three user roles (admin, user, viewer)
- **Authentication**: Login/register system
- **File Upload/Download**: Complete file management system
- **Backup System**: Automatic database backups

## Database Structure

The `database.json` file contains:

```json
{
  "users": [...],
  "files": [...],
  "curriculum": [...],
  "reports": [...],
  "metadata": {...}
}
```

## Default Users

Three users are pre-configured:

1. **Admin User**
   - Username: `admin`
   - Email: `admin@iqac.com`
   - Password: `admin123`
   - Role: `admin`

2. **Regular User**
   - Username: `user`
   - Email: `user@iqac.com`
   - Password: `user123`
   - Role: `user`

3. **Viewer User**
   - Username: `viewer`
   - Email: `viewer@iqac.com`
   - Password: `viewer123`
   - Role: `viewer`

## API Endpoints

### Authentication (`/api/auth`)

- `POST /login` - User login
- `POST /register` - User registration
- `GET /profile/:id` - Get user profile
- `PUT /profile/:id` - Update user profile
- `GET /users` - Get all users (admin only)

### File Management (`/api/files`)

- `POST /upload` - Upload file
- `GET /` - Get all files (with filtering)
- `GET /:id` - Get file by ID
- `GET /:id/download` - Download file
- `PUT /:id` - Update file metadata
- `DELETE /:id` - Delete file
- `GET /categories/list` - Get file categories

### System

- `GET /api/stats` - Get database statistics
- `POST /api/backup` - Create database backup

## File Upload

Files are stored in the `uploads/` directory with the following metadata:

- Original filename
- Generated unique filename
- File size and type
- Upload timestamp
- Uploader information
- Categories and tags
- Description

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (optional):
   ```
   PORT=5000
   ```

3. Start the server:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Usage Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@iqac.com", "password": "admin123"}'
```

### Upload File
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -F "file=@document.pdf" \
  -F "category=curriculum" \
  -F "description=Course syllabus" \
  -F "tags=syllabus,course,2024"
```

### Get Files
```bash
curl http://localhost:5000/api/files?category=curriculum
```

## Database Operations

The database utility (`utils/database.js`) provides MongoDB-like operations:

- `findUser(query)` - Find user by criteria
- `createUser(userData)` - Create new user
- `updateUser(id, updateData)` - Update user
- `deleteUser(id)` - Delete user
- `saveFile(fileData)` - Save file metadata
- `findFile(query)` - Find files by criteria
- `updateFile(id, updateData)` - Update file metadata
- `deleteFile(id)` - Delete file and physical file

## File Storage

- Physical files stored in `uploads/` directory
- Metadata stored in `database.json`
- Automatic cleanup when files are deleted
- Support for common file types (PDF, DOC, XLS, images, etc.)

## Migration to MongoDB

The JSON structure is designed to be MongoDB-compatible:

1. Replace `database.js` with MongoDB connection
2. Update queries to use MongoDB syntax
3. Replace file storage with GridFS or cloud storage
4. Update routes to use MongoDB models

## Security Notes

- Passwords are stored in plain text (should be hashed in production)
- File uploads are validated for type and size
- File paths are sanitized to prevent directory traversal
- CORS is enabled for development

## Backup and Recovery

- Automatic backups with timestamp
- Manual backup via `/api/backup` endpoint
- Backup files stored in server directory
- Database can be restored by replacing `database.json` 