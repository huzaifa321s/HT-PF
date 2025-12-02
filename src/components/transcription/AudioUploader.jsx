import { Box, Button, Typography, LinearProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

export default function AudioUploader() {
  const fileInputRef = useRef(null);
  const { processing, progress, status } = useSelector((state) => state.transcription);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    await fetch(`/api/transcribe`, {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <Button
        variant="outlined"
        size="large"
        startIcon={<CloudUpload />}
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
      >
        Upload Audio File
      </Button>
      {processing && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">{status}</Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
        </Box>
      )}
    </Box>
  );
}