// src/components/PdfPage3Document.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Svg,
  Polygon,
} from "@react-pdf/renderer";

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
  headerLogo: {
    position: "absolute",
    right: 24,
    top: 10,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },

  logoContainer: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoTitle: {
    color: "#FF8C00",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  logoSubtitle: {
    color: "#000",
    fontSize: 9,
    letterSpacing: 2,
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 10,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
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
    fontSize: 12,
    lineHeight: 1.8,
    color: "#333",
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
    height: 50,
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
    color: "#666",
  },
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

// Split elements into multiple pages
export const splitElementsIntoPages = (elements) => {
  const pages = [];
  let currentPage = [];
  let currentHeight = 0;
  const MAX_HEIGHT = 600;

  elements.forEach((element) => {
    const elementHeight =
      element.type === "text"
        ? Math.ceil(element.content.length / 50) * 12 * 1.8 + 16
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
                      <Image style={styles.image} src={element.content} />
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
