import {
  CardContent,
  Stack,
  Avatar,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
} from "@mui/material";
import { CheckCircle, CalendarMonth, Send } from "@mui/icons-material";

export default function AdditionalDetailsSection({
  formData,
  handleChange,
  inputRefs,
  handleKeyDown,
  isLoading,
  processing,
  handleSubmit,
}) {
  return (
    <>
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
            <CheckCircle />
          </Avatar>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Additional Details
          </Typography>
        </Stack>

        <Grid
          container
          spacing={3}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Call Outcome</InputLabel>
              <Select
                name="callOutcome"
                value={formData.callOutcome}
                onChange={handleChange}
                inputRef={(el) => (inputRefs.current[30] = el)}
                onKeyDown={(e) => handleKeyDown(e, 30)}
                sx={{ borderRadius: 2, bgcolor: "background.paper" }}
              >
                <MenuItem value="Interested">Interested</MenuItem>
                <MenuItem value="No Fit">No Fit</MenuItem>
                <MenuItem value="Flaked">Flaked</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Chip
              icon={<CalendarMonth />}
              label={`Date: ${formData.date}`}
              sx={{
                height: 56,
                width: "100%",
                fontSize: "1rem",
                bgcolor: "background.default",
                color: "primary.main",
                fontWeight: 600,
                borderRadius: 2,
              }}
            />
          </Grid>

          <TextField
            fullWidth
            label="Terms & Conditions"
            name="terms"
            multiline
            rows={5}
            value={formData.terms}
            onChange={handleChange}
            inputRef={(el) => (inputRefs.current[31] = el)}
            onKeyDown={(e) => handleKeyDown(e, 31)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
          />
        </Grid>
      </CardContent>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          type="submit"
          size="large"
          disabled={isLoading || processing}
          startIcon={isLoading ? null : <Send />}
          ref={(el) => (inputRefs.current[32] = el)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          sx={{
            px: 6,
            py: 2,
            borderRadius: 3,
            fontSize: "1.1rem",
            fontWeight: 700,
            minWidth: { xs: "100%", sm: 300 },
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            "&:hover": {
              boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
              transform: "translateY(-2px)",
            },
          }}
        >
          {isLoading ? "Generating Proposal..." : "Generate Proposal PDF"}
        </Button>
      </Box>
    </>
  );
}