import "./globals.css";
import Providers from "@/lib/Providers";
import LayoutShell from "@/lib/LayoutShell";

export const metadata = {
  title: "Proposal Maker | Humantek",
  description:
    "AI-powered proposal creation tool for agents and admins — live transcription, PDF generation, and business intelligence.",
  icons: {
    icon: "/download.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Catch chunk loading errors and reload the page automatically
                window.addEventListener('error', function(e) {
                  if (e.message && (e.message.indexOf('ChunkLoadError') !== -1 || e.message.indexOf('Loading chunk') !== -1)) {
                    console.warn('ChunkLoadError detected! Reloading page...');
                    window.location.reload();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  if (e.reason && (e.reason.name === 'ChunkLoadError' || (e.reason.message && e.reason.message.indexOf('ChunkLoadError') !== -1))) {
                    console.warn('Unhandled ChunkLoadError detected! Reloading page...');
                    window.location.reload();
                  }
                });
              })();
            `
          }}
        />
      </head>
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>

    </html>
  );
}
