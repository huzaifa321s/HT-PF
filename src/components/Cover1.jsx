// src/components/pdf-pages/PdfCoverPage.pdf.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Image,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  StyleSheet,
} from "@react-pdf/renderer";
import PdfTracker from "../utils/PdfTracker";
import { COVER_BG, LOGO } from "../utils/pdfImageAssets";
import { resolveImageUrl } from "../utils/resolveImageUrl";

const styles = StyleSheet.create({
  page: { position: "relative", fontFamily: "Oswald" },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  logoContainer: {
    position: "absolute",
    top: 15,
    left: 50,
  },
  logo: { width: 185, height: 185 },
  mainContainer: {
    position: "absolute",
    top: 350,
    left: 50,
    right: 20
  },
  brandName: {
    fontFamily: "Unbounded",
    color: "#FFF",
    fontSize: 24,
    fontWeight: 700,

    margin: 0,
    padding: 0,
  },

  proposalBy: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: 600,
    marginTop: 40,
  },
  proposalByOrange: { color: "#F3A833" },
  // Decorative line container
  decorativeLine: {
    marginLeft: 8,
  },
  lineContainer: {
    marginLeft: 12,
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
    height: 14,
  },
  brandTagline: {
    color: "#F3A833",
    fontSize: 58,
    fontWeight: 900,
    fontFamily: "Unbounded",
    lineHeight: 1.1,
    margin: 0,
    padding: 0,
    marginTop: 5,
    marginBottom: 0,
  },

  lastWords: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1,
    margin: 0,
    padding: 0,
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
  clientLogoContainer: {
    width: 70, // Reduced from 80
    height: 70, // Reduced from 80
    borderRadius: 35, // Adjusted for 70x70
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #FFFFFF",
    overflow: "hidden"
  },
  clientLogo: {
    width: "100%",
    height: "100%",
  },
  clientSection: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  clientInfo: {
    flexDirection: "column",
    gap: 2,
  },
  preparedFor: {
    color: "#FFFFFF",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    opacity: 0.8,
  },
  clientName: {
    color: "#F3A833",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 2,
  },
  proposalDate: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.7,
  },
});

export const PdfCoverPage = ({
  brandName = "Your Brand",
  brandTagline = "Your Tagline Here",
  clientLogo = null,
  clientLogoFit = "contain",
  showLabels = false,
  clientName = "",
  date = "",
  showClientSection = true,
}) => {
  return (
    <Page size="A4" style={styles.page}>
      <PdfTracker section="Cover Page" />
      {/* Background */}
      <View style={styles.backgroundImage}>
        <Image src={COVER_BG} style={{ width: "100%", height: "100%" }} />
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image style={styles.logo} src={LOGO} />
      </View>

      {/* Main Content */}
      <View style={styles.mainContainer}>
        {/* Brand Name + Line + Tagline */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 0,
          }}
        >
          <Text style={styles.brandName}>{brandName}</Text>

          {/* Premium Gradient Line */}
          <View style={{ ...styles.decorativeLine, flex: 1, height: 2, marginLeft: 12 }}>
            <Svg width="100%" height="2">
              <Defs>
                <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#F3A833" />
                  <Stop offset="70%" stopColor="#F3A833" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="2"
                fill="url(#grad)"
                rx="1"
              />
            </Svg>
          </View>
        </View>

        {/* Tagline */}
        <View style={{ marginTop: 8, marginBottom: 0 }}>
          {brandTagline?.trim().toLowerCase() === "crafting legacies that last" ? (
            <View>
              <Text style={{ ...styles.brandTagline, color: "#F3A833" }}>Crafting Legacies</Text>
              <Text style={{ ...styles.brandTagline, color: "#FFFFFF", fontSize: 44, marginTop: 6 }}>That Last</Text>
            </View>
          ) : (
            <Text style={styles.brandTagline}>{brandTagline}</Text>
          )}
        </View>

        {/* Proposal By */}
        <Text style={styles.proposalBy}>
          Proposal by <Text style={styles.proposalByOrange}>Humantek</Text>
        </Text>

        {/* Client Section */}
        {showClientSection && (
          <View style={styles.clientSection}>
            {clientLogo && (
              <View style={[styles.clientLogoContainer, clientLogoFit === "fill" ? { border: "none" } : {}]}>
                <Image src={resolveImageUrl(clientLogo)} style={[styles.clientLogo, { objectFit: clientLogoFit === "fill" ? "cover" : "contain" }]} />
              </View>
            )}

            <View style={styles.clientInfo}>
              <Text style={styles.preparedFor}>Prepared for:</Text>
              <Text style={styles.clientName}>{clientName || "Valued Client"}</Text>
              <Text style={styles.proposalDate}>{date || "January 2026"}</Text>
            </View>
          </View>
        )}
      </View>
      {showLabels && (
        <View style={styles.labelContainer} fixed>
          <View style={styles.labelBox}>
            <Text style={styles.labelText}>Brand Page</Text>
          </View>
        </View>
      )}
    </Page>
  );
};
