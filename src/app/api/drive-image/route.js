import { NextResponse } from "next/server";

// Helper function to extract Google Drive File ID from different URL formats
function getGoogleDriveId(urlOrId) {
  if (!urlOrId) return null;
  
  // If it's already a clean ID (alphanumeric with underscores/hyphens, typically 28 to 45 characters)
  if (/^[a-zA-Z0-9_-]{28,45}$/.test(urlOrId)) {
    return urlOrId;
  }
  
  try {
    // Try parsing as URL
    const url = new URL(urlOrId);
    
    // Format 1: drive.google.com/file/d/FILE_ID/view...
    if (url.hostname.includes("drive.google.com")) {
      const parts = url.pathname.split("/");
      const dIndex = parts.indexOf("d");
      if (dIndex !== -1 && parts[dIndex + 1]) {
        return parts[dIndex + 1];
      }
    }
    
    // Format 2: docs.google.com/uc?id=FILE_ID... or export=download&id=FILE_ID
    // Format 3: drive.google.com/open?id=FILE_ID...
    if (url.searchParams.has("id")) {
      return url.searchParams.get("id");
    }
  } catch (e) {
    // Not a valid URL, return null
  }
  
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("id") || searchParams.get("url");

  if (!input) {
    return new NextResponse(JSON.stringify({ error: "Missing parameter 'id' or 'url'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fileId = getGoogleDriveId(input);

  if (!fileId) {
    return new NextResponse(JSON.stringify({ error: "Invalid Google Drive File ID or URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Google Drive raw download link
  const driveUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

  try {
    // We fetch the image from Google Drive server-side (bypass CORS entirely)
    const response = await fetch(driveUrl, {
      headers: {
        // Pass user-agent to ensure we don't get blocked
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse(JSON.stringify({ error: "Failed to fetch from Google Drive" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Vercel / Next.js Edge CDN caching: cache for 1 year (immutable)
    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[drive-image] Error proxying file:", fileId, err);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
