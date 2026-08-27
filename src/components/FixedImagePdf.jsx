// src/components/FixedImagePdfPage.jsx
import { Page, Image, StyleSheet } from "@react-pdf/renderer";
import { CONTACT_PAGE } from "../utils/pdfImageAssets";

// ====================== STYLES ======================
const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    padding: 0,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover", // cover full page
  },
});

// ====================== FIXED IMAGE PDF DOCUMENT ======================
export const FixedImagePage = ({ src }) => {
  return (
    <Page size="A4" style={styles.page}>
      <Image
        src={src}
        style={styles.backgroundImage}
      />
    </Page>
  );
};

const FixedImagePdfPage = () => {
  return (
    <FixedImagePage src={CONTACT_PAGE} />
  );
};

export default FixedImagePdfPage;
