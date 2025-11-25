// src/components/pdf/ProposalPDF.jsx
import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";

const ProposalPDF = ({ formData }) => (
  <Document>
    <Page size="A4" style={{ padding: 0 }}>
      <View>
        <Text>Page 1 - {formData.projectTitle || "Test"}</Text>
      </View>
    </Page>
    <Page size="A4" style={{ padding: 0 }}>
      <View>
        <Text>Page 2 - {formData.brandName || "Test"}</Text>
      </View>
    </Page>
    <Page size="A4" style={{ padding: 0 }}>
      <View>
        <Text>Page 3 - Test</Text>
      </View>
    </Page>
    <Page size="A4" style={{ padding: 0 }}>
      <View>
        <Text>Page 4 - Test</Text>
      </View>
    </Page>
    <Page size="A4" style={{ padding: 0 }}>
      <View>
        <Text>Page 5 - Test</Text>
      </View>
    </Page>
  </Document>
);

export default ProposalPDF;