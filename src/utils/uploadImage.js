/**
 * Uploads a file object to Google Drive via the server-side upload API route.
 * Returns the caching proxy URL (/api/drive-image?id=FILE_ID) for immediate use.
 */
export async function uploadImageFile(file) {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-to-drive", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to upload image to Google Drive");
  }

  const data = await response.json();
  return data.url; // Returns proxy URL "/api/drive-image?id=FILE_ID"
}
