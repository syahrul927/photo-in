// Client-safe utility functions for Google Drive URLs

// Generate a direct image URL that can be used in img tags
// For public files, use the uc endpoint with export=view
export function generateDirectImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// Generate a thumbnail URL
// For public files, use the thumbnail endpoint
export function generateThumbnailUrl(fileId: string, size = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`;
}

// Generate a direct download URL (alternative approach)
export function generateDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// Generate URL from webContentLink (if available from API)
export function getImageUrlFromWebContentLink(webContentLink: string): string {
  // webContentLink format: https://drive.google.com/uc?id=FILE_ID&export=download
  // We need to change export=download to export=view for images
  return webContentLink.replace('export=download', 'export=view');
}

// Note: Proxy endpoint removed - now using direct Google Drive URLs