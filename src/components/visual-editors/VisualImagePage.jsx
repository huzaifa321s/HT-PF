import { Box } from "@mui/material";

const VisualImagePage = ({ src, alt = "Image Page" }) => {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: "100%",
        maxWidth: "800px",
        height: "1131px",
        objectFit: "cover",
        boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
        margin: "0 auto",
        display: "block",
      }}
    />
  );
};

export default VisualImagePage;
