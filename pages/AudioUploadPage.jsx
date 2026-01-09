import { Box, Container } from "@mui/material";
import AudioToProposal from "../components/UploadAudioSection";

const AudioUploadPage = ({ uploading, progress, status, transcript, handleFileUpload }) => {
  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <AudioToProposal
          uploading={uploading}
          progress={progress}
          status={status}
          transcript={transcript}
          handleFileUpload={handleFileUpload}
        />
      </Box>
    </Container>
  );
};

export default AudioUploadPage;