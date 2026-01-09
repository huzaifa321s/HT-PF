import { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { Document, Page, Text, View, pdf } from "@react-pdf/renderer";

export const PdfEditor = ({pdfURL}) => {
  const [editedPdfUrl, setEditedPdfUrl] = useState(pdfURL);
console.log('edit',editedPdfUrl)
console.log("pdfURL",pdfURL)
  const editPdf = async () => {
    // Step 1: Existing PDF load karo (public folder se ya upload se)
    const existingPdfBytes = await fetch("/uploads/pdfs/1762764957941-sda_proposal.pdf").then(res => res.arrayBuffer());

    // Step 2: pdf-lib se modify karo
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPage(0); // first page

    // Text edit example (x,y position pe naye text daalo ya overwrite)
    page.drawText("Yeh NAYA EDITED TEXT hai!", {
      x: 50,
      y: 500,
      size: 20,
      color: pdfDoc.register(pdfDoc.rgb(1, 0, 0)), // red color
    });

    // Save modified PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setEditedPdfUrl(url);
  };

  return (
    <div>

      {editedPdfUrl && (
        <iframe src={editedPdfUrl} width="100%" height="800px" title="Edited PDF" />
      )}
    </div>
  );
};