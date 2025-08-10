# 📁 IQAC File Storage System - Simplified Current System

**Last Updated**: August 11, 2025  
**System Version**: Simplified Direct Assignment  
**Database**: Unified MongoDB with Single GridFS Bucket

## 🎯 **CURRENT UNIFIED SYSTEM**

### **Single Database Structure**
```
IQAC Database (MongoDB Atlas)
├── 📁 Collections
│   ├── users          # User accounts with direct course tracking
│   ├── tasks          # Direct task assignments
│   ├── files          # File metadata
│   └── notifications  # Workflow notifications
│
└── 📁 GridFS Buckets
    └── master-files    # UNIFIED bucket for all documents
        ├── master-files.files   # File metadata
        └── master-files.chunks  # File data chunks
```

### **Unified File Storage (Single Bucket)**

**All files now stored in `master-files` bucket with standardized naming:**
```
master-files/
├── 2024_CS101_syllabus.pdf
├── 2024_CS201_assignment.pdf  
├── 2025_EC301_curriculum.pdf
└── 2025_ME101_handbook.pdf

Format: {year}_{courseCode}_{description}.{extension}
```

## 🔄 **FILE WORKFLOW (Simplified)**

### **Document Upload Process**
```javascript
// 1. User uploads file via task assignment
POST /api/files/upload
{
  taskId: "task_id",
  file: multipart_file
}

// 2. File stored in master-files bucket
// 3. Metadata saved to files collection
// 4. Task updated with fileId reference
// 5. Direct assignment notification sent
```

### **File Metadata Structure**
```javascript
{
  _id: ObjectId("unique_file_id"),
  filename: "2024_CS101_syllabus.pdf",
  originalName: "Course_Syllabus.pdf",
  uploadedBy: ObjectId("user_id"),
  taskId: ObjectId("task_id"),
  courseCode: "CS101",
  year: "2024",
  fileSize: 1024000,
  mimeType: "application/pdf",
  uploadedAt: Date,
  gridFSId: ObjectId("gridfs_id"),
  status: "pending|approved|rejected"
}
```

## 🎯 **ACCESS CONTROL (Simple)**

### **File Access Rules**
```javascript
// One-line access control
function canUserAccessFile(file, userId, userRole) {
  return file.uploadedBy.equals(userId) || 
         task.assignedToInitiator.equals(userId) ||
         task.assignedToReviewer.equals(userId) ||
         userRole === 'admin';
}
```

### **File Operations**
- **Upload**: Only task assignees (initiator/reviewer)
- **View**: Task assignees + admin
- **Download**: Task assignees + admin  
- **Delete**: Admin only

## 🔧 **API ENDPOINTS (Current)**

### **File Management**
```javascript
POST   /api/files/upload        # Upload file to task
GET    /api/files/:fileId       # View/download file
DELETE /api/files/:fileId       # Delete file (admin)
GET    /api/files/task/:taskId  # Get files for task
PUT    /api/files/:fileId/approve  # Approve file
PUT    /api/files/:fileId/reject   # Reject file
```

### **Unified File Service**
```javascript
GET    /api/unifiedFiles/        # List all files (admin)
GET    /api/unifiedFiles/:fileId # Get specific file
POST   /api/unifiedFiles/upload  # Alternative upload endpoint
```

## 📊 **CURRENT FILE DISTRIBUTION**

Based on database scan, current files:
```
✅ master-files bucket: ALL files consolidated
❌ files bucket: DEPRECATED (old system)
❌ uploads bucket: DEPRECATED (old system)

File Count: ~13 files total
Storage: GridFS with 255KB chunks
Database: Single IQAC database
```

## 🚀 **BENEFITS OF UNIFIED SYSTEM**

### **Performance**
- ✅ **Single bucket lookup** - No multiple bucket searching
- ✅ **Direct file access** - No complex routing
- ✅ **Fast queries** - Simple file metadata searches
- ✅ **Reduced complexity** - One storage pattern

### **Maintenance**
- ✅ **Easy backup** - Single bucket to backup
- ✅ **Simple cleanup** - One location for all files
- ✅ **Clear file naming** - Year_Course_Description format
- ✅ **Unified permissions** - Same access control for all files

## 🔍 **FILE IDENTIFICATION**

### **How to Find Files**
```javascript
// By task assignment
const files = await File.find({ taskId: taskId });

// By course
const files = await File.find({ courseCode: "CS101" });

// By user upload
const files = await File.find({ uploadedBy: userId });

// By year
const files = await File.find({ year: "2024" });
```

### **Download URL Pattern**
```
http://localhost:5000/api/files/{fileId}/download
```

## 📝 **MIGRATION STATUS**

### **Completed**
- ✅ All files moved to master-files bucket
- ✅ Single file metadata collection
- ✅ Unified API endpoints
- ✅ Direct task-file relationships
- ✅ Simplified access control

### **Deprecated Systems**
- ❌ Multiple GridFS buckets (files, uploads)
- ❌ Complex programme/batch/semester metadata
- ❌ Separate curriculum vs assignment storage
- ❌ Complex file routing logic

## 🛠️ **DEVELOPER REFERENCE**

### **File Upload Example**
```javascript
// Frontend
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('taskId', currentTaskId);

const response = await fetch('/api/files/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### **File Display Example**
```javascript
// Get files for current task
const files = await fetch(`/api/files/task/${taskId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Display download link
const downloadUrl = `/api/files/${file._id}`;
```

---

**🎯 System Status**: Unified and Simplified  
**📁 Storage**: Single master-files bucket  
**🔒 Access**: Direct assignment based  
**⚡ Performance**: Optimized for speed  
**🧪 Status**: Production Ready
