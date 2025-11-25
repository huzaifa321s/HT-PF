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
import TokenAlert from "./components/TokenAlert";
import { Font } from "@react-pdf/renderer";

// Liberation Serif – 100% working links (November 2025)
Font.register({
  family: "Liberation Serif",
  fonts: [
    { src: "/fonts/LiberationSerif-Regular.ttf" },
    { src: "/fonts/LiberationSerif-Bold.ttf", fontWeight: 700 },
    { src: "/fonts/LiberationSerif-Italic.ttf", fontStyle: "italic" },
    { src: "/fonts/LiberationSerif-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" },
  ],
});


// Oswald Font
Font.register({
  family: "Oswald",
  fonts: [
    { src: "/fonts/degular.otf" ,fontWeight: 700},
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
