/**
 * Static design assets for PDF generation.
 *
 * IMPORTANT: These are LOCAL paths (/public directory).
 * The /api/static-image server route reads these files from disk and returns
 * them as base64 data URLs — completely bypassing CORS/CDN issues for html2canvas.
 *
 * DO NOT change these to Cloudinary or external URLs — the API proxy requires
 * local filesystem access.
 */

export const COVER_BG    = "/newBg.png";
export const LOGO        = "/download.jpg";
export const HEADER_IMG  = "/new-header.png";
export const FOOTER_IMG  = "/footer.png";
export const CONTACT_PAGE = "/proposal-contact.png";
export const HT_LOGO     = "/ht-logo.png";
