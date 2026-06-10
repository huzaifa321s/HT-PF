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
