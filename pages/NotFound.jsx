import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { 
  ErrorOutline as ErrorIcon, 
  Home as HomeIcon, 
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';

const NotFound = () => {
  const colorScheme = {
    primary: "#FF8C00",
    secondary: "#000000",
    gradient: "linear-gradient(135deg, #FF8C00 0%, #000000 100%)",
    hoverGradient: "linear-gradient(135deg, #E67E00 0%, #333333 100%)",
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f7fa",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
      }}
    >
      <Box
        sx={{
          maxWidth: 600,
          width: "100%",
          mx: "auto",
          px: { xs: 3, sm: 4, md: 6 },
          textAlign: "center",
        }}
      >
        {/* Main Error Container */}
        <Box
          sx={{
            p: { xs: 4, sm: 6, md: 8 },
            background: "linear-gradient(135deg, #FFF3E0 0%, #F5F5F5 100%)",
            border: "2px solid #e0e7ff",
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(255, 140, 0, 0.15)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative gradient border */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: colorScheme.gradient,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            {/* Error Icon */}
            <Box
              sx={{
                mx: "auto",
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                mb: 4,
                p: 3,
                background: colorScheme.gradient,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 16px 40px rgba(102, 126, 234, 0.3)",
              }}
            >
              <ErrorIcon sx={{ fontSize: { xs: 50, sm: 60 }, color: "#fff" }} />
            </Box>

            {/* Main Title */}
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "3.5rem", sm: "4.5rem" },
                fontWeight: 800,
                color: "#1a202c",
                mb: 2,
                lineHeight: 1.1,
              }}
            >
              404
            </Typography>

            {/* Error Message */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#4a5568",
                mb: 3,
                fontSize: { xs: "1.2rem", sm: "1.4rem" },
              }}
            >
              Page Not Found
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#718096",
                lineHeight: 1.7,
                mb: 6,
                fontSize: "1.1rem",
              }}
            >
              The page you are looking for does not exist or has been moved.
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                sx={{
                  px: 5,
                  py: 1.75,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
                  background: colorScheme.gradient,
                  minWidth: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    background: colorScheme.hoverGradient,
                    boxShadow: "0 15px 40px rgba(102, 126, 234, 0.4)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => window.location.href = "/"}
              >
                Go to Home
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                sx={{
                  px: 5,
                  py: 1.75,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  minWidth: { xs: "100%", sm: "auto" },
                  borderColor: colorScheme.primary,
                  color: colorScheme.primary,
                  "&:hover": {
                    borderColor: colorScheme.primary,
                    backgroundColor: colorScheme.primary,
                    color: "#fff",
                    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.2)",
                  },
                }}
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NotFound;