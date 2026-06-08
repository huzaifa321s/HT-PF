import React from 'react';
import { Box } from '@mui/material';
import { CONTACT_PAGE } from "../../utils/pdfImageAssets";

const VisualContactEditor = () => {
  return (
    <Box
      component="img"
      src={CONTACT_PAGE}
      alt="Contact Page"
      sx={{
        width: "100%",
        maxWidth: "800px",
        height: "1131px",
        objectFit: "cover",
        boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
        margin: "0 auto",
        display: "block"
      }}
    />
  );
};

export default VisualContactEditor;
