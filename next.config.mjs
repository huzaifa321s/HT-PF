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
