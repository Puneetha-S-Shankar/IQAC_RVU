# IQAC File Storage System - Complete Analysis

## Database Structure Overview

Your IQAC system uses **MongoDB Atlas** as the database with **GridFS** for file storage. Here's the complete breakdown:

### Database Collections
Based on the GridFS check, your database contains:

1. **files.chunks** - Stores file data chunks (GridFS system)
2. **files.files** - Stores file metadata (GridFS system)
3. **users** - User information and authentication
4. **tasks** - Assignment/task management
5. **reports** - System reports
6. **notifications** - User notifications
7. **curriculum** - Curriculum data
8. **uploads.files** - Assignment file metadata (GridFS system)
9. **uploads.chunks** - Assignment file data chunks (GridFS system)

## File Storage System

### Two GridFS Buckets

Your system uses **two separate GridFS buckets** for different purposes:

#### 1. **Files Bucket** (`files.files` & `files.chunks`)
- **Purpose**: Stores curriculum documents, syllabus, and general documents
- **Current Files**:
  - TECH_STACK.pdf (ID: 687db18bf2c1a3696ef66a89)
  - Tech stack.pdf (ID: 6880c6cda704e9aad77f4769)
  - TECH_STACK (1).pdf (ID: 6880ed58b1e94acdfdb3fcdf)
  - TECH_STACK (1).pdf (ID: 6880ee706107df44a3fb4196)
  - Tech stack (1) (1).pdf (ID: 688cbc0dd6f88c6cdae48f25)
  - All_Courses_Merged_Documents_2025-08-02 (1).pdf (ID: 688e25eeed578bfba76fa56a)

#### 2. **Uploads Bucket** (`uploads.files` & `uploads.chunks`)
- **Purpose**: Stores assignment-related files (teaching-and-learning submissions)
- **Current Files**:
  - Course_Syllabus_Document_Copy.pdf (ID: 688dcaad80571bcd22cf04a4)
  - Course_Document_2_Copy.pdf (ID: 688dcae4f6dd1c275138d630)

## How Your BTECH 2023 CS101 Course Analysis File Gets Stored

When you upload a file in "Course Documents" → "BTECH 2023" → "1st year" → "cs101" → "Course Analysis", here's what happens:

### 1. **Frontend Process** (ProgramPage.jsx)
```javascript
// File metadata is constructed
const metadata = {
  programme: "BTECH",        // From program selection
  docLevel: "course",        // Automatically set for course documents
  year: "2023",             // From year dropdown
  batch: "1st year",        // From batch dropdown
  semester: "1st year",     // Same as batch
  docType: "Course Analysis" // From document type dropdown
}
```

### 2. **Server Processing** (files.js route)
The file gets uploaded to the **files bucket** with this structure:

#### File Metadata Structure:
```javascript
{
  _id: ObjectId("unique_file_id"),
  filename: "original_filename.pdf",
  contentType: "application/pdf",
  length: file_size_in_bytes,
  uploadDate: ISODate("upload_timestamp"),
  metadata: {
    originalName: "Course_Analysis_Document.pdf",
    uploadedBy: "admin_or_user_id",
    category: "general",
    description: "",
    tags: [],
    programme: "BTECH",
    docLevel: "course",
    year: "2023",
    batch: "1st year",
    semester: "1st year",
    docType: "Course Analysis",
    uploadedAt: ISODate("timestamp"),
    uploadDate: "2025-08-07T...",
    size: file_size_in_bytes,
    contentType: "application/pdf",
    status: "pending",
    taskId: null
  }
}
```

### 3. **File Identification System**

#### Primary Identifiers:
1. **MongoDB ObjectId**: Unique 24-character hexadecimal string (e.g., `687db18bf2c1a3696ef66a89`)
2. **Metadata Combination**: The system uses metadata fields to find specific files:
   - `programme` + `docLevel` + `year` + `batch` + `semester` + `docType`

#### Search Query Example:
```javascript
// To find your CS101 Course Analysis file:
const query = {
  'metadata.programme': 'BTECH',
  'metadata.docLevel': 'course',
  'metadata.year': '2023',
  'metadata.batch': '1st year',
  'metadata.semester': '1st year',
  'metadata.docType': 'Course Analysis'
}
```

### 4. **Physical Storage**

#### MongoDB Atlas (Cloud):
- **Database**: Connected via `process.env.MONGODB_URI`
- **File Storage**: GridFS splits large files into 255KB chunks
- **Collection Structure**:
  - `files.files` → Metadata
  - `files.chunks` → Actual file data pieces

#### Local Server (Fallback):
- **Directory**: `server/uploads/`
- **Current Files**: 
  - `file-1751986245833-688371051.pdf`
  - `file-1751986534359-63339625.pdf`

## Assignment vs General Files

### Assignment Files (Teaching & Learning):
- **Bucket**: `uploads` bucket
- **Metadata**: Includes `assignmentId`, `uploaderEmail`, `courseCode`
- **Connected to**: `tasks` collection via `taskId`
- **Status Tracking**: `assigned` → `file-uploaded` → `approved`/`rejected`

### General Files (Curriculum):
- **Bucket**: `files` bucket  
- **Metadata**: Programme, year, batch, document type
- **Purpose**: Curriculum documents, syllabus, general resources

## File Access & Download

### API Endpoints:
1. **Upload**: `POST /api/files/upload`
2. **View/Download**: `GET /api/files/:id/download`
3. **Metadata**: `GET /api/files/:id`
4. **List Files**: `GET /api/files?programme=BTECH&year=2023...`

### Download Process:
```javascript
// Frontend URL construction
const fileUrl = `http://localhost:5000/api/files/${file._id}/download`;

// Backend serves file stream
const downloadStream = bucket.openDownloadStream(file._id);
downloadStream.pipe(response);
```

## User Assignment Connection

### Current Users & Assignments:
From the database check, you have:

#### Users:
- `test3@iqac.com` (Course: CS101, Role: user)
- `test4@iqac.com` (Course: CS101, Role: user)
- `test5@iqac.com` (Course: CS101, Role: user)

#### Completed Assignments:
1. **Course Document 2** - CS101
   - Initiator: test3@iqac.com
   - Reviewer: test4@iqac.com
   - File: Yes (in uploads bucket)

2. **Course Syllabus Document** - CS101
   - Initiator: test4@iqac.com
   - Reviewer: test3@iqac.com
   - File: Yes (in uploads bucket)

3. **Course Document 3** - CS101
   - Initiator: test3@iqac.com
   - Reviewer: test4@iqac.com
   - File: Yes (in uploads bucket)

## Security & Access Control

### File Access:
- **Authentication**: JWT token required
- **Role-based**: Admin can upload, users can view/download
- **File Validation**: MIME type checking, size limits (10MB)

### Supported File Types:
- PDF, Word Documents, Excel, PowerPoint
- Images (JPEG, PNG, GIF)
- Text files

## Summary

When you upload a file to "BTECH 2023 1st year cs101 Course Analysis":

1. **File gets stored** in MongoDB Atlas GridFS `files` bucket
2. **Unique ID** is generated (24-character ObjectId)
3. **Metadata includes** all your selection criteria
4. **System finds it** using the combination of programme + year + batch + docType
5. **Download URL** becomes `http://localhost:5000/api/files/{ObjectId}/download`
6. **File chunks** are stored across multiple documents for efficient retrieval

The system is designed to handle both general curriculum documents and assignment-specific files with different workflows and storage strategies.
