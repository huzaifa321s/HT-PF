"use client";
// src/components/PdfPricingPage.jsx
import React, { useMemo, useEffect } from "react";
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

// ======================== CONSTANTS ========================
const PAGE_MARGIN_TOP = 100;
const PAGE_MARGIN_BOTTOM = 80;
const PAGE_CONTENT_HEIGHT = 712 - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM; // A4 usable height
const MIN_PACKAGE_HEIGHT = 320;
const ITEM_HEIGHT = 22;
const BASE_PACKAGE_HEIGHT = 200; // Title + subtitle + price + "What's included" + paddings

// ======================== STYLES ========================
const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE_MARGIN_TOP,
    paddingBottom: PAGE_MARGIN_BOTTOM,
    paddingHorizontal: 50,
    position: "relative",
    backgroundColor: "#141414",
    fontFamily: "Liberation Serif",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  divider: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 15,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 10,
  },
  mainHeading: {
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    fontSize: 28,
    marginTop: 10,
    marginBottom: 20,
  },
  subheading: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
    lineHeight: 1.6,

  },
  textContent: {
    fontSize: 11,
    color: "#f8fafc",
    lineHeight: 1.6,
    marginBottom: 15,
  },
  standalonePackage: {
    border: "2px solid #e0e0e0",
    borderRadius: 16,
    padding: 28,
    marginBottom: 30,
    backgroundColor: "#141414",
  },
  gridPackage: {
    flex: 1,
    minWidth: 240,
    border: "2px solid #e0e0e0",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#141414",
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  packageLine: {
    height: 4,
    backgroundColor: "#000",
    marginBottom: 12,
  },
  packageSubtitle: {
    fontSize: 11,
    textAlign: "start",
    color: "#0000",
    fontWeight: "bold",
    marginBottom: 12,
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    textAlign: "start",
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "start",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 6,
    fontSize: 10.5,
  },
  bullet: {
    marginRight: 10,
    fontWeight: "bold",
  },
  continuationNote: {
    fontSize: 9,
    color: "#000",
    // fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
  },
  gridRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 30,
    flexWrap: "nowrap",
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

// ======================== HEIGHT ESTIMATION ========================
const estimateItemHeight = (text) => {
  const lines = Math.ceil(text.length / 90); // ~90 chars per line
  return lines * ITEM_HEIGHT;
};

const estimatePackageHeight = (pkg) => {
  let height = BASE_PACKAGE_HEIGHT;

  if (pkg.items) {
    pkg.items.forEach((item) => {
      height += estimateItemHeight(item);
    });
  }

  if (pkg.isContinued) height += 20; // "...Continued" line
  if (pkg.continueNext) height += 20; // "→ Continued on next page"

  return height;
};

// ======================== SMART SPLITTING ========================
const splitPackage = (pkg, maxFirstChunkHeight, maxSubsequentChunkHeight = 420) => {
  if (estimatePackageHeight(pkg) <= maxFirstChunkHeight) {
    return [{ ...pkg, isSplit: false }];
  }

  const chunks = [];
  const items = pkg.items || [];
  let currentChunkItems = [];
  let currentHeight = BASE_PACKAGE_HEIGHT + (pkg.isContinued ? 20 : 0);
  let isFirstChunk = true;

  items.forEach((item, idx) => {
    const itemH = estimateItemHeight(item);
    const currentMaxHeight = isFirstChunk ? maxFirstChunkHeight : maxSubsequentChunkHeight;

    if (currentHeight + itemH + (idx === items.length - 1 && currentChunkItems.length > 0 ? 20 : 0) > currentMaxHeight) {
      if (currentChunkItems.length === 0) {
        currentChunkItems.push(item);
        currentHeight += itemH;
      } else {
        chunks.push({
          ...pkg,
          items: currentChunkItems,
          isSplit: true,
          splitPart: chunks.length === 0 ? "start" : "middle",
          showHeader: chunks.length === 0,
          continueNext: true,
        });

        currentChunkItems = [item];
        currentHeight = BASE_PACKAGE_HEIGHT + 30 + itemH;
        isFirstChunk = false;
      }
    } else {
      currentChunkItems.push(item);
      currentHeight += itemH;
    }
  });

  if (currentChunkItems.length > 0) {
    chunks.push({
      ...pkg,
      items: currentChunkItems,
      isSplit: true,
      splitPart: "end",
      showHeader: false,
      continueNext: false,
      isContinued: chunks.length > 0,
    });
  }

  return chunks;
};

const organizeIntoPages = (standalonePkgs, gridPkgs) => {
  const pages = [];
  let firstPageExtraHeight = 220; // heading, subheading, etc on first page
  let currentPage = { standalone: [], grid: [], heightUsed: firstPageExtraHeight };

  const startNewPage = () => {
    // Only push if there's actually content, or if it's the very first page and it's empty
    if (currentPage.standalone.length || currentPage.grid.length || pages.length === 0) {
      pages.push(currentPage);
    }
    currentPage = { standalone: [], grid: [], heightUsed: 0 };
  };

  // Helper to add package chunks
  const addPackageChunks = (chunks) => {
    chunks.forEach((chunk) => {
      const h = estimatePackageHeight(chunk) + 30; // margin bottom

      if (currentPage.heightUsed + h > PAGE_CONTENT_HEIGHT && (currentPage.standalone.length > 0 || currentPage.grid.length > 0)) {
        startNewPage();
      }

      if (chunk.type === "grid") {
        currentPage.grid.push(chunk);
      } else {
        currentPage.standalone.push(chunk);
      }
      currentPage.heightUsed += h;
    });
  };

  // Process standalone
  standalonePkgs.forEach((pkg) => {
    let availableHeight = PAGE_CONTENT_HEIGHT - currentPage.heightUsed;
    if (availableHeight < 250) {
      startNewPage();
      availableHeight = PAGE_CONTENT_HEIGHT;
    }
    const chunks = splitPackage(pkg, availableHeight, 420);
    addPackageChunks(chunks.map(c => ({ ...c, type: "standalone" })));
  });

  // Process grid packages (2 per row)
  gridPkgs.forEach((pkg, index) => {
    const isFirstInRow = (currentPage.grid.length % 2 === 0);
    let availableHeight = PAGE_CONTENT_HEIGHT - currentPage.heightUsed;
    if (isFirstInRow && availableHeight < 250) {
      startNewPage();
      availableHeight = PAGE_CONTENT_HEIGHT;
    }

    const chunks = splitPackage(pkg, availableHeight, 380);

    chunks.forEach((chunk) => {
      const pkgHeight = estimatePackageHeight(chunk) + 30;

      // Force continuation chunks to start on a new page
      if (chunk.isContinued) {
        startNewPage();
      }

      // ---------------------------------------------
      // GRID FIX: Check row height, not individual box
      // ---------------------------------------------
      const isFirst = (currentPage.grid.length % 2 === 0);

      // If this is second item in row → row height already counted
      if (!isFirst) {
        // second item of same row → no height increase
        currentPage.grid.push({ ...chunk, type: "grid" });
        return;
      }

      // First item in row → new row height check
      if (currentPage.heightUsed + pkgHeight > PAGE_CONTENT_HEIGHT && (currentPage.standalone.length > 0 || currentPage.grid.length > 0)) {
        startNewPage();
      }

      // Add first item of new row
      currentPage.grid.push({ ...chunk, type: "grid" });
      currentPage.heightUsed += pkgHeight;

      // Force continued chunks to sit alone on their row by adding a placeholder
      if (chunk.isContinued) {
        currentPage.grid.push({ type: "placeholder" });
      }
    });
  });

  if (currentPage.standalone.length || currentPage.grid.length || pages.length === 0) {
    pages.push(currentPage);
  }

  return pages;
};

// ======================== RENDER COMPONENTS ========================
const PackageBox = ({ pkg }) => (
  <View
    style={pkg.type === "grid" ? styles.gridPackage : styles.standalonePackage}
    wrap={false}
  >
    {pkg.showHeader !== false && (
      <>
        <Text style={styles.packageTitle}>{pkg.title}</Text>
        <View style={[styles.packageLine, { backgroundColor: pkg.color || "#000" }]} />
        <Text style={[styles.packageSubtitle, { color: pkg.color || "#000" }]}>
          {pkg.subtitle}
        </Text>
        <Text style={styles.packagePrice}>
          {pkg.price
            && `${pkg?.currency || pkg.globalCurrency || "$"} ${pkg.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} / Month`}
        </Text>
      </>
    )}

    <Text style={styles.featuresTitle}>
      {pkg.isContinued ? "...Continued" : pkg.type === "grid" ? "Includes:" : "What's Included"}
    </Text>

    {pkg.items?.map((item, i) => (
      <View key={i} style={styles.featureItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={{ textAlign: "left", flex: 1 }}>{item}</Text>
      </View>
    ))}

    {pkg.continueNext && (
      <Text style={styles.continuationNote}>→ Continued on next page</Text>
    )}
  </View>
);

// ======================== MAIN COMPONENT ========================
const PdfPricingPage = ({
  pageTitle = "Pricing Plans",
  heading = "Choose Your Perfect Plan",
  subheading = "Flexible options designed for your needs",
  elements = [],
  gridPackages = [],
  showLabels = false,
  globalCurrency = "$",
}) => {
  const standalonePkgs = elements.filter(e => e.type === "package");
  const textElements = elements.filter(e => e.type !== "package");

  const pages = useMemo(() => {
    return organizeIntoPages(standalonePkgs, gridPackages);
  }, [standalonePkgs, gridPackages]);



  useEffect(() => {
    // Optional: dispatch to Redux if needed
    // store.dispatch(setCurrentPages({ currentPages: pages.length }));
  }, [pages]);


  const orderedElements = useMemo(() => {
    // 1️⃣ Text / Heading elements
    const textElems = elements
      .filter(el => el.type === "text" || el.type === "mainHeading")
      .map(el => ({ ...el, _elementType: el.type }));

    // 2️⃣ Standalone packages
    const standaloneElems = elements
      .filter(el => el.type === "package" && !el.isGrid)
      .map(pkg => ({ ...pkg, _elementType: "standalone" }));

    // 3️⃣ Grid packages
    const gridElems = elements
      .filter(el => el.type === "package" && el.isGrid)
      .map(pkg => ({ ...pkg, _elementType: "grid" }));

    // 4️⃣ Unified ordered array
    return [...textElems, ...standaloneElems, ...gridElems];
  }, [elements]);

  return (
    <>
      {pages.map((page, pageIdx) => {
        const gridChunks = [];
        for (let i = 0; i < page.grid.length; i += 2) {
          gridChunks.push(page.grid.slice(i, i + 2));
        }

        return (
          <Page key={pageIdx} size="A4" style={styles.page}>
            {pageIdx === 0 && <PdfTracker section="Pricing" />}
            {/* Fixed Header */}
            <View fixed style={styles.header}>
              <Image src={HEADER_IMG} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </View>

            {/* First Page Only Content */}
            {pageIdx === 0 && (
              <>
                <Text style={styles.pageTitle}>{pageTitle}</Text>
                <Text style={styles.mainHeading}>{heading}</Text>
                <Text style={styles.subheading}>{subheading}</Text>
                <View style={styles.divider} />

                {textElements.map((el, i) => (
                  <Text key={i} style={{ ...styles.textContent, fontSize: el.type === "mainHeading" && 28 }}>{el.content}</Text>
                ))}
              </>
            )
            }

            {/* Standalone Packages */}
            {
              page.standalone.map((pkg, i) => (
                <PackageBox key={`${pkg.id}-${i}`} pkg={{ ...pkg, globalCurrency }} />
              ))
            }

            {/* Grid Packages - 2 per row */}
            {
              gridChunks.map((row, rowIdx) => {
                const isCenteredRow = row.some(p => p.isContinued);
                return (
                  <View key={`row-${rowIdx}`} style={[styles.gridRow, isCenteredRow && { justifyContent: "center" }]}>
                    {row.filter(p => p.type !== "placeholder").map((pkg, colIdx) => (
                      <PackageBox key={`${pkg.id}-${rowIdx}-${colIdx}`} pkg={{ ...pkg, globalCurrency }} />
                    ))}
                  </View>
                );
              })
            }

            {/* Fixed Footer */}
            < View fixed style={styles.footer} >
              <Image src={FOOTER_IMG} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </View >
            {showLabels && (
              <View style={styles.labelContainer} fixed>
                <View style={styles.labelBox}>
                  <Text style={styles.labelText}>Pricing Page</Text>
                </View>
              </View>
            )}
          </Page >
        );
      })}
    </>
  );
};

export default PdfPricingPage;