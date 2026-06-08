/**
 * Utility to convert images to Base64 data URLs before html2canvas capture.
 *
 * Handles both <img> src attributes AND CSS background-image properties.
 * Directly mutates the live DOM before capture, then restores after.
 */

/** Per-export in-memory cache so we don't refetch the same image multiple times */
const _cache = new Map();

/**
 * Fetches any image URL (local or cross-origin Cloudinary) as a base64 data URL.
 * @param {string} url
 * @returns {Promise<string|null>}
 */
async function fetchImageAsBase64(url) {
  if (_cache.has(url)) return _cache.get(url);

  try {
    const res = await fetch(url, { cache: "force-cache", mode: "cors" });
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
    console.warn(`[imageToBase64] Failed to fetch: ${url}`, err.message);
  }
  return null;
}

/**
 * Extracts the first URL from a CSS background-image value.
 * e.g. 'url("https://example.com/img.png")' → 'https://example.com/img.png'
 */
function extractUrlFromBgImage(bgImage) {
  const match = bgImage.match(/url\(["']?(.*?)["']?\)/);
  return match ? match[1] : null;
}

/**
 * Converts ALL <img> src attributes AND CSS background-image style properties
 * inside `element` to base64 data URLs so html2canvas can render them without
 * making any network requests (which race against rendering and cause blank images).
 *
 * @param {HTMLElement} element
 * @returns {Promise<{imgs: Array, bgs: Array}>} originals for restore
 */
export async function convertImagesToBase64(element) {
  if (!element) return { imgs: [], bgs: [] };

  _cache.clear();

  // ── Part 1: <img> tags ────────────────────────────────────────────────────
  const imgEls = Array.from(element.querySelectorAll("img"));
  const originalImgs = [];

  await Promise.all(
    imgEls.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;

      // Build absolute URL
      const absoluteUrl = src.startsWith("/")
        ? `${window.location.origin}${src}`
        : src;

      const dataUrl = await fetchImageAsBase64(absoluteUrl);
      if (dataUrl) {
        originalImgs.push({ img, src });
        img.setAttribute("src", dataUrl);
      }
    })
  );

  // Wait for every updated <img> to fully decode
  await Promise.all(
    originalImgs.map(({ img }) =>
      new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        img.onload = resolve;
        img.onerror = resolve;
        if (typeof img.decode === "function") {
          img.decode().then(resolve).catch(resolve);
        }
        setTimeout(resolve, 5000);
      })
    )
  );

  // ── Part 2: CSS background-image ─────────────────────────────────────────
  const allEls = Array.from(element.querySelectorAll("*"));
  const originalBgs = [];

  await Promise.all(
    allEls.map(async (el) => {
      const bg = el.style.backgroundImage;
      if (!bg || bg === "none" || bg.startsWith("url(\"data:") || bg.startsWith("url('data:")) return;

      const imgUrl = extractUrlFromBgImage(bg);
      if (!imgUrl) return;

      const dataUrl = await fetchImageAsBase64(imgUrl);
      if (dataUrl) {
        originalBgs.push({ el, bg });
        el.style.backgroundImage = `url("${dataUrl}")`;
      }
    })
  );

  // Flush two animation frames so the browser fully repaints with data URLs
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await new Promise((r) => setTimeout(r, 200));

  return { imgs: originalImgs, bgs: originalBgs };
}

/**
 * Restores the original src and background-image values after html2canvas capture.
 * @param {{ imgs: Array, bgs: Array }} originals
 */
export function restoreOriginalImages(originals) {
  if (!originals) return;
  // Support old call style (array) as well as new object style
  if (Array.isArray(originals)) {
    originals.forEach(({ img, src }) => img.setAttribute("src", src));
    return;
  }
  const { imgs = [], bgs = [] } = originals;
  imgs.forEach(({ img, src }) => img.setAttribute("src", src));
  bgs.forEach(({ el, bg }) => (el.style.backgroundImage = bg));
}
