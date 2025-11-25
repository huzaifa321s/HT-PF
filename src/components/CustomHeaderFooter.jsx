import { Box } from "@mui/material";

const CustomHeaderFooter = ({ children, logo = "/download.jpg" }) => {
  return (
    <Box
    className="pdf-page"
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", minHeight: "60px", maxHeight: "60px" }}>
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ position: "absolute", top: 0, left: 0 }}
  >
    

    {/* Original shapes */}
    <polygon points="0,0 100,0 65,100 0,100" fill="#FF8C00" /> {/* Yellow */}
    <polygon points="85,0 100,0 100,100 0,100" fill="#1A1A1A" /> {/* Dark */}

    {/* White fade overlay */}
    <rect width="100%" height="100%" fill="url(#whiteFade)" />
  </svg>

  {/* Logo overlay */}
  <Box
    component="img"
    src={logo}
    alt="Logo"
    sx={{
      position: "absolute",
      right: "24px",
      top: "50%",
      borderRadius: 100,
      transform: "translateY(-50%)",
      height: "50px",
      width: "auto",
    }}
  />
</Box> 





      {/* === MAIN CONTENT === */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          zIndex: 0,
          position: "relative",
        }}
      >
        {children}
      </Box>

   <Box sx={{ position: "relative", height: "80px", width: "100%", mt: "auto" }}>
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 1000 100"
    preserveAspectRatio="none"
    style={{ position: "absolute", bottom: 0, left: 0 }}
  >
    <defs>
      
    </defs>

    {/* Orange curved shape */}
    <path
      d="M 0,100 L 0,0 Q 100,40 400,20 T 700,50 L 700,100 Z"
      fill="#FF8C00"
    />

    {/* White gradient overlay */}
    <rect width="100%" height="100%" fill="url(#footerWhiteFade)" />
  </svg>

  {/* Logo in footer */}
  <Box
    component="img"
    src={logo}
    alt="Logo"
    sx={{
      position: "absolute",
      right: "30px",
      bottom: "15px",
      borderRadius:100,
      height: "45px",
      width: "auto",
      zIndex: 10,
    }}
  />
</Box>

   
    </Box>
  );
};

export default CustomHeaderFooter;
