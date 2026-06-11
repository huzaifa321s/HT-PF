"use client";
// src/components/PdfPaymentTermsCoverPage.jsx
import React, { useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Polygon,
} from "@react-pdf/renderer";
import PdfTracker from "../utils/PdfTracker";
import { HEADER_IMG, FOOTER_IMG, HT_LOGO } from "../utils/pdfImageAssets";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Liberation Serif",
    paddingTop: 50,
    paddingBottom: 90,
    paddingHorizontal: 60,
    flexDirection: "column",
  },

  // Header (Fixed on all pages)
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 10,
    overflow: "hidden",
  },

  // Logo & Title Area
  logoContainer: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: { width: 150, height: 50, borderRadius: 20 },
  logoTitle: { color: "#FF8C00", fontSize: 20, fontWeight: "bold" },
  logoSubtitle: { color: "#000", fontSize: 9 },

  dividerLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#000",
    marginVertical: 25, // optional top & bottom spacing
  },
  // Page Title
  mainTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",


  },
  continueTitle: {
    fontSize: 20,
    fontWeight: "normal",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
  },
  // Terms List
  termsContainer: {
    marginTop: 20,
    flexGrow: 1,
  },
  termItem: {
    flexDirection: "row",
    marginBottom: 18,

  },
  termNumber: {
    width: 25, // increased from 15 to 25 for proper dot display
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    textAlign: "right", // right-align to ensure dot stays within bounds
  },
  termText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 1.8,
    color: "#4a4a4a",
    textAlign: "justify",
    marginLeft: 5
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 60,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  sectionDivider: {
    // We want the border to align with the text, which starts at ~30px from left (25px for number + 5px margin).
    // But in flex, since we use paddingHorizontal: 60 for the page, we can just use marginLeft: 30.
    width: "90%", 
    height: 1,
    backgroundColor: "#e0e0e0", // Professional light grey
    marginBottom: 15,
    marginLeft: 30,
    marginTop: 15,
  },
  Divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#000",
    marginVertical: 10,
  },
  footerText: { fontSize: 10, color: "#94a3b8" },
  pageNumber: { fontSize: 10, color: "#94a3b8" },
  labelContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  labelBox: {
    backgroundColor: "#f3a833",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 12,
    // fontWeight: "bold",
    textTransform: "uppercase",
  },
});

// ====================== SMART PAGE SPLIT BY HEIGHT ======================
const splitTermsByHeight = (terms) => {
  const MAX_PAGE_HEIGHT = 680;
  const TITLE_HEIGHT = 63;
  const TERM_BASE_HEIGHT = 45;

  const pages = [];
  let currentPage = [];
  let currentHeight = TITLE_HEIGHT;

  terms.forEach((term, index) => {
    const lines = Math.ceil(term.length / 75) || 1;
    const termHeight = TERM_BASE_HEIGHT + (lines - 1) * 25;

    if (currentHeight + termHeight > MAX_PAGE_HEIGHT && currentPage.length > 0) {
      pages.push([...currentPage]);
      currentPage = [];
      currentHeight = 30; // Continuation overhead
    }

    currentPage.push(term);
    currentHeight += termHeight;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  if (pages.length === 0) {
    pages.push([]);
  }
  return pages;
};
// ====================== COVER PAGE ======================
const PdfPaymentTermsCoverPage = ({ title = "Payment Terms", terms, showLabels = false }) => {
  const pages = splitTermsByHeight(terms);
  const totalPages = pages.length;
  return (
    <>
      {pages.map((pageTerms, pageIndex) => {
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === totalPages - 1;

        // Logo shows on last page if there are terms, otherwise on first page
        const showLogoOnThisPage =
          (isLastPage && pageTerms.length > 0) ||
          (isFirstPage && totalPages === 1);

        // Calculate starting index for term numbering
        let termStartIndex = 0;
        for (let i = 0; i < pageIndex; i++) {
          termStartIndex += pages[i].length;
        }

        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            {pageIndex === 0 && <PdfTracker section="Payment Terms" />}
            <View style={styles.Divider} />
            {/* Header - Fixed on all pages */}
            <View fixed style={styles.header}>
              {/* Background Image */}
              <Image
                src={HEADER_IMG}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: 120, // 595.28 width / 4.96 ratio = 120 height
                  zIndex: 0, // background me rahe
                }}
              />
            </View>
            {/* Title - Show on all pages */}
            {isFirstPage ? (
              <Text style={styles.mainTitle}>{title || "Payment Terms"}</Text>
            ) : (
              <Text style={styles.continueTitle}>
                Payment Terms (Continued)
              </Text>
            )}

            {/* Terms Container */}
            <View style={styles.termsContainer}>
              {pageTerms.length > 0 ? (
                pageTerms.map((term, idx) => {
                  const globalIndex = termStartIndex + idx + 1;
                  return (
                    <React.Fragment key={globalIndex}>
                      <View style={styles.termItem}>
                        <Text style={styles.termNumber}>{globalIndex}.</Text>
                        <Text style={styles.termText}>{term}</Text>
                      </View>
                      {idx < pageTerms.length - 1 && (
                        <View style={styles.sectionDivider} />
                      )}
                    </React.Fragment>
                  );
                })
              ) : isFirstPage ? (
                <Text style={styles.termText}>No payment terms added yet.</Text>
              ) : null}
            </View>

            {/* Logo + Company Name - Smart Placement */}
            {showLogoOnThisPage && (
              <View style={styles.logoContainer}>
                <Image style={styles.logo} src={HT_LOGO} />
                {/* <View>
                  <Text style={styles.logoTitle}>HUMANTEK</Text>
                  <Text style={styles.logoSubtitle}>
                    IT SERVICES & SOLUTIONS
                  </Text>
                </View> */}
              </View>
            )}

            {/* Footer - Fixed on all pages */}
            <View fixed style={styles.footer}>
              {/* Background Image */}
              <Image
                src={FOOTER_IMG}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: 120, // 595.28 width / 4.96 ratio = 120 height
                  zIndex: 0,
                }}
              />
            </View>
            {showLabels && (
              <View style={styles.labelContainer} fixed>
                <View style={styles.labelBox}>
                  <Text style={styles.labelText}>Payment Terms</Text>
                </View>
              </View>
            )}
          </Page>
        );
      })}
    </>
  );
};

export { splitTermsByHeight, PdfPaymentTermsCoverPage };
