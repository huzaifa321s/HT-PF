"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

/**
 * Wraps a page to require authentication.
 * allowedRoles: optional array of roles, e.g. ['admin', 'agent']
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState({ token: null, user: null });
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    setAuth({ token, user });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!auth.token || !auth.user) {
    router.replace("/login");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    router.replace("/not-found");
    return null;
  }

  return children;
}
