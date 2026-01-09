import { forwardRef } from 'react';
import { Box, Paper } from '@mui/material';
import Page1Cover from '../pdf/Page1Cover';
import Page2Details from '../pdf/Page2Details';
import Page3Additional from '../pdf/Page3AdditionalInfo';
import Page4About from '../pdf/Page4AboutHumantek';
import Page5Contact from '../pdf/Page5Contact';

const PDFPreview = forwardRef(({ formData }, ref) => {
  return (
    <Paper ref={ref} sx={{ p: 0 }}>
      <Page1Cover formData={formData} />
      <Box sx={{ pageBreakAfter: 'always' }} />
      
      <Page2Details formData={formData} />
      <Box sx={{ pageBreakAfter: 'always' }} />
      
      <Page3Additional formData={formData} />
      <Box sx={{ pageBreakAfter: 'always' }} />
      
      <Page4About formData={formData} />
      <Box sx={{ pageBreakAfter: 'always' }} />
      
      <Page5Contact formData={formData} />
    </Paper>
  );
});

export default PDFPreview;