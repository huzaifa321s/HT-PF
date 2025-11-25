import { Box, Paper, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

export default function TranscriptDisplay() {
  const { history } = useSelector((state) => state.transcription);

  return (
    <Paper sx={{ p: 3, maxHeight: '400px', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Transcript
      </Typography>
      {history.map((item) => (
        <Box
          key={item.id}
          sx={{
            mb: 2,
            p: 2,
            bgcolor: item.type === 'final' ? 'success.light' : 'grey.100',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {item.text}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}