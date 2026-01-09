// src/components/shared/StatusBanner.jsx
import { Box, Typography } from "@mui/material";

const StatusBanner = ({ status, loadingStatus }) => (
  <Box
    sx={{
      p: 2,
      bgcolor: status === "✅ Done!" ? "success.main" : "warning.main",
      color: "white",
      borderRadius: 2,
      mb: 2,
      textAlign: "center",
    }}
  >
    <Typography>{loadingStatus || status}</Typography>
  </Box>
);

export default StatusBanner;