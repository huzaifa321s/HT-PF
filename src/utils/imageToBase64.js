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
        const absoluteUrl = src.startsWith("/") ? window.location.origin + src : src;
        // Fetch same-origin image without triggering CORS anonymous cache issue
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
