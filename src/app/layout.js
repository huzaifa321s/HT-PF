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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Safeguard against string "undefined" in storage causing crashes
                if (typeof window !== 'undefined') {
                  if (window.sessionStorage) {
                    var origGetItem = window.sessionStorage.getItem;
                    window.sessionStorage.getItem = function(key) {
                      var val = origGetItem.call(window.sessionStorage, key);
                      return val === 'undefined' ? null : val;
                    };
                  }
                  if (window.localStorage) {
                    var origLocalGetItem = window.localStorage.getItem;
                    window.localStorage.getItem = function(key) {
                      var val = origLocalGetItem.call(window.localStorage, key);
                      return val === 'undefined' ? null : val;
                    };
                  }
                }

                // Catch chunk loading and resource loading errors and reload the page automatically
                window.addEventListener('error', function(e) {
                  if (e.message && (e.message.indexOf('ChunkLoadError') !== -1 || e.message.indexOf('Loading chunk') !== -1)) {
                    console.warn('ChunkLoadError detected! Reloading page...');
                    window.location.reload();
                    return;
                  }
                  if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                    var url = e.target.src || e.target.href;
                    if (url && (url.indexOf('/_next/static/') !== -1 || url.indexOf('uhcc7lgorwf.css') !== -1)) {
                      console.warn('Next.js static resource failed to load (404)! Reloading page...');
                      window.location.reload();
                    }
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  if (e.reason && (e.reason.name === 'ChunkLoadError' || (e.reason.message && e.reason.message.indexOf('ChunkLoadError') !== -1))) {
                    console.warn('Unhandled ChunkLoadError detected! Reloading page...');
                    window.location.reload();
                  }
                });

                // Unregister any stale legacy service workers (e.g. Firebase Messaging)
                if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var i = 0; i < registrations.length; i++) {
                      registrations[i].unregister();
                    }
                  }).catch(function() {});
                }
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
