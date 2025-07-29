# Test Direct Google Drive Upload

## Step 1: Generate Upload Token

**POST** `http://localhost:3000/api/test-google-drive/upload-token`

### Request Body (JSON):
```json
{
  "fileName": "test-photo.jpg",
  "fileSize": 1048576,
  "mimeType": "image/jpeg"
}
```

### Expected Response:
```json
{
  "success": true,
  "uploadUrl": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=...",
  "accessToken": "ya29.a0...",
  "expiresIn": 3600,
  "folderId": "your-folder-id",
  "instructions": {
    "method": "PUT",
    "headers": {
      "Authorization": "Bearer ya29.a0...",
      "Content-Type": "image/jpeg",
      "Content-Length": "1048576"
    },
    "note": "Use the uploadUrl with PUT method to upload your file directly to Google Drive"
  }
}
```

## Step 2: Upload File to Google Drive

Use the `uploadUrl` and `accessToken` from Step 1 response.

**PUT** `{uploadUrl from response}`

### Headers:
```
Authorization: Bearer {accessToken from response}
Content-Type: image/jpeg
Content-Length: 1048576
```

### Body:
- Select "Binary" in Postman
- Choose your test image file

### Expected Response:
```json
{
  "kind": "drive#file",
  "id": "1ABC123DEF456...",
  "name": "test-photo.jpg",
  "mimeType": "image/jpeg",
  "size": "1048576",
  "createdTime": "2024-01-15T10:30:00.000Z",
  "parents": ["your-folder-id"],
  "webViewLink": "https://drive.google.com/file/d/1ABC123DEF456/view",
  "webContentLink": "https://drive.google.com/uc?id=1ABC123DEF456&export=download"
}
```

## Postman Collection

### Request 1: Generate Token
```
Method: POST
URL: http://localhost:3000/api/test-google-drive/upload-token
Headers: 
  Content-Type: application/json
Body (raw JSON):
{
  "fileName": "test-photo.jpg",
  "fileSize": 1048576,
  "mimeType": "image/jpeg"
}
```

### Request 2: Upload File
```
Method: PUT
URL: {{uploadUrl}} (from previous response)
Headers:
  Authorization: Bearer {{accessToken}} (from previous response)
  Content-Type: image/jpeg
  Content-Length: 1048576
Body: Binary file
```

## Testing Different Scenarios

### Small File (1MB):
```json
{
  "fileName": "small-photo.jpg",
  "fileSize": 1048576,
  "mimeType": "image/jpeg"
}
```

### Large File (10MB):
```json
{
  "fileName": "large-photo.jpg",
  "fileSize": 10485760,
  "mimeType": "image/jpeg"
}
```

### Very Large File (100MB):
```json
{
  "fileName": "huge-photo.jpg",
  "fileSize": 104857600,
  "mimeType": "image/jpeg"
}
```

## Success Indicators

✅ **Step 1 Success**: You get `uploadUrl` and `accessToken`  
✅ **Step 2 Success**: File uploads and you get Google Drive file metadata  
✅ **File Visible**: Check your Google Drive folder - file should appear  
✅ **Large Files**: Files >4MB upload successfully (proving Vercel bypass)  

## Troubleshooting

### Common Issues:

**401 Unauthorized**: 
- Check if OAuth credentials are correct
- Verify token hasn't expired

**403 Forbidden**:
- Check Google Drive API permissions
- Verify folder access permissions

**400 Bad Request**:
- Check request body format
- Verify file size and mime type

**Upload URL Expired**:
- Generate new token (Step 1)
- Upload URLs expire after some time