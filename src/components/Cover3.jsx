"use client";
// src/components/pdf-pages/PdfPageDocument2.pdf.jsx

import { Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { HEADER_IMG, FOOTER_IMG } from "../utils/pdfImageAssets";
import { RichTextRenderer } from "../utils/RichTextRenderer";
import { useDispatch, useSelector } from "react-redux";
import { setPageCount } from "../utils/page2Slice";
import PdfTracker from "../utils/PdfTracker";

// ====================== PDF STYLES ======================
const styles = StyleSheet.create({
  page: {
    position: "relative",
    paddingTop: 60,
    paddingBottom: 90,
    paddingHorizontal: 60,
    fontSize: 11,
    color: "#4a4a4a",
    fontFamily: "Helvetica",
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 10,
    overflow: "hidden",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 10,
    overflow: "hidden",
  },

  divider: {
    height: 1.5,
    backgroundColor: "#000",
    marginVertical: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 0,
    marginBottom: 6,
    textAlign: "left",
  },

  paragraph: {
    fontSize: 12.5,
    lineHeight: 1.6,
    marginBottom: 16,
    textAlign: "justify",
  },

  bulletItem: {
    fontSize: 13,
    lineHeight: 1.8,
    marginBottom: 6,

  },

  numberedMain: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },

  tableTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 32,
    marginBottom: 14,
  },

  tableWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    borderRadius: 6,
    marginBottom: 20,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
  },

  tableHeaderCell: {
    padding: 10,
    fontWeight: "bold",
    fontSize: 13,
    color: "#fff",
    textAlign: "start",
    flex: 1,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  tableCell: {
    padding: 8,
    fontSize: 12,
    textAlign: "start",
    flex: 1,
  },

  noteText: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 30,
    // fontStyle: "italic",
    textAlign: "start",
  },
  sectionHeadingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
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

// Helper to estimate height of a section in points to prevent orphan headings
const estimateSectionHeight = (sec) => {
  if (!sec) return 0;
  let height = 0;

  if (sec.type === "heading") {
    return 98;
  }

  // Regular section wrapper has marginBottom: 14 in renderSection
  height += 14;

  // Title
  if (sec.title) {
    if (sec.type === "title") {
      height += 36;
    } else {
      height += 21;
    }
  }

  // Content
  if (sec.content?.trim()) {
    const text = sec.content.replace(/<[^>]+>/g, "").trim();
    if (text) {
      const charCount = text.length;
      const lines = Math.max(1, Math.ceil(charCount / 75));
      const lineSpacing = 12.5 * 1.6; // 20pt
      height += lines * lineSpacing;
    }
    if (sec.type === "bullets" || sec.type === "numbered") {
      height += 12;
    }
  }

  return height;
};

