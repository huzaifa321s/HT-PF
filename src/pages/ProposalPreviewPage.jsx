import { useRef } from 'react';
import { Box, Container, Button, Stepper, Step, StepLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { generatePDF, createProposal, prevStep } from '../features/proposals/proposalSlice';
import PDFPreview from '../components/transcription/PDFPreview';

const steps = ['Transcription', 'Fill Form', 'Generate PDF'];

export default function ProposalPreviewPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pdfRef = useRef(null);
  
  const currentStep = useSelector((state) => state.proposal.currentStep);
  const formData = useSelector((state) => state.proposal.formData);
  const { pdfLoading } = useSelector((state) => state.proposal);

  const handleBack = () => {
    dispatch(prevStep());
    navigate('/proposal/form');
  };

  const handleGeneratePDF = async () => {
    if (!pdfRef.current) return;

    // Create proposal in backend
    await dispatch(createProposal(formData));

    // Generate PDF
    const pdfBlob = await dispatch(
      generatePDF({ formData, pdfElement: pdfRef.current })
    ).unwrap();

    // Download PDF
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.clientName || 'proposal'}_proposal.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <PDFPreview ref={pdfRef} formData={formData} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={handleBack}>
          Back to Form
        </Button>
        <Button
          variant="contained"
          onClick={handleGeneratePDF}
          disabled={pdfLoading}
        >
          {pdfLoading ? 'Generating...' : 'Generate PDF'}
        </Button>
      </Box>
    </Container>
  );
}