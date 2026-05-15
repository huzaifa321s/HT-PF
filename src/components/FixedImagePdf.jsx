// src/components/FixedImagePdfPage.jsx
import React from "react";
import { Document, Page, Image, StyleSheet } from "@react-pdf/renderer";

// ====================== STYLES ======================
const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    padding: 0,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover", // cover full page
  },
});

// ====================== FIXED IMAGE PDF DOCUMENT ======================
const FixedImagePdfPage = () => {
  return (
      <Page size="A4" style={styles.page}>
        <Image
          src="/proposal-contact.png" // Only this image
          style={styles.backgroundImage}
        />
      </Page>

  );
};

export default FixedImagePdfPage;
