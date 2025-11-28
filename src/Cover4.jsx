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
    backgroundColor: "#fff",
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
    color: "#333",
    marginBottom: 10,
  },
  mainHeading: {
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
     fontSize: 28,
    fontWeight: "bold",
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
    color: "#333",
    lineHeight: 1.6,
    marginBottom: 15,
  },
  standalonePackage: {
    border: "2px solid #e0e0e0",
    borderRadius: 16,
    padding: 28,
    marginBottom: 30,
    backgroundColor: "#fff",
  },
  gridPackage: {
    flex: 1,
    minWidth: 240,
    border: "2px solid #e0e0e0",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",
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
    fontStyle: "italic",
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
const splitPackage = (pkg, maxHeight = 420) => {
  if (estimatePackageHeight(pkg) <= maxHeight) {
    return [{ ...pkg, isSplit: false }];
  }

  const chunks = [];
  const items = pkg.items || [];
  let currentChunkItems = [];
  let currentHeight = BASE_PACKAGE_HEIGHT + (pkg.isContinued ? 20 : 0);

  items.forEach((item, idx) => {
    const itemH = estimateItemHeight(item);
    if (currentHeight + itemH + (idx === items.length - 1 && currentChunkItems.length > 0 ? 20 : 0) > maxHeight) {
      // Push current chunk
      chunks.push({
        ...pkg,
        items: currentChunkItems,
        isSplit: true,
        splitPart: chunks.length === 0 ? "start" : "middle",
        showHeader: chunks.length === 0,
        continueNext: true,
      });

      // Start new chunk
      currentChunkItems = [item];
      currentHeight = BASE_PACKAGE_HEIGHT + 30; // reset + padding for "Continued"
    } else {
      currentChunkItems.push(item);
      currentHeight += itemH;
    }
  });

  // Push last chunk
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

// ======================== PAGE ORGANIZER ========================
const organizeIntoPages = (standalonePkgs, gridPkgs) => {
  const pages = [];
  let currentPage = { standalone: [], grid: [], heightUsed: 0 };
  let firstPageExtraHeight = 220; // heading, subheading, etc on first page

  const startNewPage = () => {
    if (currentPage.standalone.length || currentPage.grid.length) {
      pages.push(currentPage);
    }
    currentPage = { standalone: [], grid: [], heightUsed: pages.length === 0 ? firstPageExtraHeight : 0 };
  };

  // Helper to add package chunks
  const addPackageChunks = (chunks) => {
    chunks.forEach((chunk) => {
      const h = estimatePackageHeight(chunk) + 30; // margin bottom

      if (currentPage.heightUsed + h > PAGE_CONTENT_HEIGHT) {
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
  const chunks = splitPackage(pkg);

  // ===========================================
  // IF PACKAGE IS NOT SPLIT → NORMAL HEIGHT CHECK
  // ===========================================
  if (chunks.length === 1 && !chunks[0].isSplit) {
    const pkgHeight = estimatePackageHeight(chunks[0]) + 30;

    if (currentPage.heightUsed + pkgHeight > PAGE_CONTENT_HEIGHT) {
      startNewPage();
    }

    currentPage.standalone.push({ ...chunks[0], type: "standalone" });
    currentPage.heightUsed += pkgHeight;
    return;
  }

  // ===========================================
  // IF PACKAGE IS SPLIT → use old behaviour
  // (this keeps continuation working as before)
  // ===========================================
  addPackageChunks(chunks.map(c => ({ ...c, type: "standalone" })));
});

  

  // Process grid packages (2 per row)
gridPkgs.forEach((pkg, index) => {
  const chunks = splitPackage(pkg, 380);

  chunks.forEach((chunk) => {
    const pkgHeight = estimatePackageHeight(chunk) + 30;

    // ---------------------------------------------
    // GRID FIX: Check row height, not individual box
    // ---------------------------------------------
    const isFirstInRow = (currentPage.grid.length % 2 === 0);

    // If this is second item in row → row height already counted
    if (!isFirstInRow) {
      // second item of same row → no height increase
      currentPage.grid.push({ ...chunk, type: "grid" });
      return;
    }

    // First item in row → new row height check
    if (currentPage.heightUsed + pkgHeight > PAGE_CONTENT_HEIGHT) {
      startNewPage();
    }

    // Add first item of new row
    currentPage.grid.push({ ...chunk, type: "grid" });
    currentPage.heightUsed += pkgHeight;
  });
});



  if (currentPage.standalone.length || currentPage.grid.length) {
    pages.push(currentPage);
  }

  return pages.length > 0 ? pages : [currentPage];
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
    && `PKR ${pkg.price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} / Month`}
</Text>
      </>
    )}

    <Text style={styles.featuresTitle}>
      {pkg.isContinued ? "...Continued" : pkg.type === "grid" ? "Includes:" : "What's Included"}
    </Text>

    {pkg.items?.map((item, i) => (
      <View key={i} style={styles.featureItem}>
        <Text style={styles.bullet}>•</Text>
        <Text>{item}</Text>
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
            {/* Fixed Header */}
            <View fixed style={styles.header}>
              <Image src="/new-header.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </View>

            {/* First Page Only Content */}
            {pageIdx === 0 && (
              <>
                <Text style={styles.pageTitle}>{pageTitle}</Text>
                <Text style={styles.mainHeading}>{heading}</Text>
                <Text style={styles.subheading}>{subheading}</Text>
                <View style={styles.divider} />

                {textElements.map((el, i) => (
                  <Text key={i} style={styles.textContent}>{el.content}</Text>
                ))}
              </>
            )}

            {/* Standalone Packages */}
            {page.standalone.map((pkg, i) => (
              <PackageBox key={`${pkg.id}-${i}`} pkg={pkg} />
            ))}

            {/* Grid Packages - 2 per row */}
            {gridChunks.map((row, rowIdx) => (
              <View key={`row-${rowIdx}`} style={styles.gridRow}>
                {row.map((pkg, colIdx) => (
                  <PackageBox key={`${pkg.id}-${rowIdx}-${colIdx}`} pkg={pkg} />
                ))}
              </View>
            ))}

            {/* Fixed Footer */}
            <View fixed style={styles.footer}>
              <Image src="/footer.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </View>
          </Page>
        );
      })}
    </>
  );
};

export default PdfPricingPage;