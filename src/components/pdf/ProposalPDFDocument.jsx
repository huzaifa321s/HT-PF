// src/components/pdf/ProposalPDFDocument.jsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer";

// Tumhare selected fonts
Font.register({
  family: "Poppins",
  src: "https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJbecmNE.woff2",
});
Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.woff2",
});

// Styles
const createStyles = (selectedFont, layoutConfig) =>
  StyleSheet.create({
    page: {
      fontFamily: selectedFont,
      fontSize: 11,
      padding: layoutConfig?.padding || 40,
      backgroundColor: layoutConfig?.backgroundColor || "#fff",
      backgroundImage: layoutConfig?.backgroundImage || undefined,
      backgroundSize: layoutConfig?.backgroundSize || "cover",
      borderTop: layoutConfig?.borderTop || "none",
    },
    section: { marginBottom: 10 },
    heading: { fontSize: 14, marginBottom: 6, fontWeight: "bold", color: "#1976d2" },
    bodyText: { fontSize: 11, lineHeight: 1.6, marginBottom: 6 },
    chipContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
    chip: {
      fontSize: 10,
      paddingVertical: 2,
      paddingHorizontal: 4,
      marginRight: 4,
      marginBottom: 4,
      backgroundColor: "#42a5f5",
      color: "#fff",
    },
    tableRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    divider: { height: 1, backgroundColor: "#ddd", marginVertical: 6 },
    footer: { marginTop: 20 },
  });

const ProposalPDFDocument = ({ formData, pages = [], selectedFont = "Poppins", selectedLayout = {} }) => {
  const styles = createStyles(selectedFont, selectedLayout);

  // Page Renderer
  const renderPage = (page) => {
    switch (page) {
      case "Page1Cover":
        return (
          <Page size="A4" style={styles.page} wrap>
            {/* HEADER */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {formData.projectTitle || "Project Proposal"}
              </Text>
              <Text>Prepared for: {formData.clientName || "Client Name"}</Text>
              <Text>Prepared by: {formData.yourName || "Your Name"}</Text>
              <Text>Date: {formData.date || ""}</Text>
              <Text>Status: {formData.callOutcome || "Pending"}</Text>
            </View>

            {/* BUSINESS OVERVIEW */}
            <View style={styles.section}>
              <Text style={styles.heading}>1. Business Overview</Text>
              <Text style={styles.bodyText}>
                {formData.businessDescription ||
                  "This proposal outlines the project objectives, goals, and how our team aims to deliver measurable success for your business."}
              </Text>
              <View style={styles.divider} />
            </View>

            {/* PROPOSED SOLUTION */}
            <View style={styles.section}>
              <Text style={styles.heading}>2. Proposed Solution</Text>
              <Text style={styles.bodyText}>
                {formData.proposedSolution ||
                  "We will design, develop, and deploy a complete solution that aligns with your business goals using the selected platforms."}
              </Text>
              <View style={styles.divider} />
            </View>

            {/* DEVELOPMENT PLATFORMS */}
            <View style={styles.section}>
              <Text style={styles.heading}>3. Development Platforms</Text>
              <View style={styles.chipContainer}>
                {formData.developmentPlatforms?.length > 0 ? (
                  formData.developmentPlatforms.map((p, i) => (
                    <Text key={i} style={styles.chip}>
                      {p}
                    </Text>
                  ))
                ) : (
                  <Text>No platforms selected</Text>
                )}
              </View>
              <View style={styles.divider} />
            </View>

            {/* TIMELINE / MILESTONES */}
            <View style={styles.section}>
              <Text style={styles.heading}>4. Project Timeline / Milestones</Text>
              <Text style={styles.bodyText}>
                {formData.timelineMilestones ||
                  "The project is expected to be completed within 4–6 weeks with multiple review checkpoints."}
              </Text>
              <View style={styles.divider} />
            </View>

            {/* FINANCIALS */}
            <View style={styles.section}>
              <Text style={styles.heading}>5. Financial Summary</Text>
              <View style={styles.tableRow}>
                <Text>Total Project Cost:</Text>
                <Text>${formData.chargeAmount || "0"}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text>Advance Payment:</Text>
                <Text>{formData.advancePercent || "0"}%</Text>
              </View>
              <View style={styles.tableRow}>
                <Text>Additional Costs:</Text>
                <Text>{formData.additionalCosts || "N/A"}</Text>
              </View>
              <View style={styles.divider} />
            </View>

            {/* TERMS */}
            <View style={styles.section}>
              <Text style={styles.heading}>6. Terms & Conditions</Text>
              <Text style={styles.bodyText}>
                {formData.terms ||
                  "50% advance payment is required to initiate the project. The remaining amount will be paid upon completion and client approval. Any extra features will be quoted separately."}
              </Text>
              <View style={styles.divider} />
            </View>

            {/* CONTACT */}
            <View style={styles.section}>
              <Text style={styles.heading}>7. Contact Information</Text>
              <Text>
                Prepared By: {formData.yourName || "-"} | {formData.yourEmail || "—"} | {formData.yourPhone || "—"}
              </Text>
              <Text>
                Prepared For: {formData.clientName || "-"} | {formData.clientEmail || "—"}
              </Text>
            </View>
          </Page>
        );

      case "Page2BrandedCover":
        return (
          <Page size="A4" style={styles.page}>
            <Text style={styles.heading}>Branded Cover</Text>
            <Text style={styles.bodyText}>{formData.projectTitle || "Project Title"}</Text>
          </Page>
        );

      case "Page3AdditionalInfo":
        return (
          <Page size="A4" style={styles.page}>
            <Text style={styles.heading}>Additional Info</Text>
            <Text style={styles.bodyText}>{formData.additionalInfo || "—"}</Text>
          </Page>
        );

      case "Page4AboutHumantek":
        return (
          <Page size="A4" style={styles.page}>
            <Text style={styles.heading}>About Humantek</Text>
            <Text style={styles.bodyText}>{formData.aboutHumantek || "—"}</Text>
          </Page>
        );

      case "PricingTable":
        return (
          <Page size="A4" style={styles.page}>
            <Text style={styles.heading}>Pricing Table</Text>
            {formData.pricingItems?.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text>{item.name}</Text>
                <Text>${item.price}</Text>
              </View>
            ))}
          </Page>
        );

      case "PaymentTermsPage":
        return (
          <Page size="A4" style={styles.page}>
            <Text style={styles.heading}>Payment Terms</Text>
            <Text style={styles.bodyText}>{formData.paymentTerms || "—"}</Text>
          </Page>
        );

      case "Page5Contact":
        return (
          <Page size="A4" style={styles.page}>
            <Text style={styles.heading}>Contact</Text>
            <Text style={styles.bodyText}>
              Prepared By: {formData.yourName || "-"} | {formData.yourEmail || "—"} | {formData.yourPhone || "—"}
            </Text>
            <Text style={styles.bodyText}>
              Prepared For: {formData.clientName || "-"} | {formData.clientEmail || "—"}
            </Text>
          </Page>
        );

      case "CustomContentPage":
        return (
          <Page size="A4" style={styles.page}>
            <Text style={styles.heading}>Custom Content</Text>
            <Text style={styles.bodyText}>{formData.customContent || "—"}</Text>
          </Page>
        );

      default:
        return null;
    }
  };

  return <Document>{pages.map((p, i) => renderPage(p))}</Document>;
};

export default ProposalPDFDocument;
