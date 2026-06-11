/**
 * Server-side API route: /api/static-image?file=newBg.png
 *
 * Reads a whitelisted image from the public/ directory and returns it
 * as a base64 data URL JSON response.
 *
 * WHY THIS EXISTS:
 * html2canvas cannot reliably fetch images from Vercel's CDN edge network
 * due to CORS restrictions on static assets. This server-side route reads
 * the file directly from the filesystem (always available on Vercel) and
 * returns base64 — bypassing CDN/CORS entirely.
 */
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// Whitelist of allowed public image files
const ALLOWED_FILES = new Set([
  "newBg.jpg",
  "download.jpg",
  "new-header.png",
  "footer.png",
  "header.png",
  "about-HT.png",
  "proposal-contact.png",
  "ht-logo.png",
  "Artboard 1.jpg",
  "Artboard1.jpg",
  "Artboard 2.jpg",
  "Artboard 3.jpg",
  "Artboard 4.jpg",
  "Artboard 5.jpg",
]);

const MIME_MAP = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  // Security: only allow whitelisted filenames, reject path traversal
  if (!file || !ALLOWED_FILES.has(file) || file.includes("..") || file.includes("/")) {
    return new NextResponse(JSON.stringify({ error: "File not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const filePath = path.join(process.cwd(), "public", file);

    // Check file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString("base64");
    const ext = path.extname(file).slice(1).toLowerCase();
    const mimeType = MIME_MAP[ext] || "application/octet-stream";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json(
      { dataUrl },
      {
        headers: {
          // Cache for 1 hour — images are static and don't change during a session
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  } catch (err) {
    console.error("[static-image] Error reading file:", file, err);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
