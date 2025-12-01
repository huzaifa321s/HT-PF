import React, { useEffect } from "react";
import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalToast from "./components/GlobalToast";
import RecordingToast from "./components/RecordingToast";
import { useSelector } from "react-redux";
import { setLoaderCallbacks } from "./utils/axiosInstance";
import { useLoading } from "./context/LoadingContext";
import LoaderOverlay from "./components/LoaderOverlay";
import { Font } from "@react-pdf/renderer";

// Liberation Serif – 100% working links (November 2025)
Font.register({
  family: "Liberation Serif",
  fonts: [
    { src: "/fonts/static/Inter_18pt-Regular.ttf", fontWeight: 400 }, // default
    { src: "/fonts/static/Inter_18pt-Black.ttf", fontWeight: 800 },
    { src: "/fonts/static/Inter_24pt-Black.ttf", fontWeight: 900 },
  ],
});


// Oswald Font
Font.register({
  family: "Oswald",
  fonts: [
    { src: "/fonts/Degular-Thin.otf" ,fontWeight: 400},
    { src: "/fonts/DegularDisplay-Semibold.otf" ,fontWeight: 600},
    { src: "/fonts/DegularDisplay-Bold.otf" ,fontWeight: 800},
  ],
});

const Layout = () => {
  const { isLoading, showLoader, hideLoader } = useLoading();
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  // useEffect me connect kiya:
  useEffect(() => {
    setLoaderCallbacks(showLoader, hideLoader);
  }, [showLoader, hideLoader]);
  return (
    <>
      <Navbar />
      {/* <TokenAlert userId={user?.id || ''}/> */}
      <GlobalToast />
      <LoaderOverlay isLoading={isLoading} />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
