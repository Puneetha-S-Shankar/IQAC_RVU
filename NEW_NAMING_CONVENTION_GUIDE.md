# New File Naming Convention Guide

## Overview

The unified file system now implements a new naming convention: **"year_course.code_file.name"** for all saved files. This ensures consistent file identification and makes it easier to organize and retrieve files based on academic criteria.

## Naming Format

### Basic Structure
```
[year]_[courseCode]_[originalFileName].[extension]
```

### Examples
- `2023_CS101_Course_Analysis.pdf`
- `2024_CS102_Syllabus.pdf`
- `CS103_Assignment1.pdf` (when year is not specified)
- `2023_General_Document.docx`

### Rules
1. **Year**: 4-digit year (e.g., 2023, 2024)
2. **Course Code**: Course identifier (e.g., CS101, CS102)
3. **Underscore Separator**: `_` between components
4. **Original Filename**: Preserved from user upload
5. **Extension**: File extension maintained

## Implementation Details

### 1. File Upload Process

When a file is uploaded, the system automatically generates the new filename:

```javascript
// Example metadata
const metadata = {
  year: '2023',
  courseCode: 'CS101',
  programme: 'BTECH',
  category: 'curriculum'
};

// Original filename: "Course_Analysis.pdf"
// Generated filename: "2023_CS101_Course_Analysis.pdf"
```

### 2. GridFS Storage

Files are stored in the `master-files` GridFS bucket using the new formatted filename, while preserving the original filename in metadata.

### 3. Database Records

The `master_files` collection stores:
- `filename`: New formatted filename (e.g., "2023_CS101_Course_Analysis.pdf")
- `originalName`: Original uploaded filename (e.g., "Course_Analysis.pdf")
- `metadata`: Complete file information including year, courseCode, etc.

## API Endpoints

### 1. Upload File
**POST** `/api/unified-files/upload`

The system automatically applies the new naming convention during upload.

### 2. Download File
**GET** `/api/unified-files/:id/download`

Files are served with the new formatted filename in the `Content-Disposition` header.

### 3. Search by Naming Convention
**GET** `/api/unified-files/search-by-filename?pattern=2023_CS101`

Search for files using the new naming pattern.

### 4. General Search
**GET** `/api/unified-files/search?q=CS101`

Search across all file metadata.

## Search Patterns

### Supported Search Formats

1. **Full Pattern**: `2023_CS101`
   - Finds files from 2023 with course code CS101

2. **Year Only**: `2023`
   - Finds all files from 2023

3. **Course Code Only**: `CS101`
   - Finds all files with course code CS101

4. **Partial Pattern**: `CS101_Course`
   - Finds files with course code CS101 containing "Course" in filename

### Search Examples

```bash
# Find all 2023 files
GET /api/unified-files/search-by-filename?pattern=2023

# Find CS101 files
GET /api/unified-files/search-by-filename?pattern=CS101

# Find 2023 CS101 files
GET /api/unified-files/search-by-filename?pattern=2023_CS101

# Find files with "Course" in CS101
GET /api/unified-files/search-by-filename?pattern=CS101_Course
```

## Frontend Integration

### Displaying Filenames

When displaying files in the UI, use the `filename` field to show the new naming convention:

```javascript
// Example: Display file list
files.forEach(file => {
  console.log(`File: ${file.filename}`); // Shows: "2023_CS101_Course_Analysis.pdf"
  console.log(`Original: ${file.originalName}`); // Shows: "Course_Analysis.pdf"
});
```

### Search Interface

Provide a search input that accepts the new naming pattern:

```javascript
// Example search component
const handleSearch = async (searchPattern) => {
  const response = await fetch(`/api/unified-files/search-by-filename?pattern=${searchPattern}`);
  const data = await response.json();
  setSearchResults(data.files);
};
```

## Migration from Old System

### Existing Files

Files uploaded before the new naming convention will retain their original filenames. The system will:

1. Keep existing files unchanged
2. Apply new naming convention to new uploads
3. Provide backward compatibility for old filenames

### Updating Existing Files

To update existing files to use the new naming convention:

1. Use the migration script to process existing files
2. Update metadata to include year and courseCode
3. Regenerate filenames using the new convention

## Benefits

### 1. **Consistent Organization**
- All files follow the same naming pattern
- Easy to identify academic context
- Clear file categorization

### 2. **Improved Searchability**
- Search by year, course, or combination
- Pattern-based file discovery
- Efficient database queries

### 3. **Better User Experience**
- Intuitive file identification
- Consistent file display
- Easy file management

### 4. **Academic Context**
- Year-based organization
- Course-specific grouping
- Clear file relationships

## Testing

### Test Script

Run the test script to verify the new naming convention:

```bash
cd server
node test-new-naming-convention.js
```

### Manual Testing

1. **Upload Test Files**
   - Upload files with different metadata combinations
   - Verify filename generation

2. **Search Testing**
   - Test various search patterns
   - Verify search results

3. **Download Testing**
   - Download files and verify filename display
   - Check Content-Disposition headers

## Troubleshooting

### Common Issues

1. **Missing Metadata**
   - Ensure year and courseCode are provided during upload
   - Check metadata validation

2. **Search Not Working**
   - Verify search pattern format
   - Check database indexes

3. **Filename Mismatch**
   - Confirm metadata is correctly set
   - Check file upload process

### Debug Information

Enable debug logging to troubleshoot issues:

```javascript
// In unifiedFileService.js
console.log('Generated filename:', formattedFilename);
console.log('Metadata:', metadata);
```

## Future Enhancements

### Potential Improvements

1. **Batch Renaming**
   - Tool to rename existing files
   - Bulk metadata updates

2. **Advanced Patterns**
   - Support for additional separators
   - Custom naming rules

3. **Validation Rules**
   - Strict format validation
   - Custom format requirements

## Conclusion

The new naming convention provides a robust, scalable solution for file organization in the unified file system. It ensures consistency, improves searchability, and enhances the overall user experience while maintaining backward compatibility.

For questions or issues, refer to the API documentation or contact the development team.
