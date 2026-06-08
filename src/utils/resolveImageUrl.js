/**
 * Detects if a URL is a Google Drive asset and rewrites it to use our
 * server-side caching proxy API route on the Express backend (/api/drive/image?id=FILE_ID).
 * 
 * This ensures CORS-compliant and CDN-cached loading of images in
 * both standard <img> elements, html2canvas, and @react-pdf/renderer.
 */
export function resolveImageUrl(urlOrPath) {
  if (!urlOrPath || typeof urlOrPath !== "string") {
    return urlOrPath;
  }

  const baseURL = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:5000";
  const cleanBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;

  // Check if it looks like a Google Drive or googleusercontent URL
  if (
    urlOrPath.includes("drive.google.com") ||
    urlOrPath.includes("docs.google.com") ||
    urlOrPath.includes("googleusercontent.com")
  ) {
    try {
      const url = new URL(urlOrPath);
      let fileId = null;

      // Format 1: drive.google.com/file/d/FILE_ID/view...
      if (url.hostname.includes("drive.google.com")) {
        const parts = url.pathname.split("/");
        const dIndex = parts.indexOf("d");
        if (dIndex !== -1 && parts[dIndex + 1]) {
          fileId = parts[dIndex + 1];
        }
      }

      // Format 2: docs.google.com/uc?id=FILE_ID... or drive.google.com/open?id=FILE_ID...
      if (!fileId && url.searchParams.has("id")) {
        fileId = url.searchParams.get("id");
      }

      // Format 3: lh3.googleusercontent.com/d/FILE_ID
      if (!fileId && url.hostname.includes("googleusercontent.com")) {
        const parts = url.pathname.split("/");
        const dIndex = parts.indexOf("d");
        if (dIndex !== -1 && parts[dIndex + 1]) {
          fileId = parts[dIndex + 1];
        } else if (parts.length > 2) {
          // Sometimes it is /d/FILE_ID or just /FILE_ID
          fileId = parts[parts.length - 1];
        }
      }

      if (fileId && /^[a-zA-Z0-9_-]{28,45}$/.test(fileId)) {
        return `${cleanBaseURL}/api/drive/image?id=${fileId}`;
      }
    } catch (e) {
      // If URL parsing fails, check if the string contains a typical /d/FILE_ID pattern
      const driveMatch = urlOrPath.match(/\/d\/([a-zA-Z0-9_-]{28,45})/);
      if (driveMatch && driveMatch[1]) {
        return `${cleanBaseURL}/api/drive/image?id=${driveMatch[1]}`;
      }
    }
  }

  // Handle relative drive image paths (e.g. from an old DB migration or local reference)
  if (urlOrPath.startsWith("/api/drive-image") || urlOrPath.startsWith("/api/drive/image")) {
    const fileId = urlOrPath.split("id=")[1];
    if (fileId) {
      return `${cleanBaseURL}/api/drive/image?id=${fileId}`;
    }
  }

  return urlOrPath;
}

