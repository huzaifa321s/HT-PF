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

// ====================== PDF STYLES ======================
const styles = StyleSheet.create({
  page: {
    position: "relative",
    paddingTop: 60,
    paddingBottom: 90,
    paddingHorizontal: 60,
    fontSize: 11,
    color: "#333",
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
    height: 50,
    zIndex: 10,
  },

  divider: {
    height: 1.5,
    backgroundColor: "#000",
    marginVertical: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    marginTop: 28,
    marginBottom: 10,
  },

  paragraph: {
    fontSize: 11,
    lineHeight: 1.8,
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
    marginBottom: 28,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
  },

  tableHeaderCell: {
    padding: 14,
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
    padding: 12,
    fontSize: 10.5,
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
  labelContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  labelBox: {
    backgroundColor: "#FF8C00",
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
  // Render Dynamic Sections (same as before)
  const renderSection = (sec, idx, isLast, tableLength) => {
    const key = sec.id || idx;

    const renderBoldText = (text) => {
      const segments = parseInlineBold(text);
      return segments.map((seg, i) => (
        <Text
          key={i}
          style={{ fontWeight: seg.bold ? 800 : 400 }}
        >
          {seg.text}
        </Text>
      ));
    };

    if (sec.type === "plain") {
      return (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.sectionContent}>{renderBoldText(sec.content)}</Text>
          {(!isLast || tableLength > 0) && <View style={styles.divider} />}
        </View>
      );
    }

    if (sec.type === "title") {
      return (
        <View key={key} style={{ marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>{renderBoldText(sec.content)}</Text>
          {(!isLast || tableLength > 0) && <View style={styles.divider} />}
        </View>
      );
    }

    if (sec.type === "bullets") {
      const lines = sec.content.split("\n").filter((l) => l.trim());
      return (
        <View key={key} style={{ marginBottom: 12 }}>
          {sec.title && (
            <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 8 }]}>
              {renderBoldText(sec.title)}
            </Text>
          )}
          {lines.map((line, i) => (
            <View key={i} style={styles.bulletRow} wrap={false}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.sectionContent}>
                {renderBoldText(line.replace(/^[•·-]\s*/, ""))}
              </Text>
            </View>
          ))}
          {(!isLast || tableLength > 0) && <View style={styles.divider} />}
        </View>
      );
    }

    if (sec.type === "numbered") {
      const lines = sec.content.split("\n").filter((l) => l.trim());
      return (
        <View key={key} style={{ marginBottom: 15 }}>
          {sec.title && (
            <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 8 }]}>
              {renderBoldText(sec.title)}
            </Text>
          )}
          {lines.map((line, i) => (
            <View key={i} style={styles.bulletRow} wrap={false}>
              <Text style={styles.bulletNumber}>{i + 1}.</Text>
              <Text style={styles.sectionContent}>
                {renderBoldText(line.replace(/^\d+\.\s*/, ""))}
              </Text>
            </View>
          ))}
          {(!isLast || tableLength > 0) && <View style={styles.divider} />}
        </View>
      );
    }

    if (sec.type === "mixed") {
      const blocks = parseMixedContent(sec.content);
      return (
        <View key={key}>
          {blocks.map((block, bIdx) =>
            renderSection(
              { ...block, id: `${key}-b${bIdx}` },
              bIdx,
              bIdx === blocks.length - 1,
              tableLength
            )
          )}
        </View>
      );
    }

    return null;
  };

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
      {/* Page 1: Dynamic Content */}
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

        {/* Page 2: All Tables (Only if any table has data) */}
        {tables.length > 0 && tables.some((t) => t.rows.length > 0) && (
          <>
            <View fixed style={styles.header}>
              <Image
                src="/new-header.png"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </View>

            {/* Render All Custom Tables (2-column and 3-column) */}
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
          </>
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
      </Page>
    </>
  );
};

export default PdfPageDocument2;