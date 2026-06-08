/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large pages (PDF generation can produce large bundles)
  serverExternalPackages: [
    "@react-pdf/renderer",
    "pdfmake",
    "html2canvas",
    "jspdf",
  ],
  // Add empty turbopack config to silence the warning since we use a custom webpack config
  turbopack: {},

  async headers() {
    return [
      {
        // Apply CORS headers to all routes (API, pages, etc.)
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
      {
        // Specifically for static image files in the public/ directory:
        // Cross-Origin-Resource-Policy: cross-origin allows these assets to be
        // read by canvas operations (html2canvas) from the same origin.
        // Without this, browsers may block canvas.toDataURL() even for same-origin images.
        source: "/:filename(.*\\.(png|jpg|jpeg|gif|webp|svg))",
        headers: [
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // ─── Fix canvas / pdfjs-dist on server ───────────────────────────────
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "canvas",
        "pdfjs-dist",
      ];
    }

    // ─── Silence "Critical dependency" warnings from pdfjs-dist ──────────
    config.module = config.module || {};
    config.module.exprContextCritical = false;

    // ─── Handle binary/asset files ────────────────────────────────────────
    config.module.rules = config.module.rules || [];
    config.module.rules.push(
      {
        test: /\.(wav|mp3|ogg)$/,
        type: "asset/resource",
      },
      {
        test: /\.node$/,
        use: "node-loader",
      }
    );

    return config;
  },
};

export default nextConfig;
