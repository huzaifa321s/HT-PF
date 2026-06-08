/**
 * Converts images to base64 data URLs before html2canvas capture.
 *
 * Handles BOTH <img> src attributes AND CSS background-image inline styles.
 * Routes everything through the server-side /api/static-image proxy so there
 * are zero CORS issues — the proxy reads directly from the filesystem.
 *
 * Flow:
 *  1. Find all <img> tags → fetch via /api/static-image → replace src with data URL
 *  2. Find all elements with inline background-image → fetch via proxy → replace with data URL
 *  3. Wait for 2 animation frames so the browser has repainted
 *  4. html2canvas runs — every image is already a data: URL, zero network requests needed
 *  5. Call restoreOriginalImages() to put everything back
 */

/** Per-export in-memory cache to avoid re-fetching the same image */
const _cache = new Map();

/**
 * Extracts the URL from a CSS background-image value.
 * Handles: url("https://..."), url('https://...'), url(https://...)
 */
function extractBgUrl(bgImage) {
  const m = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
  return m ? m[1] : null;
}

/**
 * Fetches an image (by its /public path like "/newBg.png") via the
 * /api/static-image server-side proxy and returns a base64 data URL.
 *
 * The proxy reads from disk — no CORS, no CDN, 100% reliable.
 *
 * @param {string} src  - The image src, e.g. "/newBg.png" or full URL
 * @returns {Promise<string|null>}  data URL or null on failure
 */
async function fetchAsDataUrl(src) {
  if (_cache.has(src)) return _cache.get(src);

  try {
    // If the source is a full URL, try fetching it directly first (allows CORS if permitted)
    if (src.startsWith('http')) {
      try {
        const res = await fetch(src, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          if (dataUrl?.startsWith('data:')) {
            _cache.set(src, dataUrl);
            return dataUrl;
          }
        }
      } catch (_) {
        // Direct fetch failed, fallback to proxy handling based on filename
      }
    }

    // Extract filename for proxy fallback (handles local assets)
    let filename = src;
    try {
      const pathname = src.startsWith('http') ? new URL(src).pathname : src;
      filename = pathname.split('/').pop().split('?')[0];
    } catch (_) {
      filename = src.split('/').pop();
    }

    // Try the server-side proxy (reads directly from filesystem, no CORS)
    const proxyRes = await fetch(`/api/static-image?file=${encodeURIComponent(filename)}`);
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.dataUrl) {
        _cache.set(src, json.dataUrl);
        return json.dataUrl;
      }
    }

    // Final fallback: treat as relative URL
    const absoluteUrl = src.startsWith('/')
      ? `${window.location.origin}${src}`
      : src;
    const res = await fetch(absoluteUrl);
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (dataUrl?.startsWith('data:')) {
        _cache.set(src, dataUrl);
        return dataUrl;
      }
    }
  } catch (err) {
    console.warn('[imageToBase64] fetch failed for:', src, err.message);
  }

  return null;
}

/**
 * Converts all <img> src attributes AND CSS background-image properties
 * inside `element` to base64 data URLs.
 *
 * @param {HTMLElement} element
 * @returns {Promise<{imgs: Array, bgs: Array}>}
 */
export async function convertImagesToBase64(element) {
  if (!element) return { imgs: [], bgs: [] };

  _cache.clear();

  // ── 1. <img> tags ─────────────────────────────────────────────────────────
  const imgEls = Array.from(element.querySelectorAll("img"));
  const imgs = [];

  await Promise.all(
    imgEls.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;

      // Ensure CORS is allowed for external images
      img.crossOrigin = "anonymous";

      const dataUrl = await fetchAsDataUrl(src);
      if (dataUrl) {
        imgs.push({ img, src });
        img.setAttribute("src", dataUrl);
      }
    })
  );

  // Wait for all <img> to fully decode
  await Promise.all(
    imgs.map(({ img }) =>
      new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        img.onload = resolve;
        img.onerror = resolve;
        if (typeof img.decode === "function") img.decode().then(resolve).catch(resolve);
        setTimeout(resolve, 5000);
      })
    )
  );

  // ── 2. CSS background-image ───────────────────────────────────────────────
  const allEls = Array.from(element.querySelectorAll("*"));
  const bgs = [];

  await Promise.all(
    allEls.map(async (el) => {
      const bg = el.style.backgroundImage;
      // Skip: empty, none, or already a data URL
      if (!bg || bg === "none") return;
      if (bg.includes("data:")) return;

      const url = extractBgUrl(bg);
      if (!url) return;

      const dataUrl = await fetchAsDataUrl(url);
      if (dataUrl) {
        bgs.push({ el, bg });
        el.style.backgroundImage = `url("${dataUrl}")`;
      }
    })
  );

  // Flush browser paint so the data URLs are fully rendered before capture
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 300));

  return { imgs, bgs };
}

/**
 * Restores original image sources after html2canvas capture.
 * Accepts both the new { imgs, bgs } object and the old array format.
 */
export function restoreOriginalImages(originals) {
  if (!originals) return;

  if (Array.isArray(originals)) {
    // Legacy array format
    originals.forEach(({ img, src }) => img.setAttribute("src", src));
    return;
  }

  const { imgs = [], bgs = [] } = originals;
  imgs.forEach(({ img, src }) => img.setAttribute("src", src));
  bgs.forEach(({ el, bg }) => { el.style.backgroundImage = bg; });
}

/**
 * Checks if any <img> elements still have non-data URLs.
 * Returns true if all images are data URLs, false otherwise.
 */
export function ensureAllImagesConverted(container) {
  const imgs = Array.from(container.querySelectorAll("img"));
  return imgs.every((img) => img.getAttribute("src")?.startsWith("data:"));
}
