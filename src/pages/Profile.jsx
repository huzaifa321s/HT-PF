import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import { format } from "date-fns";
import axiosInstance from "../utils/axiosInstance";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: "Loading...",
    email: "loading@inhouse.com",
    updatedAt: null,
  });

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
        py: 8,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
          width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 650,
          p: { xs: 4, sm: 5, md: 6 },
          borderRadius: 5,
          textAlign: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          boxShadow: "0 20px 60px rgba(102,126,234,0.15)",
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
          "&:hover": {
            transform: "translateY(-12px)",
            boxShadow: "0 30px 80px rgba(102,126,234,0.25)",
          },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            backgroundSize: "200% 100%",
          
          },
          
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            width: 120,
            height: 120,
            mx: "auto",
            mb: 3,
            bgcolor: "primary.main",
            fontSize: 48,
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(102,126,234,0.3)",
            border: "5px solid #fff",
          }}
        >
          {profileData.name[0]?.toUpperCase() || "U"}
        </Avatar>

        {/* Name */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
            mb: 1,
          }}
        >
          {profileData.name}
        </Typography>

        <Divider sx={{ my: 3, borderColor: "rgba(102,126,234,0.2)" }} />

        {/* Profile Info Cards */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          {/* Email */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              background: "rgba(102,126,234,0.08)",
              border: "1px solid rgba(102,126,234,0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(102,126,234,0.15)",
                transform: "translateY(-4px)",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Email Address
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#333",
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
              background: "rgba(76,175,80,0.08)",
              border: "1px solid rgba(76,175,80,0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(76,175,80,0.15)",
                transform: "translateY(-4px)",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Last Updated
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#2e7d32",
              }}
            >
              {formattedDate}
            </Typography>
          </Box>
        </Stack>

        {/* Status Chip */}
        <Chip
          label="Active User"
          color="success"
          size="small"
          sx={{
            fontWeight: 700,
            px: 2,
            py: 1.5,
            borderRadius: 3,
            background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
            color: "#fff",
            boxShadow: "0 4px 15px rgba(76,175,80,0.3)",
          }}
        />
      </Paper>
    </Box>
  );
};

export default Profile;