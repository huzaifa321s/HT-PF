// src/components/shared/LoadingOverlay.jsx
import { Box, CircularProgress } from "@mui/material";

const LoadingOverlay = ({ isLoading }) => (
  isLoading && (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bgcolor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <CircularProgress />
    </Box>
  )
);

export default LoadingOverlay;