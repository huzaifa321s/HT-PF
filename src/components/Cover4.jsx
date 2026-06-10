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
    alignItems: "stretch",
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
  let currentPage = { standalone: [], grid: [] };

  const getRowsCount = (page) => {
    return page.standalone.length + Math.ceil(page.grid.length / 2);
  };

  const startNewPage = () => {
    if (currentPage.standalone.length > 0 || currentPage.grid.length > 0) {
      pages.push(currentPage);
    }
    currentPage = { standalone: [], grid: [] };
  };

  standalonePkgs.forEach((pkg) => {
    if (getRowsCount(currentPage) >= 2) {
      startNewPage();
    }
    currentPage.standalone.push({ ...pkg, isSplit: false, itemOffset: 0 });
  });

  gridPkgs.forEach((pkg) => {
    const isStartingNewRow = (currentPage.grid.length % 2 === 0);
    if (isStartingNewRow && getRowsCount(currentPage) >= 2) {
      startNewPage();
    }
    currentPage.grid.push({ ...pkg, isSplit: false, itemOffset: 0 });
  });

  if (currentPage.standalone.length > 0 || currentPage.grid.length > 0 || pages.length === 0) {
    pages.push(currentPage);
  }

  return pages;
};

// ======================== RENDER COMPONENTS ========================
const PackageBox = ({ pkg, totalPkgs }) => {
  const isGrid = pkg.type === "grid";

  // Dynamic sizing based on number of packages
  let padding = isGrid ? 20 : 28;
  let marginB = isGrid ? 0 : 30;
  let itemMarginB = 8;
  let titleSize = 20;
  let subtitleSize = 11;
  let priceSize = 15;
  let itemSize = 11;
  let headerBarHeight = 4;

  if (totalPkgs === 2) {
    padding = isGrid ? 14 : 18;
    marginB = isGrid ? 0 : 16;
    itemMarginB = 5;
    titleSize = 16;
    subtitleSize = 10;
    priceSize = 13;
    itemSize = 10;
    headerBarHeight = 3;
  } else if (totalPkgs >= 3) {
    padding = isGrid ? 10 : 12;
    marginB = isGrid ? 0 : 8;
    itemMarginB = 3;
    titleSize = 13;
    subtitleSize = 9;
    priceSize = 11;
    itemSize = 9;
    headerBarHeight = 2;
  }

  return (
    <View
      style={[
        isGrid ? styles.gridPackage : styles.standalonePackage,
        {
          padding: padding,
          marginTop: pkg.marginTop || 0,
          marginBottom: pkg.marginBottom !== undefined ? pkg.marginBottom : marginB,
          borderRadius: isGrid ? 12 : 16,
        }
      ]}
      wrap={false}
    >
      {pkg.showHeader !== false && (
        <>
          <Text style={[styles.packageTitle, { fontSize: titleSize, marginBottom: totalPkgs >= 3 ? 4 : 8 }]}>{pkg.title}</Text>
          <View style={[styles.packageLine, { height: headerBarHeight, backgroundColor: pkg.color || "#000", marginBottom: totalPkgs >= 3 ? 8 : 12 }]} />
          <Text style={[styles.packageSubtitle, { fontSize: subtitleSize, color: pkg.color || "#000", marginBottom: totalPkgs >= 3 ? 8 : 12 }]}>
            {pkg.subtitle}
          </Text>
          <Text style={[styles.packagePrice, { fontSize: priceSize, marginBottom: totalPkgs >= 3 ? 8 : 16 }]}>
            {pkg.price
              && `${pkg?.currency || pkg.globalCurrency || "$"} ${pkg.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} / Month`}
          </Text>
        </>
      )}

      <Text style={[styles.featuresTitle, { fontSize: itemSize + 1, marginBottom: totalPkgs >= 3 ? 8 : 12 }]}>
        {pkg.isContinued ? "...Continued" : isGrid ? "Includes:" : "What's Included"}
      </Text>

      {pkg.items?.map((item, i) => (
        <View key={i} style={[styles.featureItem, { marginBottom: itemMarginB }]}>
          <Text style={[styles.bullet, { marginRight: 10, fontSize: itemSize }]}>•</Text>
          <Text style={{ textAlign: "left", flex: 1, fontSize: itemSize }}>{item}</Text>
        </View>
      ))}

      {pkg.continueNext && (
        <Text style={[styles.continuationNote, { fontSize: itemSize, marginTop: 10 }]}>→ Continued on next page</Text>
      )}
    </View>
  );
};

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

  return (
    <>
      {pages.map((page, pageIdx) => {
        const gridChunks = [];
        for (let i = 0; i < page.grid.length; i += 2) {
          gridChunks.push(page.grid.slice(i, i + 2));
        }

        // Calculate sizes based on vertical rows count on this page
        const totalPkgs = page.standalone.length + Math.ceil(page.grid.length / 2);

        let pageTitleSize = 20;
        let pageTitleMb = 10;
        let headingSize = 28;
        let headingMt = 10;
        let headingMb = 20;
        let subheadingSize = 12;
        let dividerMy = 15;
        let textElMb = 15;
        let mainHeadingSize = 28;
        let textFontSize = 11;
        let gridGap = 20;
        let gridRowMb = 30;

        if (totalPkgs === 2) {
          pageTitleSize = 16;
          pageTitleMb = 6;
          headingSize = 22;
          headingMt = 6;
          headingMb = 12;
          subheadingSize = 10;
          dividerMy = 10;
          textElMb = 10;
          mainHeadingSize = 22;
          textFontSize = 10;
          gridGap = 12;
          gridRowMb = 16;
        } else if (totalPkgs >= 3) {
          pageTitleSize = 14;
          pageTitleMb = 4;
          headingSize = 18;
          headingMt = 4;
          headingMb = 8;
          subheadingSize = 9;
          dividerMy = 6;
          textElMb = 6;
          mainHeadingSize = 18;
          textFontSize = 9;
          gridGap = 8;
          gridRowMb = 8;
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
                <Text style={[styles.pageTitle, { fontSize: pageTitleSize, marginBottom: pageTitleMb }]}>{pageTitle}</Text>
                <Text style={[styles.mainHeading, { fontSize: headingSize, marginTop: headingMt, marginBottom: headingMb }]}>{heading}</Text>
                <Text style={[styles.subheading, { fontSize: subheadingSize }]}>{subheading}</Text>
                <View style={[styles.divider, { marginVertical: dividerMy }]} />

                {textElements.map((el, i) => (
                  <Text key={i} style={[styles.textContent, { fontSize: el.type === "mainHeading" ? mainHeadingSize : textFontSize, marginBottom: textElMb }]}>{el.content}</Text>
                ))}
              </>
            )}

            {/* Standalone Packages */}
            {page.standalone.map((pkg, i) => (
              <PackageBox key={`${pkg.id}-${i}`} pkg={{ ...pkg, globalCurrency }} totalPkgs={totalPkgs} />
            ))}

            {/* Grid Packages - 2 per row */}
            {gridChunks.map((row, rowIdx) => {
              const isCenteredRow = row.some(p => p.isContinued);
              return (
                <View key={`row-${rowIdx}`} style={[styles.gridRow, { gap: gridGap, marginBottom: gridRowMb }, isCenteredRow && { justifyContent: "center" }]}>
                  {row.filter(p => p.type !== "placeholder").map((pkg, colIdx) => (
                    <PackageBox key={`${pkg.id}-${rowIdx}-${colIdx}`} pkg={{ ...pkg, globalCurrency }} totalPkgs={totalPkgs} />
                  ))}
                </View>
              );
            })}

            {/* Fixed Footer */}
            <View fixed style={styles.footer}>
              <Image src={FOOTER_IMG} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </View>
            {showLabels && (
              <View style={styles.labelContainer} fixed>
                <View style={styles.labelBox}>
                  <Text style={styles.labelText}>Pricing Page</Text>
                </View>
              </View>
            )}
          </Page>
        );
      })}
    </>
  );
};

export default PdfPricingPage;