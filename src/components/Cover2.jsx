// src/components/PdfPage3Document.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import PdfTracker from "../utils/PdfTracker";
import { HEADER_IMG, FOOTER_IMG } from "../utils/pdfImageAssets";
import { resolveImageUrl } from "../utils/resolveImageUrl";

// ====================== PDF STYLES ======================
const styles = StyleSheet.create({
  page: {
    position: "relative",
    fontFamily: "Liberation Serif",
    paddingTop: 70,

    paddingBottom: 90,
    paddingHorizontal: 60,
    flexDirection: "column",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 10,
  },

  dividerLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#000",
    marginBottom: 25,
  },

  titleContainer: {
    textAlign: "center",
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 10,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "left",
  },

  contentArea: {
    flexGrow: 1,
    flexShrink: 1,
  },

  textContent: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "#4a4a4a",
    marginBottom: 16,
    textAlign: "justify",
  },

  imageContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 18,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "auto",
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
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 12,
    zIndex: 1, // background ke upar rahe
  },
  pageNumber: {
    fontSize: 10,
    color: "#94a3b8",
  },
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

// Split elements into multiple pages
export const splitElementsIntoPages = (elements) => {
  const pages = [];
  let currentPage = [];
  let currentHeight = 0;
  const MAX_HEIGHT = 600;

  elements.forEach((element) => {
    const elementHeight =
      element.type === "text"
        ? Math.ceil(element.content.length / 50) * 14 * 1.8 + 16
        : 220 + 36;

    if (currentHeight + elementHeight > MAX_HEIGHT && currentPage.length > 0) {
      pages.push([...currentPage]);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(element);
    currentHeight += elementHeight;
  });

  if (currentPage.length > 0) pages.push(currentPage);

  return pages.length > 0 ? pages : [[]];
};

// PDF document component
const PdfPage3Document = ({
  title = "About Humantek",
  subtitle = "",
  elements = [],
  showLabels = false,
}) => {
  const pages = splitElementsIntoPages(elements);

  return (
    <>
      {pages.map((pageElements, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap={false}>
          {pageIndex === 0 && <PdfTracker section="About HT" />}
          {/* Title on first page only */}
          {pageIndex === 0 && (
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>{title}</Text>
              </View>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </>
          )}
          <View fixed style={styles.header}>
            {/* Background Image */}
            <Image
              src={HEADER_IMG}
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

          {/* Content Area */}
          <View style={styles.contentArea}>
            {pageElements.length > 0
              ? pageElements.map((element) => (
                <View key={element.id}>
                  {element.type === "text" && (
                    <Text style={styles.textContent}>{element.content}</Text>
                  )}
                  {element.type === "image" && (
                    <View style={styles.imageContainer}>
                      <Image style={[styles.image, { width: element.dimensions?.width || "100%", height: element.dimensions?.height || "auto" }]} src={resolveImageUrl(element.content)} />
                    </View>
                  )}
                </View>
              ))
              : pageIndex === 0 && (
                <Text style={styles.textContent}>
                  Welcome to Humantek – Your trusted partner in digital
                  transformation and IT excellence.
                </Text>
              )}
          </View>

          {/* Footer */}
          <View fixed style={styles.footer}>
            {/* Background Image */}
            <Image
              src={FOOTER_IMG}
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
          {showLabels && (
            <View style={styles.labelContainer} fixed>
              <View style={styles.labelBox}>
                <Text style={styles.labelText}>About Page</Text>
              </View>
            </View>
          )}
        </Page>
      ))}
    </>
  );
};

export default PdfPage3Document;
