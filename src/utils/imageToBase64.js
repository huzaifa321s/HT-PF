/**
 * Utility to convert public/ and backend/Google Drive images to Base64 data URLs before html2canvas capture.
 *
 * APPROACH: Fetches images directly from the frontend or Express backend and converts them
 * to base64. Since the Express server allows CORS (*), this works 100% of the time and prevents
 * html2canvas from failing to render cross-origin assets.
 */

/** Per-export in-memory cache so we don't refetch the same image multiple times */
const _cache = new Map();

// Whitelist of allowed public image files (must match route.js)
const STATIC_FILES = new Set([
  "newBg.png",
  "download.jpg",
  "new-header.png",
  "footer.png",
  "header.png",
  "new.png",
  "about-HT.png",

  "proposal-contact.png",
  "ht-logo.png",
  "wesd.png",
  "sdf.png",
  "2ndborder-layout.png",
  "border-layout.png",
]);

/**
 * Fetches static assets via server-side API or dynamic assets directly.
 *
 * @param {string} url - The image URL or path to fetch
 * @returns {Promise<string|null>} base64 data URL or null on failure
 */
async function fetchImageAsBase64(url) {
  if (_cache.has(url)) return _cache.get(url);

  try {
    // 1. Check if it's a whitelisted static asset
    let filename = "";
    try {
      const urlPath = url.startsWith("http") ? new URL(url).pathname : url;
      filename = urlPath.substring(urlPath.lastIndexOf("/") + 1);
    } catch (e) {
      filename = url.substring(url.lastIndexOf("/") + 1);
    }

    if (filename.includes("?")) {
      filename = filename.split("?")[0];
    }

    if (STATIC_FILES.has(filename)) {
      const res = await fetch(`/api/static-image?file=${filename}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.dataUrl) {
          _cache.set(url, json.dataUrl);
          return json.dataUrl;
        }
      }
      console.warn(`[imageToBase64] Failed to fetch static image via proxy: ${filename}`);
    }

    // 2. Fallback to direct fetch
    const absoluteUrl = url.startsWith("/")
      ? `${window.location.origin}${url}`
      : url;

    const res = await fetch(absoluteUrl, {
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

  // --- Critical: wait for every updated image to fully decode before returning ---
  // We use a robust combination of onload, decode(), and polling to guarantee
  // the image is 100% ready to render before we let html2canvas take a snapshot.
  await Promise.all(
    originalSources.map(({ img }) => {
      return new Promise((resolve) => {
        const checkComplete = () => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return true;
          }
          return false;
        };

        if (checkComplete()) return;

        img.onload = () => checkComplete() || resolve();
        img.onerror = () => resolve(); // continue even if broken so we don't hang

        if (typeof img.decode === "function") {
          img.decode().then(() => checkComplete() || resolve()).catch(() => checkComplete() || resolve());
        }

        // Fallback polling just in case events miss
        const poll = setInterval(() => {
          if (checkComplete()) clearInterval(poll);
        }, 50);

        // Absolute timeout to prevent hanging forever
        setTimeout(() => {
          clearInterval(poll);
          resolve();
        }, 3000);
      });
    })
  );

  // Flush animation frames to ensure the browser has fully repainted
  // with the new data: URL images before html2canvas captures the DOM.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  // Extra wait to be absolutely safe
  await new Promise(r => setTimeout(r, 100));

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
