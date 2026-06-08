/**
 * Utility to convert relative images to Base64 data URLs.
 * This prevents html2canvas CORS/caching issues when generating PDFs in deployed environments.
 */

export async function convertImagesToBase64(element) {
  if (!element) return [];
  const imgs = element.querySelectorAll("img");
  const originalSources = [];

  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    const src = img.getAttribute("src");

    // Only convert relative local paths (starts with /) or same-origin paths,
    // and ignore already base64 data URLs.
    if (src && (src.startsWith("/") || src.startsWith(window.location.origin)) && !src.startsWith("data:")) {
      try {
        // Method 1: If the image is already loaded on the page, convert it using canvas immediately.
        // This is 100% safe, offline-friendly, and bypasses Vercel Deployment Protection.
        if (img.complete && img.naturalWidth > 0) {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            
            originalSources.push({ img, src });
            img.src = dataUrl;
            continue; // Successfully converted, proceed to next image
          } catch (canvasErr) {
            console.warn("Canvas-based base64 conversion failed, falling back to fetch:", canvasErr);
          }
        }

        // Method 2: Fallback to same-origin fetch if image is not loaded yet
        const absoluteUrl = src.startsWith("/") ? window.location.origin + src : src;
        const response = await fetch(absoluteUrl);
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        const blob = await response.blob();

        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        originalSources.push({ img, src });
        img.src = dataUrl;
      } catch (err) {
        console.error("Failed to convert image to base64:", src, err);
      }
    }
  }

  return originalSources;
}

export function restoreOriginalImages(originalSources) {
  if (!originalSources) return;
  originalSources.forEach(({ img, src }) => {
    img.src = src;
  });
}
