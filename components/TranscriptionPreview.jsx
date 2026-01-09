import React from "react";
import {
  Paper,
  Typography,
  Box,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";

export default function TranscriptDisplay({ transcriptText }) {
  // 🧩 Handle Empty Transcript Case
  if (!transcriptText || transcriptText.trim() === "") {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 4,
          textAlign: "center",
          color: "text.secondary",
          bgcolor: "#fafafa",
          border: "1px dashed #ccc",
          maxWidth: 600,
          mx: "auto",
        }}
      >
        <RecordVoiceOverIcon
          sx={{ fontSize: 50, mb: 1, color: "primary.light" }}
        />
        <Typography variant="h6" fontWeight={600}>
          Transcript Not Available
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          No transcript has been generated yet. Once available, it will appear
          here automatically.
        </Typography>
      </Paper>
    );
  }

  // 🧾 Split transcript into lines
  const lines =
    transcriptText
      ?.trim()
      ?.split(/\n+/)
      .filter((line) => line.trim() !== "") || [];

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 4,
        bgcolor: "#fdfdfd",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        maxWidth: 800,
        mx: "auto",
        mt: 4,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <RecordVoiceOverIcon sx={{ fontSize: 36, color: "primary.main" }} />
        <Typography variant="h5" fontWeight={700}>
          Full Transcript
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          lineHeight: 1.8,
          fontSize: "1rem",
          color: "text.primary",
          whiteSpace: "pre-line",
          backgroundColor: "#fafafa",
          p: 3,
          borderRadius: 3,
          border: "1px solid #e0e0e0",
        }}
      >
        {lines.map((line, index) => (
          <Box
            key={index}
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: line.toLowerCase().includes("final")
                ? "rgba(76,175,80,0.08)"
                : "rgba(25,118,210,0.05)",
              borderLeft: `4px solid ${
                line.toLowerCase().includes("final") ? "#4caf50" : "#1976d2"
              }`,
              transition: "0.3s",
              "&:hover": {
                bgcolor: line.toLowerCase().includes("final")
                  ? "rgba(76,175,80,0.15)"
                  : "rgba(25,118,210,0.1)",
              },
            }}
          >
            <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
              {line}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Chip
          label="End of Transcript"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>
    </Paper>
  );
}
