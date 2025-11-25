// src/components/FullProposalPreview.jsx
import React from "react";
import { useSelector } from "react-redux";
import { PDFViewer, Document } from "@react-pdf/renderer";
import { Box } from "@mui/material";

// Sirf CONTENT (Page) import karo — Document ya PDFViewer nahi!
import { PdfDocument, PdfPage1 } from "./Page1pdf";
import { PdfPage2 } from "./PdfPage2";
import PdfPage3 from "./Page3PDF";
// import PdfPage4 from "./PDFPage4";
import PdfPaymentTermsPage from "./PDfPaymentTermsPage";
const FullProposalPreview = () => {
  // Yahan se sab data nikaal lo — Redux Provider ke andar hai yeh component
  const coverData = useSelector((state) => state.cover || {}); // Page1pdf ka data
  const page2Data = useSelector((state) => state.page2 || {});
  const page3Data = useSelector((state) => state.page3 || {});
  const pricingData = useSelector((state) => state.pricing?.pageData?.["default-pricing-page"] || {});
  const paymentTerms = useSelector((state) => state.paymentTerms || { title: "Payment Terms", terms: [] });

  return (
    <Box sx={{ width: "100vw", height: "100vh", bgcolor: "#f5f5f5" }}>
      <PDFViewer width="100%" height="100%" showToolbar={true}>
        <Document title="Humantek Proposal - Full" author="Humantek IT Services">

          {/* COVER PAGE */}
          <PdfPage1 />

          {/* PAGE 2 */}
          <PdfPage2 {...page2Data} />

          {/* PAGE 3 */}
          <PdfPage3 {...page3Data} />

          {/* PRICING PAGE (Page4) */}
          {/* <PdfPage4 {...pricingData} /> */}

          {/* PAYMENT TERMS PAGE */}
          <PdfPaymentTermsPage 
            title={paymentTerms.title} 
            terms={paymentTerms.terms} 
          />

          {/* Aur kitne bhi pages add kar sakta hai */}

        </Document>
      </PDFViewer>
    </Box>
  );
};

export default FullProposalPreview;