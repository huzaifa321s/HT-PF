"use client";
// src/components/pdf-pages/CombinedPdfDocument.jsx
import { memo } from "react";
import { Document } from "@react-pdf/renderer";
import { PdfCoverPage } from "./Cover1";
import PdfPage3Document from "./Cover2";
import PdfPageDocument2 from "./Cover3";
import PdfPricingPage from "./Cover4";
import { PdfPaymentTermsCoverPage } from "./Cover5";
import FixedImagePdfPage, { FixedImagePage } from "./FixedImagePdf";
import PdfTracker from "../utils/PdfTracker";
import { ARTBOARD_1, ARTBOARD_2, ARTBOARD_3, ARTBOARD_4, ARTBOARD_5 } from "../utils/pdfImageAssets";


// ✅ Re-introduced memo for performance optimization
const MemoizedCoverPage = memo(PdfCoverPage);
const MemoizedPage3 = memo(PdfPage3Document);
const MemoizedPage2 = memo(PdfPageDocument2);
const MemoizedPricingPage = memo(PdfPricingPage);
const MemoizedPaymentTerms = memo(PdfPaymentTermsCoverPage);
const MemoizedFixedImage = memo(FixedImagePdfPage);

const CombinedPdfDocument = ({
  page1Data = {},
  page2Data = {},
  page3Data = {},
  pricingPage = {},
  paymentTerms = {},
  contactData = {},
  showLabels = false,
  clientName = "",
  date = "",
}) => {

  return (
    <Document title="Proposal - Humantek" author="Humantek IT Solutions">
      {/* Page 1: Cover */}
      <MemoizedCoverPage
        brandName={page1Data?.brandName}
        brandTagline={page1Data?.brandTagline}
        showLabels={showLabels}
        clientName={clientName}
        date={date}
        showClientSection={page1Data?.showClientSection !== false}
      />

      {/* Page 2: About HumanTek */}
      {page2Data?.includeInPdf !== false && (
        <MemoizedPage3
          elements={page2Data?.elements}
          subtitle={page2Data?.subtitle}
          title={page2Data?.title}
          showLabels={showLabels}
        />
      )}

      {/* Artboard Pages (Added by default after About HT page) */}
      <FixedImagePage src={ARTBOARD_1} />
      <FixedImagePage src={ARTBOARD_2} />
      <FixedImagePage src={ARTBOARD_3} />
      <FixedImagePage src={ARTBOARD_4} />
      <FixedImagePage src={ARTBOARD_5} />

      {/* Page 3: Additional Info */}
      {page3Data?.includeInPdf !== false && (
        <MemoizedPage2
          orderedSections={page3Data?.orderedSections}
          tables={page3Data?.tables}
          showLabels={showLabels}
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
          showLabels={showLabels}
          globalCurrency="$"
          showTotal={pricingPage?.showTotal}
          totalLabel={pricingPage?.totalLabel}
          totalValue={pricingPage?.totalValue}
          totalSize={pricingPage?.totalSize}
          totalAlign={pricingPage?.totalAlign}
          totalBottom={pricingPage?.totalBottom}
        />
      )}

      {/* Page 5: Payment Terms */}
      {paymentTerms?.includeInPdf !== false && (
        <MemoizedPaymentTerms {...paymentTerms} showLabels={showLabels} />
      )}
      {/* Page 6: Fixed Image */}
      <PdfTracker section="Contact" />
      <MemoizedFixedImage />
    </Document>
  );
};

CombinedPdfDocument.displayName = "CombinedPdfDocument";

export default CombinedPdfDocument;
