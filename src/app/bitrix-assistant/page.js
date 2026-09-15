"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

const BitrixChatAssistant = dynamic(
  () => import("@/components/BitrixChatAssistant"),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0a0a0a",
        }}
      >
        <CircularProgress sx={{ color: "#f3a833" }} />
      </Box>
    ),
  }
);

export default function BitrixAssistantPage() {
  return <BitrixChatAssistant />;
}
