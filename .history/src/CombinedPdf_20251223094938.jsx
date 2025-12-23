// src/components/pdf-pages/CombinedPdfDocument.jsx
import React, { memo } from "react";
import { Document } from "@react-pdf/renderer";
import { PdfCoverPage } from "./Cover1";
import PdfPage3Document from "./Cover2";
import PdfPageDocument2 from "./Cover3";
import PdfPricingPage from "./Cover4";
import { PdfPaymentTermsCoverPage } from "./Cover5";
import FixedImagePdfPage from "./FixedImagePdf";
import { useSelector } from "react-redux";

// ✅ Memoized individual pages to prevent unnecessary re-renders
const MemoizedCoverPage = memo(PdfCoverPage);
const MemoizedPage3 = memo(PdfPage3Document);
const MemoizedPage2 = memo(PdfPageDocument2);
const MemoizedPricingPage = memo(PdfPricingPage);
const MemoizedPaymentTerms = memo(PdfPaymentTermsCoverPage);
const MemoizedFixedImage = memo(FixedImagePdfPage);

const CombinedPdfDocument = memo(
  ({
    page1Data = {},
    page2Data = {},
    page3Data = {},
    pricingPage = {},
    paymentTerms = {},
    showLabels = false,
  }) => {
    console.log("sss3434", page1Data);

    return (
      <Document title="Proposal - Humantek" author="Humantek IT Solutions">
        {/* Page 1: Cover */}
        <MemoizedCoverPage
          brandName={page1Data?.brandName}
          brandTagline={page1Data?.brandTagline}
        />

        {/* Page 2: About HumanTek */}
        {page2Data?.includeInPdf !== false && (
          <MemoizedPage3
            elements={page2Data?.elements}
            subtitle={page2Data?.subtitle}
            title={page2Data?.title}
          />
        )}

        {/* Page 3: Additional Info */}
        {page3Data?.includeInPdf !== false && (
          <MemoizedPage2
            orderedSections={page3Data?.orderedSections}
            tables={page3Data?.tables}
          />
        )}

        {/* Page 4: Pricing */}
        {pricingPage?.includeInPdf !== false && (
          <MemoizedPricingPage
            pageTitle={pricingPage?.pageTitle}
            heading={pricingPage?.heading}
            subheading={pricingPage?.subheading}
            elements={pricingPage?.elements}
            gridPackages={pricingPage?.gridPackages}
          />
        )}

        {/* Page 5: Payment Terms */}
        {paymentTerms?.includeInPdf !== false && (
          <MemoizedPaymentTerms {...paymentTerms} />
        )}
        {/* Page 6: Fixed Image */}
        <MemoizedFixedImage />
      </Document>
    );
  }
);

CombinedPdfDocument.displayName = "CombinedPdfDocument";

export default CombinedPdfDocument;
