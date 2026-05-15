// src/app/page.js — Root "/" redirects based on role
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (!user) {
      router.replace("/login");
    } else if (user.role === "admin") {
      router.replace("/dashboard");
    } else if (user.role === "agent") {
      router.replace("/agent-dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
