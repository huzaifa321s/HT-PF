/**
 * Utility to convert public/ and backend/Google Drive images to Base64 data URLs before html2canvas capture.
 *
 * APPROACH: Fetches images directly from the frontend or Express backend and converts them
 * to base64. Since the Express server allows CORS (*), this works 100% of the time and prevents
 * html2canvas from failing to render cross-origin assets.
 */

/** Per-export in-memory cache so we don't refetch the same image multiple times */
const _cache = new Map();

/**
 * Fetches any image URL and converts it to a base64 data URL.
 *
 * @param {string} url - The absolute image URL to fetch
 * @returns {Promise<string|null>} base64 data URL or null on failure
 */
async function fetchImageAsBase64(url) {
  if (_cache.has(url)) return _cache.get(url);

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    if (dataUrl && dataUrl.startsWith("data:")) {
      _cache.set(url, dataUrl);
      return dataUrl;
    }
  } catch (err) {
    console.warn(`[imageToBase64] Failed to fetch and convert image: ${url}`, err.message);
  }

  return null;
}

/**
 * Converts all <img> src attributes inside `element` to base64 data URLs.
 *
 * Processes relative paths, same-origin URLs, and Express backend URLs.
 * Already-embedded data: URLs are skipped.
 *
 * @param {HTMLElement} element - The DOM element to scan for images
 * @returns {Promise<Array<{img: HTMLImageElement, src: string}>>} originals for restore
 */
export async function convertImagesToBase64(element) {
  if (!element) return [];

  // Clear per-export cache so every PDF download gets fresh images
  _cache.clear();

  const imgs = Array.from(element.querySelectorAll("img"));
  const originalSources = [];

  const baseURL = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:5000";
  const cleanBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;

  // Process all images in parallel for speed
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src");

      // Skip: no src, already base64
      if (!src || src.startsWith("data:")) return;

      // Process same-origin or Express backend images
      const isProcessable =
        src.startsWith("/") ||
        src.startsWith(window.location.origin) ||
        src.startsWith(cleanBaseURL);

      if (!isProcessable) return;

      // Construct absolute URL for fetching
      const absoluteUrl = src.startsWith("/")
        ? `${window.location.origin}${src}`
        : src;

      const dataUrl = await fetchImageAsBase64(absoluteUrl);

      if (dataUrl) {
        originalSources.push({ img, src });
        // Use setAttribute to ensure the DOM attribute is updated (not just IDL property)
        img.setAttribute("src", dataUrl);
      }
    })
  );

  return originalSources;
}

/**
 * Restores the original src attribute values on all converted images.
 * Call this after html2canvas has finished capturing.
 *
 * @param {Array<{img: HTMLImageElement, src: string}>} originalSources
 */
export function restoreOriginalImages(originalSources) {
  if (!originalSources) return;
  originalSources.forEach(({ img, src }) => {
    img.setAttribute("src", src);
  });
}
