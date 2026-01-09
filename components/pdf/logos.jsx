{/* === HEADER === */ }
{/* <Box sx={{ position: "relative", minHeight: "60px", maxHeight: "60px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <polygon points="0,0 100,0 65,100 0,100" fill="#667eea" />

          <polygon points="85,0 100,0 100,100 0,100" fill="#1A1A1A" />
        </svg>
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            position: "absolute",
            right: "24px",
            top: "50%",
            transform: "translateY(-50%)",
            height: "50px",
            width: "auto",
          }}
        />
      </Box> */}
{/* === HEADER === */ }
<Box sx={{ position: "relative", height: "80px", width: "100%" }}>
  {/* Orange curved shape */}
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1000 100"
    preserveAspectRatio="none"
    style={{ position: "absolute", top: 0, left: 0 }}
  >
    <path
      d="M 0,0 L 0,100 Q 200,60 400,80 T 700,50 L 700,0 Z"
      fill="#667eea"
    />
  </svg>

  {/* Logo at top-right */}
  <Box
    component="img"
    src={logo}
    alt="Logo"
    sx={{
      position: "absolute",
      right: "20px",   // distance from right edge
      top: "10px",     // distance from top edge
      height: "50px",
      width: "auto",
      zIndex: 10,
    }}
  />
</Box>