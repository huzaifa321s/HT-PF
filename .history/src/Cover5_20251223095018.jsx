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
import { setCurrentPagesPT } from "./utils/paymentTermsPageSlice";
import { useDispatch } from "react-redux";
import { store } from "./utils/store";

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
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",

  },
  continueTitle: {
    fontSize: 18,
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
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
    textAlign: "right", // right-align to ensure dot stays within bounds
  },
  termText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.8,
    color: "#333",
    textAlign: "justify",
    marginLeft: 5
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 50,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionDivider: {
    width: "95%",
    height: 1,
    backgroundColor: "#000",
    marginBottom: 10,
    marginLeft: 20,
    marginTop: -5,
  },
  Divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#000",
    marginVertical: 10,
  },
  footerText: { fontSize: 10, color: "#666" },
  pageNumber: { fontSize: 10, color: "#666" },
  labelContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  labelBox: {
    backgroundColor: "#FF8C00",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

// ====================== SMART PAGE SPLIT BY HEIGHT ======================
const splitTermsByHeight = (terms) => {
  const MAX_PAGE_HEIGHT = 650; // Maximum content height per page
  const TITLE_HEIGHT = 60; // Title + margin
  const TERM_BASE_HEIGHT = 40; // Base height for each term
  const LOGO_HEIGHT = 60; // Logo container height

  const pages = [];
  let currentPage = [];
  let currentHeight = TITLE_HEIGHT; // Start with title height

  terms.forEach((term, index) => {
    // Calculate term height based on text length
    const lines = Math.ceil(term.length / 70); // ~70 chars per line
    const termHeight = TERM_BASE_HEIGHT + (lines - 1) * 20;

    // Check if adding this term would exceed page height
    if (
      currentHeight + termHeight > MAX_PAGE_HEIGHT &&
      currentPage.length > 0
    ) {
      pages.push([...currentPage]);
      currentPage = [];
      currentHeight = TITLE_HEIGHT; // Reset for new page
    }

    currentPage.push(term);
    currentHeight += termHeight;
  });

  // Push last page if it has content
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  // If no terms, create empty page
  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
};
// ====================== COVER PAGE ======================
const PdfPaymentTermsCoverPage = ({ title = "Payment Terms", terms, showLabels = false }) => {
  const pages = splitTermsByHeight(terms);
  const totalPages = pages.length;

  useEffect(() => {
    console.log("totalPages", totalPages);
    store.dispatch(setCurrentPagesPT({ currentPages: totalPages }));
  }, [totalPages]);
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
            {showLabels && (
              <View style={styles.labelContainer} fixed>
                <View style={styles.labelBox}>
                  <Text style={styles.labelText}>Payment Terms</Text>
                </View>
              </View>
            )}
            <View style={styles.Divider} />
            {/* Header - Fixed on all pages */}
            <View fixed style={styles.header}>
              {/* Background Image */}
              <Image
                src="/new-header.png"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // poora area cover kare
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
                    <>
                      <View key={globalIndex} style={styles.termItem}>
                        <Text style={styles.termNumber}>{globalIndex}.</Text>
                        <Text style={styles.termText}>{term}</Text>
                      </View>
                      {idx < pageTerms.length - 1 && (
                        <View style={styles.sectionDivider} />
                      )}
                    </>
                  );
                })
              ) : isFirstPage ? (
                <Text style={styles.termText}>No payment terms added yet.</Text>
              ) : null}
            </View>

            {/* Logo + Company Name - Smart Placement */}
            {showLogoOnThisPage && (
              <View style={styles.logoContainer}>
                <Image style={styles.logo} src="/ht-logo.png" />
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
                src="/footer.png"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 0,
                }}
              />
            </View>
          </Page>
        );
      })}
    </>
  );
};

export { splitTermsByHeight, PdfPaymentTermsCoverPage };
