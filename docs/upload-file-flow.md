# Direct Google Drive Upload Implementation

## Overview

This document outlines the implementation of a direct client-to-Google Drive upload system to overcome Vercel serverless function limitations (4MB request size, 10-second timeout).

## Current vs New Architecture

### Current Flow (Problematic)
```
Browser → Vercel API → Google Drive
(Limited by 4MB request size, 10s timeout)
```

### New Flow (Optimal)
```
Browser → Google Drive (direct upload)
       ↓
   Vercel API (metadata only)
```

## Technical Implementation

### Phase 1: Token Generation API

**Endpoint:** `POST /api/google-drive/upload-token`

**Purpose:** Generate temporary upload credentials for client-side direct upload

**Request:**
```typescript
{
  eventId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
```

**Response:**
```typescript
{
  uploadUrl: string;        // Google's resumable upload URL
  accessToken: string;      // Temporary access token
  expiresIn: number;        // Token expiry (3600 seconds)
  folderId: string;         // Target Google Drive folder ID
}
```

**Implementation Details:**
- Use existing OAuth credentials to create resumable upload session
- Generate short-lived access tokens (1 hour expiry)
- Validate user permissions for the event
- Create/verify event folder in Google Drive

### Phase 2: Client-Side Direct Upload

**Implementation:** Enhanced upload modal with direct Google Drive integration

**Features:**
- **Resumable Upload Protocol:** 8MB chunks for large files
- **Parallel Processing:** Multiple files upload simultaneously
- **Real-time Progress:** Chunk-by-chunk progress tracking
- **Error Recovery:** Automatic retry of failed chunks
- **Network Resilience:** Resume interrupted uploads

**Upload Flow:**
```typescript
async function uploadFileToGoogleDrive(file: File, eventId: string) {
  // 1. Get upload credentials from our API
  const { uploadUrl, accessToken } = await getUploadToken(file, eventId);
  
  // 2. Upload directly to Google Drive using resumable upload
  const googleResponse = await uploadFileResumable(file, uploadUrl, accessToken);
  
  // 3. Save metadata to our database
  await saveFileMetadata(eventId, googleResponse, file);
  
  // 4. Update UI with success
  showSuccessToast(file.name);
}
```

**Chunking Strategy:**
- **Chunk Size:** 8MB per chunk (optimal for most networks)
- **Concurrent Files:** 3 files uploading simultaneously
- **Progress Tracking:** Per-file and overall progress
- **Error Handling:** Retry failed chunks up to 3 times

### Phase 3: Metadata Completion API

**Endpoint:** `POST /api/google-drive/upload-complete`

**Purpose:** Save file metadata after successful direct upload

**Request:**
```typescript
{
  eventId: string;
  googleFileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  googleMetadata: {
    createdTime: string;
    webViewLink: string;
    webContentLink: string;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  photoId: string;
}
```

**Implementation Details:**
- Validate file exists in Google Drive (optional verification)
- Save metadata to database with `secure://` URL format
- Associate file with correct event and user
- Trigger gallery refresh

## Benefits

### Performance Improvements
- ✅ **No size limits** - Up to Google's 15GB per file limit
- ✅ **No timeout issues** - Direct upload bypasses serverless functions
- ✅ **Parallel uploads** - Multiple files simultaneously
- ✅ **Real progress tracking** - Chunk-by-chunk progress

### Reliability Enhancements
- ✅ **Resumable uploads** - Network interruption recovery
- ✅ **Automatic retries** - Failed chunk retry mechanism
- ✅ **Better error handling** - Specific error messages per file
- ✅ **Network resilience** - Handles poor connections gracefully

### Scalability Benefits
- ✅ **No server load** - Files don't go through Vercel
- ✅ **Unlimited concurrent uploads** - Not limited by serverless functions
- ✅ **Cost effective** - No bandwidth costs for file transfer
- ✅ **Global performance** - Uses Google's CDN infrastructure

## Use Cases Solved

### Case 1: Large Batch Uploads (1GB+ total)
**Example:** Wedding photographer uploading 500 photos (2GB total)
- **Current:** ❌ Impossible (4MB limit)
- **New:** ✅ 3 files upload simultaneously, ~10 minutes total

### Case 2: Large Single Files (>4MB)
**Example:** 4K video file (500MB)
- **Current:** ❌ Impossible (4MB limit)  
- **New:** ✅ 63 chunks of 8MB each, resumable upload

### Case 3: Mixed Content
**Example:** 100 photos + 5 videos (3GB total)
- **Current:** ❌ Impossible
- **New:** ✅ Photos upload quickly in parallel, videos use chunked upload

## Security Considerations

### Token Security
- **Short-lived tokens** - 1 hour expiry
- **Scoped permissions** - Upload only to specific event folder
- **User validation** - Verify user can upload to event
- **Secure transmission** - HTTPS only

### File Validation
- **Pre-upload validation** - File type and size checks
- **Post-upload verification** - Confirm file exists in Drive
- **Metadata integrity** - Match uploaded file with database
- **Access control** - Event-based permissions

## Error Handling

### Network Issues
- **Automatic resume** - Continue from last successful chunk
- **Retry mechanism** - Up to 3 retries per chunk
- **Progress persistence** - Maintain progress across interruptions

### File Issues
- **Size validation** - Check file size before upload
- **Type validation** - Ensure only images are uploaded
- **Corruption detection** - Verify file integrity

### User Feedback
- **Real-time progress** - Show upload percentage per file
- **Clear error messages** - Specific failure reasons
- **Recovery options** - Retry failed uploads
- **Success confirmation** - Individual file completion

## Migration Strategy

### Phase 1: Infrastructure Setup
- Implement token generation API
- Set up Google Drive resumable upload
- Create metadata completion API

### Phase 2: Client Implementation
- Update upload modal with direct upload
- Implement chunking and progress tracking
- Add error handling and retry logic

### Phase 3: Testing & Rollout
- Test with various file sizes and quantities
- Performance testing with large uploads
- Gradual rollout with fallback to current system

### Phase 4: Cleanup
- Remove old upload endpoints
- Clean up unused code
- Update documentation

## Configuration

### Chunking Settings
```typescript
const CHUNK_SIZE = 8 * 1024 * 1024;  // 8MB per chunk
const MAX_CONCURRENT_FILES = 3;       // 3 files simultaneously
const MAX_RETRIES = 3;                // 3 retries per chunk
const TOKEN_EXPIRY = 3600;            // 1 hour token expiry
```

### File Limits
```typescript
const MAX_FILE_SIZE = 15 * 1024 * 1024 * 1024; // 15GB (Google's limit)
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
```

## Monitoring & Analytics

### Success Metrics
- Upload success rate per file size category
- Average upload time per MB
- Chunk retry frequency
- User satisfaction scores

### Error Tracking
- Failed upload reasons
- Network interruption frequency
- Token expiry issues
- File validation failures

## Future Enhancements

### Potential Improvements
- **Background uploads** - Continue uploads when tab is closed
- **Batch operations** - Bulk file operations
- **Compression options** - Client-side image compression
- **Upload scheduling** - Queue uploads for optimal times

### Advanced Features
- **Duplicate detection** - Prevent duplicate uploads
- **Smart chunking** - Adaptive chunk sizes based on network
- **Bandwidth throttling** - Respect user's connection limits
- **Upload analytics** - Detailed performance metrics