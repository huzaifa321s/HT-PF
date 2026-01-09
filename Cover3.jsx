// src/components/pdf-pages/PdfPageDocument2.pdf.jsx

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { parseMixedContent, parseSmartTable, parseInlineBold } from "./utils/pdfParsers";
import { RichTextRenderer } from "./utils/RichTextRenderer";
import { useDispatch, useSelector } from "react-redux";
import { setPageCount } from "./utils/page2Slice";
import PdfTracker from "./utils/PdfTracker";

// ====================== PDF STYLES ======================
const styles = StyleSheet.create({
  page: {
    position: "relative",
    paddingTop: 60,
    paddingBottom: 90,
    paddingHorizontal: 60,
    fontSize: 11,
    color: "#333",
    fontFamily: "Helvetica",
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
    height: 50,
    zIndex: 10,
  },

  divider: {
    height: 1.5,
    backgroundColor: "#000",
    marginVertical: 8,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    marginTop: 12,
    marginBottom: 10,
    textAlign: "left",
  },

  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.6,
    marginBottom: 16,
    textAlign: "justify",
  },

  bulletItem: {
    fontSize: 11,
    lineHeight: 1.8,
    marginBottom: 6,

  },

  numberedMain: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },

  tableTitle: {
    fontSize: 16,
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
    fontSize: 11,
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
    fontSize: 10,
    textAlign: "start",
    flex: 1,
  },

  noteText: {
    fontSize: 9.5,
    color: "#666",
    marginTop: 30,
    // fontStyle: "italic",
    textAlign: "start",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 25,
    marginBottom: 15,
    textAlign: "center",
    textTransform: "uppercase",
    paddingBottom: 5,
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
    backgroundColor: "#667eea",
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
      return (
        <View key={key} style={{ marginBottom: 20, marginTop: 10 }}>
          <Text style={styles.sectionHeading}>{sec.title}</Text>
          {sec.content && <RichTextRenderer html={sec.content} />}
        </View>
      );
    }

    return (
      <View key={key} style={{ marginBottom: 10 }}>
        {sec.title && <Text style={styles.sectionTitle}>{sec.title}</Text>}
        <RichTextRenderer html={sec.content} />
        {(!isLast || tableLength > 0) && <View style={styles.divider} />}
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
            fontSize: 20,
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
            src="/new-header.png"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
            src="/footer.png"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              src="/new-header.png"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </View>
          {tables.map((table) => table?.rows?.length > 0 && renderTable(table))}
          <Text style={styles.noteText}>
            Final pricing, deliverables & timeline will be confirmed after
            detailed scope discussion and approval.
          </Text>
          <View fixed style={styles.footer}>
            <Image
              src="/footer.png"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </View>
          <Tracker />
        </Page>
      )}
    </>
  );
};

export default PdfPageDocument2;
