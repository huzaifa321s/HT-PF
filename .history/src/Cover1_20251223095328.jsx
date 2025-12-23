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
    top: 50,
    left: 50,
    flexDirection: "row",
    gap: 12,
  },
  logo: { width: 50, height: 50, borderRadius: 25 },
  logoTitle: {
    color: "#FF8C00",
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: 1.5,
  },
  logoSubtitle: { color: "#fff", fontSize: 10, letterSpacing: 2.5, },
  mainContainer: {
    position: "absolute",
    top: 350,
    left: 50,
    right: 20  // 60 se 30 kar do, ya aur kam karo jitna chaiye
  },
  brandName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: 3,

    margin: 0,
    padding: 0,
  },

  proposalBy: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: 600,
    marginTop: 40,
  },
  proposalByOrange: { color: "#FF8C00" },
  // Decorative line container
  decorativeLine: {
    marginLeft: 3,
  },
  lineContainer: {
    marginLeft: 12,
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
    height: 14,
  },
  brandTagline: {
    color: "#FF8C00",
    fontSize: 46,
    fontWeight: "bold",
    lineHeight: 1,
    margin: 0,
    padding: 0,
    marginVertical: 5,
    letterSpacing: 1
  },

  lastWords: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1,
    margin: 0,
    padding: 0,
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

export const PdfCoverPage = ({
  brandName = "Your Brand",
  brandTagline = "Your Tagline Here",
  showLabels = false,
}) => {
  const words = brandTagline.trim().split(" ");
  console.log("words", words);
  const lastTwo = words.splice(-2).join(" "); // last 2 words
  const firstPart = words.join(" "); // remaining words

  return (
    <Page size="A4" style={styles.page}>
      {showLabels && (
        <View style={styles.labelContainer} fixed>
          <View style={styles.labelBox}>
            <Text style={styles.labelText}>Brand Page</Text>
          </View>
        </View>
      )}
      {/* Background */}
      <View style={styles.backgroundImage}>
        <Image src="/newBg.png" style={{ width: "100%", height: "100%" }} />
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image style={styles.logo} src="/download.jpg" />
        <View>
          <Text style={styles.logoTitle}>HUMANTEK</Text>
          <Text style={styles.logoSubtitle}>IT SERVICES & SOLUTIONS</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContainer}>
        {/* Brand Name + Line + Tagline – All in ONE View, ZERO GAP */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 0,
          }}
        >
          <Text style={styles.brandName}>{brandName}</Text>

          {/* Premium Gradient Line – flex: 1 se remaining space le lega */}
          <View style={{ ...styles.decorativeLine, flex: 1 }}>
            <Svg width="220px" height="5">
              <Defs>
                <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#FFA94D" />
                  <Stop offset="50%" stopColor="#FFD9A3" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="5"
                fill="url(#grad)"
                rx="2"
              />
            </Svg>
          </View>
        </View>

        {/* Tagline – ZERO gap from above */}
        <View>
          <Text style={styles.brandTagline}>{firstPart}</Text>
          <Text style={styles.lastWords}>{lastTwo}</Text>
        </View>

        {/* Proposal By */}
        <Text style={styles.proposalBy}>
          Proposal by <Text style={styles.proposalByOrange}>Humantek</Text>
        </Text>
      </View>
    </Page>
  );
};
