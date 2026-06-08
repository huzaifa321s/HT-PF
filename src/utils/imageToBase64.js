/**
 * Utility to convert public/ images to Base64 data URLs before html2canvas capture.
 *
 * APPROACH: Uses the /api/static-image server-side route to read images from
 * the filesystem and return them as base64. This is the ONLY approach that works
 * reliably on Vercel because:
 *
 *   - Vercel's CDN serves public/ files and may not include CORS headers needed
 *     for canvas-safe image operations.
 *   - Direct fetch() of static assets can return opaque/cached responses that
 *     cannot be converted to base64 in some browser/CDN configurations.
 *   - The server-side API route reads files from the Node.js filesystem directly,
 *     so there are zero CORS/CDN/caching issues.
 *
 * HOW IT WORKS:
 *   1. Find all <img> elements in the target container
 *   2. For each image with a relative /path src, ask our API for base64
 *   3. Swap img.src to the returned data: URL
 *   4. html2canvas captures the DOM with embedded images — no external fetches needed
 *   5. After capture, restore original src values
 */

/** Per-export in-memory cache so we don't refetch the same image multiple times */
const _cache = new Map();

/**
 * Fetches an image as a base64 data URL via our server-side API proxy.
 * Falls back to direct fetch if the API fails.
 *
 * @param {string} filename - Just the filename, e.g. "newBg.png"
 * @returns {Promise<string|null>} base64 data URL or null on failure
 */
async function getImageAsBase64(filename) {
  if (_cache.has(filename)) return _cache.get(filename);

  // Primary: server-side API route (bypasses all CDN/CORS issues)
  try {
    const apiUrl = `/api/static-image?file=${encodeURIComponent(filename)}`;
    const res = await fetch(apiUrl, { cache: "no-store" });

    if (res.ok) {
      const { dataUrl } = await res.json();
      if (dataUrl && dataUrl.startsWith("data:")) {
        _cache.set(filename, dataUrl);
        return dataUrl;
      }
    }
  } catch (apiErr) {
    console.warn(`[imageToBase64] API route failed for "${filename}":`, apiErr.message);
  }

  // Fallback: direct same-origin fetch (works locally / simple deployments)
  try {
    const absoluteUrl = `${window.location.origin}/${filename}`;
    const res = await fetch(absoluteUrl, {
      cache: "no-store",
      credentials: "same-origin",
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
      _cache.set(filename, dataUrl);
      return dataUrl;
    }
  } catch (fetchErr) {
    console.warn(`[imageToBase64] Direct fetch fallback failed for "${filename}":`, fetchErr.message);
  }

  return null;
}

/**
 * Extracts just the filename from a src path.
 * e.g. "/newBg.png" → "newBg.png"
 *      "https://example.com/newBg.png?t=123" → "newBg.png"
 */
function extractFilename(src) {
  try {
    // Remove query string and hash
    const clean = src.split("?")[0].split("#")[0];
    return clean.split("/").pop();
  } catch {
    return null;
  }
}

/**
 * Converts all <img> src attributes inside `element` to base64 data URLs.
 *
 * Only processes relative paths (starting with /) or same-origin absolute URLs.
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

  // Process all images in parallel for speed
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src");

      // Skip: no src, already base64, external URLs
      if (!src || src.startsWith("data:")) return;

      // Only process same-origin images (relative paths or matching origin)
      const isSameOrigin =
        src.startsWith("/") ||
        src.startsWith(window.location.origin);

      if (!isSameOrigin) return;

      const filename = extractFilename(src);
      if (!filename) return;

      const dataUrl = await getImageAsBase64(filename);

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
