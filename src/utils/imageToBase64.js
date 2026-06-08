/**
 * Utility to convert relative images to Base64 data URLs before html2canvas capture.
 * This solves CORS / canvas-taint issues in Vercel and other deployed environments.
 *
 * Strategy:
 *  1. For every <img> in the target element, fetch it as a blob using
 *     the absolute URL (same origin) and convert to a data: URL.
 *  2. Swap the <img> src to the data URL so html2canvas sees it as inline.
 *  3. After capture, restore original src values.
 *
 * IMPORTANT: We do NOT use the "draw existing img onto canvas" trick because
 * images loaded without crossOrigin="anonymous" will taint the canvas and throw
 * a SecurityError — even for same-origin images in some browsers/CDN configs.
 */

/**
 * Fetches a URL and returns a base64 data URL.
 * Uses a cache so each unique URL is only fetched once per PDF export.
 */
const _cache = new Map();

async function fetchAsDataUrl(url) {
  if (_cache.has(url)) return _cache.get(url);

  try {
    const response = await fetch(url, {
      cache: "no-store",   // Bypass browser cache — avoids opaque cached responses
      mode: "cors",        // Explicit CORS mode
      credentials: "same-origin",
    });

    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);

    const blob = await response.blob();

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    _cache.set(url, dataUrl);
    return dataUrl;
  } catch (err) {
    console.warn(`[imageToBase64] Failed to fetch ${url}:`, err.message);
    return null;
  }
}

/**
 * Converts all <img> src attributes inside `element` to base64 data URLs.
 * Returns an array of { img, src } objects so you can restore them later.
 */
export async function convertImagesToBase64(element) {
  if (!element) return [];

  // Clear per-export cache (fresh export = fresh fetch)
  _cache.clear();

  const imgs = Array.from(element.querySelectorAll("img"));
  const originalSources = [];

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return; // Already base64 — skip

      // Build absolute URL
      let absoluteUrl;
      if (src.startsWith("http://") || src.startsWith("https://")) {
        absoluteUrl = src;
      } else if (src.startsWith("/")) {
        absoluteUrl = window.location.origin + src;
      } else {
        absoluteUrl = new URL(src, window.location.href).href;
      }

      const dataUrl = await fetchAsDataUrl(absoluteUrl);
      if (dataUrl) {
        originalSources.push({ img, src });
        img.src = dataUrl;
        // Ensure the browser shows the new src immediately
        img.decode?.().catch(() => {});
      }
    })
  );

  return originalSources;
}

/**
 * Restores original <img> src values after html2canvas has finished.
 */
export function restoreOriginalImages(originalSources) {
  if (!originalSources) return;
  originalSources.forEach(({ img, src }) => {
    img.src = src;
  });
}
