// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Chip,
  Stack,
  Container,
} from "@mui/material";
import { format } from "date-fns";
import axiosInstance from "../utils/axiosInstance";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: "Loading...",
    email: "loading@inhouse.com",
    updatedAt: null,
  });

  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#667eea",
    secondary: "#764ba2",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
    lightBg: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
  };

  // Fetch profile data role-wise
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user") || "null");
        const role = user?.role || "agent";

        const endpoint = "/api/get-creds";

        const res = await axiosInstance.get(endpoint);

        if (res.data && res.data.success && res.data.data) {
          setProfileData({
            name: res.data.data.name || "User",
            email: res.data.data.email || "user@inhouse.com",
            updatedAt: res.data.data.updatedAt || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfileData({
          name: "User",
          email: "user@inhouse.com",
          updatedAt: new Date().toISOString(),
        });
      }
    };

    fetchProfile();
  }, []);

  const formattedDate = profileData.updatedAt
    ? format(new Date(profileData.updatedAt), "dd MMMM yyyy, h:mm a")
    : "Not available";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: { xs: 4, md: 8 },
        background: colorScheme.lightBg,
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 650,
            mx: "auto",
            p: { xs: 4, sm: 5, md: 6 },
            borderRadius: 4,
            textAlign: "center",
            background: "#fff",
            border: "1px solid #e0e7ff",
            boxShadow: "0 20px 60px rgba(102,126,234,0.1)",
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 30px 80px rgba(102,126,234,0.2)",
              borderColor: colorScheme.primary,
            },
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: colorScheme.gradient,
            },
          }}
        >
          {/* Avatar */}
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              mb: 3,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                background: colorScheme.gradient,
                opacity: 0.5,
                filter: "blur(8px)",
              }}
            />
            <Avatar
              sx={{
                width: 120,
                height: 120,
                position: "relative",
                bgcolor: "#fff",
                color: colorScheme.primary,
                fontSize: 48,
                fontWeight: 800,
                border: "4px solid #fff",
                boxShadow: "0 10px 30px rgba(102,126,234,0.2)",
              }}
            >
              {profileData.name[0]?.toUpperCase() || "U"}
            </Avatar>
          </Box>

          {/* Name */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: colorScheme.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
              mb: 1,
            }}
          >
            {profileData.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Account Details
          </Typography>

          <Divider sx={{ my: 4, borderColor: "#e0e7ff" }} />

          {/* Profile Info Cards */}
          <Stack spacing={3} sx={{ mb: 4 }}>
            {/* Email */}
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                background: "rgba(102,126,234,0.05)",
                border: "1px solid rgba(102,126,234,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(102,126,234,0.1)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: colorScheme.primary,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                  mb: 0.5,
                }}
              >
                Email Address
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#2d3748",
                  wordBreak: "break-all",
                }}
              >
                {profileData.email}
              </Typography>
            </Box>

            {/* Last Updated */}
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                background: "rgba(76,175,80,0.05)",
                border: "1px solid rgba(76,175,80,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(76,175,80,0.1)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#2e7d32",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                  mb: 0.5,
                }}
              >
                Last Updated
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#2d3748",
                }}
              >
                {formattedDate}
              </Typography>
            </Box>
          </Stack>

          {/* Status Chip */}
          <Chip
            label="Active User"
            size="medium"
            sx={{
              fontWeight: 700,
              px: 2,
              py: 2.5,
              borderRadius: 3,
              background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
              color: "#fff",
              boxShadow: "0 8px 20px rgba(76,175,80,0.3)",
              fontSize: "0.9rem",
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;