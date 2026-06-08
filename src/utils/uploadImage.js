/**
 * Uploads a file object to Google Drive via the server-side upload API route on the Express backend.
 * Returns the caching proxy URL (BASE_URL/api/drive/image?id=FILE_ID) for immediate use.
 */
export async function uploadImageFile(file) {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const formData = new FormData();
  formData.append("file", file);

  const baseURL = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:5000";
  const cleanBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;

  const response = await fetch(`${cleanBaseURL}/api/drive/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to upload image to Google Drive");
  }

  const data = await response.json();
  return `${cleanBaseURL}/api/drive/image?id=${data.fileId}`;
}

