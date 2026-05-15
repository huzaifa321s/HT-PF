"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardLayout from "@/components/DashboardLayout";
import GlobalToast from "@/components/GlobalToast";
import LoaderOverlay from "@/components/LoaderOverlay";
import { useLoading } from "@/context/LoadingContext";
import { setLoaderCallbacks } from "@/utils/axiosInstance";
import { Font } from "@react-pdf/renderer";

// Register fonts for @react-pdf/renderer (must be client-side)
Font.register({
  family: "Liberation Serif",
  fonts: [
    { src: "/fonts/static/Inter_18pt-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/static/Inter_18pt-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { src: "/fonts/static/Inter_18pt-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/static/Inter_18pt-Black.ttf", fontWeight: 800 },
    { src: "/fonts/static/Inter_24pt-Black.ttf", fontWeight: 900 },
  ],
});

Font.register({
  family: "Oswald",
  fonts: [
    { src: "/fonts/Degular-Thin.otf", fontWeight: 400 },
    { src: "/fonts/DegularDisplay-Semibold.otf", fontWeight: 600 },
    { src: "/fonts/DegularDisplay-Bold.otf", fontWeight: 800 },
  ],
});

Font.register({
  family: "Unbounded",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/unbounded/files/unbounded-latin-400-normal.woff", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/unbounded/files/unbounded-latin-700-normal.woff", fontWeight: 700 },
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/unbounded/files/unbounded-latin-900-normal.woff", fontWeight: 900 },
  ],
});

// Pages that do NOT show Navbar/Footer or DashboardLayout
const PUBLIC_PATHS = ["/login", "/admin-login"];

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

  if (isPublic) {
    return <>{children}</>;
  }

  // All authenticated pages use the new Dashboard UI
  return (
    <>
      <GlobalToast />
      <LoaderOverlay isLoading={isLoading} />
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </>
  );
}
