import {
  CardContent,
  Stack,
  Avatar,
  Typography,
  Grid,
  TextField,
} from "@mui/material";
import { Info } from "@mui/icons-material";

export default function ClientInfoSection({
  formData,
  handleChange,
  inputRefs,
  handleKeyDown,
}) {
  return (
    <CardContent
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mb: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Avatar
          sx={{
            bgcolor: "transparent",
            color: "primary.main",
            width: 48,
            height: 48,
          }}
        >
          <Info />
        </Avatar>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Client Information
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Client Name"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            required
            inputRef={(el) => (inputRefs.current[2] = el)}
            onKeyDown={(e) => handleKeyDown(e, 2)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Client Email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            type="email"
            inputRef={(el) => (inputRefs.current[3] = el)}
            onKeyDown={(e) => handleKeyDown(e, 3)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
          />
        </Grid>
      </Grid>
    </CardContent>
  );
}