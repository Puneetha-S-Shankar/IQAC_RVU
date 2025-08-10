# Environment Setup Guide

## 🚀 Quick Start

### 1. Create Environment File
Create a `.env` file in the `server` folder with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/iqac_rvu
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
```

### 2. Install Dependencies
```bash
cd server
npm install
```

### 3. Start the Server
```bash
npm start
# or for development with auto-restart:
npm run dev
```

## 🔧 Environment Variables

### Required Variables
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/iqac_rvu` | `mongodb+srv://user:pass@cluster.mongodb.net/iqac_rvu` |
| `PORT` | Server port | `5000` | `3000` |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Optional Variables
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `JWT_SECRET` | JWT signing secret | `your-secret-key-change-in-production` | `my-super-secret-key-123` |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` | `7d` |
| `CORS_ORIGIN` | Frontend origin | `http://localhost:5173` | `https://yourdomain.com` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) | `20971520` (20MB) |
| `LOG_LEVEL` | Logging level | `info` | `debug` |

## 🗄️ Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `iqac_rvu`

### MongoDB Atlas (Cloud)
1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🔍 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. API Status
```bash
curl http://localhost:5000/
```

### 3. Test Migration
```bash
npm run migrate:status
```

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
- Check if MongoDB is running
- Verify connection string in `.env`
- Check network/firewall settings

#### 2. Port Already in Use
- Change `PORT` in `.env`
- Kill process using the port: `netstat -ano | findstr :5000`

#### 3. CORS Issues
- Verify `CORS_ORIGIN` matches your frontend URL
- Check browser console for CORS errors

#### 4. File Upload Issues
- Check `MAX_FILE_SIZE` setting
- Verify file type is in allowed list
- Check disk space

### Debug Mode
Set `LOG_LEVEL=debug` in `.env` for detailed logging.

## 🔐 Security Notes

1. **Never commit `.env` files** to version control
2. **Change default JWT secret** in production
3. **Use strong passwords** for database
4. **Enable SSL/TLS** in production
5. **Set appropriate CORS origins** for production

## 📁 File Structure

```
server/
├── .env                    # Environment variables (create this)
├── .env.example           # Example environment file
├── config/
│   ├── database.js        # Database configuration
│   └── environment.js     # Environment settings
├── services/
│   └── unifiedFileService.js
├── routes/
│   └── unifiedFiles.js
└── index.js               # Main server file
```

## 🎯 Next Steps

After setup:
1. Test the server: `npm start`
2. Check health: `npm run health`
3. Run migration: `npm run migrate`
4. Test file operations
5. Update frontend to use new API endpoints
