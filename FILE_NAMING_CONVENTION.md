# File Naming Convention

## Overview
All files in the IQAC RVU system are now saved using a standardized naming convention: **`year_coursecode_docname.extension`**

## Format
```
YYYY_CCNNN_DocumentName.ext
```

### Components
- **YYYY**: 4-digit year (e.g., 2024, 2023)
- **CCNNN**: Course code (e.g., CS101, CS102, EC301)
- **DocumentName**: Document type/name (e.g., Syllabus, LessonPlan, CourseAnalysis)
- **ext**: File extension (e.g., .pdf, .docx, .xlsx)

## Examples

### Valid Filenames
- `2024_CS101_Syllabus.pdf`
- `2023_CS102_LessonPlan.docx`
- `2024_CS103_CourseAnalysis.pdf`
- `2024_EC301_Curriculum.pdf`
- `2023_ME101_Handbook.pdf`

### Invalid Filenames
- `Syllabus.pdf` (missing year and course code)
- `2024_Syllabus.pdf` (missing course code)
- `CS101_Syllabus.pdf` (missing year)
- `2024_CS101.pdf` (missing document name)

## Implementation Details

### Backend Changes
1. **UnifiedFileService.js**: Updated filename generation and parsing methods
2. **Environment.js**: Updated configuration to reflect new naming format
3. **README.md**: Updated documentation with new examples

### Methods Updated
- `generateMasterFilename()`: Now generates `year_coursecode_docname.ext`
- `generateFormattedFilename()`: Legacy method updated for consistency
- `parseMasterFilename()`: Updated regex to parse new format

### Regex Pattern
```javascript
/^(\d{4})_([A-Z]{2,4}\d{3})_([A-Za-z]+)\.(.+)$/
```

## Benefits

1. **Consistency**: All files follow the same naming pattern
2. **Searchability**: Easy to find files by year, course, or document type
3. **Organization**: Clear hierarchy in file structure
4. **Compatibility**: Works with existing file management systems
5. **Scalability**: Easy to add new courses and document types

## Usage

### When Uploading Files
The system automatically generates the correct filename based on:
- Year (from form or metadata)
- Course Code (from form or metadata)
- Document Name (from form or metadata)
- File Extension (from original file)

### When Searching Files
Users can search by:
- Year: `2024`
- Course Code: `CS101`
- Document Type: `Syllabus`
- Full pattern: `2024_CS101_Syllabus`

## Migration
- Existing files maintain their current names
- New uploads automatically use the new naming convention
- Legacy filename parsing still supported for backward compatibility

## Testing
The naming convention has been tested and verified to work correctly for:
- ✅ Filename generation
- ✅ Filename parsing
- ✅ Various file extensions
- ✅ Different course codes
- ✅ Different document types

## Support
For questions or issues with the file naming convention, please refer to:
- Backend: `server/services/unifiedFileService.js`
- Configuration: `server/config/environment.js`
- Documentation: This file and `README.md`
