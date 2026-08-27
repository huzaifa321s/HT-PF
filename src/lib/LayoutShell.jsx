"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import GlobalToast from "@/components/GlobalToast";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useLoading } from "@/context/LoadingContext";
import { setLoaderCallbacks } from "@/utils/axiosInstance";
import React from "react";

// ────────────────────────────────────────────────────────────────────────────
// Error Boundary — if anything in the tree crashes, show an error UI
// instead of a blank black screen.
// ────────────────────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("LayoutShell ErrorBoundary caught:", error, errorInfo);
    const isChunkError = error && (
      error.name === "ChunkLoadError" ||
      (error.message && (error.message.indexOf("ChunkLoadError") !== -1 || error.message.indexOf("Loading chunk") !== -1))
    );

    if (isChunkError) {
      try {
        const lastReload = sessionStorage.getItem("last_chunk_reload");
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem("last_chunk_reload", now.toString());
          console.warn("ChunkLoadError caught! Auto-reloading page...");
          window.location.reload();
          return;
        }
      } catch (e) {
        window.location.reload();
        return;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#0a0a0a",
            color: "#f8fafc",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            ⚠️
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem", maxWidth: 500 }}>
            The page encountered an error. Please try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 32px",
              background: "#f3a833",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Font registration — done lazily via dynamic import so @react-pdf/renderer
// is NEVER imported at module scope (which crashes SSR on Hostinger).
// ────────────────────────────────────────────────────────────────────────────
let fontsRegistered = false;

function registerPdfFonts() {
  if (fontsRegistered || typeof window === "undefined") return;
  fontsRegistered = true;

  import("@react-pdf/renderer")
    .then(({ Font }) => {
      Font.register({
        family: "Liberation Serif",
        fonts: [
          { src: "/fonts/Degular-Regular.otf", fontWeight: 400 },
          { src: "/fonts/Degular-RegularItalic.otf", fontWeight: 400, fontStyle: "italic" },
          { src: "/fonts/Degular-Medium.otf", fontWeight: 500 },
          { src: "/fonts/Degular-Semibold.otf", fontWeight: 600 },
          { src: "/fonts/Degular-Bold.otf", fontWeight: 700 },
          { src: "/fonts/Degular-BoldItalic.otf", fontWeight: 700, fontStyle: "italic" },
          { src: "/fonts/Degular-Black.otf", fontWeight: 900 },
        ],
      });
      Font.register({
        family: "Helvetica",
        fonts: [
          { src: "/fonts/Degular-Regular.otf", fontWeight: 400 },
          { src: "/fonts/Degular-RegularItalic.otf", fontWeight: 400, fontStyle: "italic" },
          { src: "/fonts/Degular-Medium.otf", fontWeight: 500 },
          { src: "/fonts/Degular-Semibold.otf", fontWeight: 600 },
          { src: "/fonts/Degular-Bold.otf", fontWeight: 700 },
          { src: "/fonts/Degular-BoldItalic.otf", fontWeight: 700, fontStyle: "italic" },
          { src: "/fonts/Degular-Black.otf", fontWeight: 900 },
        ],
      });
      Font.register({
        family: "Oswald",
        fonts: [
          { src: "/fonts/DegularDisplay-Regular.otf", fontWeight: 400 },
          { src: "/fonts/DegularDisplay-Semibold.otf", fontWeight: 600 },
          { src: "/fonts/DegularDisplay-Bold.otf", fontWeight: 800 },
        ],
      });
      Font.register({
        family: "Unbounded",
        fonts: [
          { src: "/fonts/DegularDisplay-Regular.otf", fontWeight: 400 },
          { src: "/fonts/DegularDisplay-Medium.otf", fontWeight: 500 },
          { src: "/fonts/DegularDisplay-Semibold.otf", fontWeight: 600 },
          { src: "/fonts/DegularDisplay-Bold.otf", fontWeight: 700 },
          { src: "/fonts/DegularDisplay-Bold.otf", fontWeight: 800 },
          { src: "/fonts/DegularDisplay-Black.otf", fontWeight: 900 },
        ],
      });
      Font.register({
        family: "Degular",
        fonts: [
          { src: "/fonts/Degular-Thin.otf", fontWeight: 100 },
          { src: "/fonts/Degular-Light.otf", fontWeight: 300 },
          { src: "/fonts/Degular-Regular.otf", fontWeight: 400 },
          { src: "/fonts/Degular-Medium.otf", fontWeight: 500 },
          { src: "/fonts/Degular-Semibold.otf", fontWeight: 600 },
          { src: "/fonts/Degular-Bold.otf", fontWeight: 700 },
          { src: "/fonts/Degular-Black.otf", fontWeight: 900 },
          { src: "/fonts/Degular-RegularItalic.otf", fontWeight: 400, fontStyle: "italic" },
          { src: "/fonts/Degular-BoldItalic.otf", fontWeight: 700, fontStyle: "italic" },
        ],
      });
      Font.register({
        family: "DegularDisplay",
        fonts: [
          { src: "/fonts/DegularDisplay-Thin.otf", fontWeight: 100 },
          { src: "/fonts/DegularDisplay-Light.otf", fontWeight: 300 },
          { src: "/fonts/DegularDisplay-Regular.otf", fontWeight: 400 },
          { src: "/fonts/DegularDisplay-Medium.otf", fontWeight: 500 },
          { src: "/fonts/DegularDisplay-Semibold.otf", fontWeight: 600 },
          { src: "/fonts/DegularDisplay-Bold.otf", fontWeight: 700 },
          { src: "/fonts/DegularDisplay-Black.otf", fontWeight: 900 },
        ],
      });
    })
    .catch((err) => {
      console.warn("Failed to load @react-pdf/renderer for font registration:", err);
    });
}

// Pages that do NOT show Navbar/Footer or DashboardLayout
const PUBLIC_PATHS = ["/", "/login", "/admin-login"];

// Pages that must strictly preserve the old top-navbar/footer UI
const EDITOR_PATHS = ["/create-proposal", "/edit-proposal"];

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const { isLoading, showLoader, hideLoader } = useLoading();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  
  // Check if current path is an editor path (including dynamic IDs)
  const isEditor = EDITOR_PATHS.some(path => pathname.startsWith(path));

  useEffect(() => {
    setLoaderCallbacks(showLoader, hideLoader);
  }, [showLoader, hideLoader]);

  // Register PDF fonts on first client mount (lazy, never SSR, deferred to free up initial bandwidth)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => registerPdfFonts());
      } else {
        registerPdfFonts();
      }
    }, 3000); // 3-second delay
    return () => clearTimeout(timer);
  }, []);

  if (isPublic) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  // All authenticated pages use the new Dashboard UI
  return (
    <ErrorBoundary>
      <GlobalToast />
      <LoaderOverlay isLoading={isLoading} />
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ErrorBoundary>
  );
}