const PdfPageDocument2 = ({
  orderedSections = [],
  tables = [],
  showLabels = false,
}) => {
  const dispatch = useDispatch();

  // Tracker Logic to update page count
  const Tracker = () => {
    const storedCount = useSelector((state) => state.page2?.[state.page2?.currentMode]?.currentPages);

    return (
      <Text
        fixed
        style={{ fontSize: 0, height: 0, width: 0, opacity: 0 }}
        render={({ totalPages }) => {
          if (totalPages && totalPages !== storedCount) {
            // Dispatch asynchronously
            setTimeout(() => dispatch(setPageCount(totalPages)), 0);
          }
          return "";
        }}
      />
    );
  };
  // Render Section
  const renderSection = (sec, idx, isLast, tableLength) => {
    const key = sec.id || idx;

    if (!sec.content?.trim() && !sec.title?.trim()) return null;

    if (sec.type === "heading") {
      const nextSec = orderedSections[idx + 1];
      const nextHeight = nextSec ? estimateSectionHeight(nextSec) : 100;
      const mpa = Math.min(200, Math.max(120, nextHeight + 10));

      const hasBorder = !sec.hideBorder;
      const borderColor = sec.color || "#000000";

      return (
        <View
          key={key}
          style={[
            {
              marginTop: idx === 0 ? 10 : 32,
              marginBottom: 16,
              paddingBottom: 6,
            },
            hasBorder && {
              borderBottomWidth: 1.5,
              borderBottomColor: borderColor,
            }
          ]}
          minPresenceAhead={mpa}
        >
          <Text style={[
            styles.sectionHeadingText,
            sec.titleAlign && { textAlign: sec.titleAlign },
            sec.color && { color: sec.color }
          ]}>
            {sec.title}
          </Text>
        </View>
      );
    }

    return (
      <View key={key} style={{ marginBottom: 18 }}>
        {sec.title && <Text style={styles.sectionTitle}>{sec.title}</Text>}
        {sec.content?.trim() && <RichTextRenderer html={sec.content} />}
        {!isLast && orderedSections[idx + 1]?.type !== "heading" && (
          <View style={[styles.divider, { marginTop: 16, marginBottom: 0 }]} />
        )}
      </View>
    );
  };

  // Sections are already handled by generic renderSection

  // Render a single dynamic table (supports 2 or 3 columns)
  const renderTable = (table) => {
    console.log('tablesssssssssssss', table);
    if (!table?.rows?.length) return null;

    const columnCount = table.columnCount || 2;
    const isThreeColumn = columnCount === 3;

    return (
      <View key={table.id} wrap={false}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 32,
            marginBottom: 14,
          }}
        >
          {table?.title || "No Title"}
        </Text>
        <View style={styles.tableWrapper}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>{table.headers.col1}</Text>
            <Text style={styles.tableHeaderCell}>{table.headers.col2}</Text>
            {isThreeColumn && (
              <Text style={styles.tableHeaderCell}>{table.headers.col3}</Text>
            )}
          </View>

          {/* Table Rows */}
          {table.rows.map((row, i) => (
            <View key={row.id || i} style={styles.tableRow} wrap={false}>
              {/* First Column */}
              <Text
                style={[
                  styles.tableCell,
                  {
                    borderRightWidth: 1,
                    borderRightColor: "#e0e0e0",
                  },
                ]}
              >
                {row.col1 || "—"}
              </Text>

              {/* Second Column */}
              <Text
                style={[
                  styles.tableCell,
                  isThreeColumn && {
                    borderRightWidth: 1,
                    borderRightColor: "#e0e0e0",
                  },
                ]}
              >
                {row.col2 !== undefined && row.col2 !== ""
                  ? typeof row.col2 === "number"
                    ? `Rs. ${row.col2.toLocaleString()}`
                    : row.col2
                  : "—"}
              </Text>

              {/* Third Column (only for 3-column tables) */}
              {isThreeColumn && (
                <Text style={styles.tableCell}>
                  {row.col3 !== undefined && row.col3 !== ""
                    ? typeof row.col3 === "number"
                      ? `Rs. ${row.col3.toLocaleString()}`
                      : row.col3
                    : "—"}
                </Text>
              )}
            </View>
          ))}
        </View>
        <View style={styles.divider} />
      </View>
    );
  };

  console.log('tables----------------', tables);
  return (
    <>
      <Page size="A4" style={styles.page} wrap>
        <View fixed style={styles.header}>
          <Image
            src={HEADER_IMG}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 120, // 595.28 width / 4.96 ratio = 120 height
            }}
          />
        </View>
        {orderedSections.length > 0 ? (
          orderedSections.map((sec, idx) =>
            renderSection(
              sec,
              idx,
              idx === orderedSections.length - 1,
              tables?.length
            )
          )
        ) : (
          <Text style={styles.paragraph}>No content has been added yet.</Text>
        )}
        <View fixed style={styles.footer}>
          <Image
            src={FOOTER_IMG}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: 120, // 595.28 width / 4.96 ratio = 120 height
            }}
          />
        </View>
        {showLabels && (
          <View style={styles.labelContainer} fixed>
            <View style={styles.labelBox}>
              <Text style={styles.labelText}>Additional Info</Text>
            </View>
          </View>
        )}
        <PdfTracker section="Additional Info" />
        {!tables?.length && <Tracker />}
      </Page>

      {tables.length > 0 && tables.some((t) => t.rows.length > 0) && (
        <Page size="A4" style={styles.page} wrap>
          <View fixed style={styles.header}>
            <Image
              src={HEADER_IMG}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 120, // 595.28 width / 4.96 ratio = 120 height
              }}
            />
          </View>
          {tables.map((table) => table?.rows?.length > 0 && renderTable(table))}
          <Text style={styles.noteText}>
            Final pricing, deliverables & timeline will be confirmed after
            detailed scope discussion and approval.
          </Text>
          <View fixed style={styles.footer}>
            <Image
              src={FOOTER_IMG}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: 120, // 595.28 width / 4.96 ratio = 120 height
              }}
            />
          </View>
          <Tracker />
        </Page>
      )}
    </>
  );
};

export default PdfPageDocument2;
