// src/components/pdf/Page5Contact.jsx
import { Box } from "@mui/material";

const Page5Contact = () => (
  <Box
     className="pdf-page"
    component="img"
    src="/proposal-contact.png"
    alt="contact-page"
    sx={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  />
);

export default Page5Contact;