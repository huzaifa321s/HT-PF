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
  IconButton,
  LinearProgress,
} from "@mui/material";
import { DeblurOutlined, Add } from "@mui/icons-material";

export default function ProjectDetailsSection({
  formData,
  handleChange,
  processing,
  platformOptions,
  customPlatform,
  setCustomPlatform,
  handleAddCustom,
  inputRefs,
  handleKeyDown,
  setFormData,
}) {
  const handleSelectChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      developmentPlatforms: event.target.value,
    }));
  };

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
          <DeblurOutlined />
        </Avatar>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Project Details
        </Typography>
      </Stack>

      <Grid container spacing={3} sx={{ display: "flex", flexDirection: "column" }}>
        <TextField
          fullWidth
          label="Brand Name"
          name="brandName"
          value={formData.brandName}
          onChange={handleChange}
          inputRef={(el) => (inputRefs.current[4] = el)}
          onKeyDown={(e) => handleKeyDown(e, 4)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />

        <TextField
          fullWidth
          label="Project Title"
          name="projectTitle"
          value={formData.projectTitle}
          onChange={handleChange}
          inputRef={(el) => (inputRefs.current[5] = el)}
          onKeyDown={(e) => handleKeyDown(e, 5)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />

        <TextField
          fullWidth
          label="Business Description"
          name="businessDescription"
          multiline
          rows={5}
          value={formData.businessDescription}
          onChange={handleChange}
          disabled={processing}
          inputRef={(el) => (inputRefs.current[6] = el)}
          onKeyDown={(e) => handleKeyDown(e, 6)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />
        {processing && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}

        <TextField
          fullWidth
          label="Proposed Solution"
          name="proposedSolution"
          multiline
          rows={5}
          value={formData.proposedSolution}
          onChange={handleChange}
          disabled={processing}
          inputRef={(el) => (inputRefs.current[7] = el)}
          onKeyDown={(e) => handleKeyDown(e, 7)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />
        {processing && <LinearProgress color="success" sx={{ mt: 1, borderRadius: 1 }} />}

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Development Platforms</InputLabel>
            <Select
              multiple
              value={formData.developmentPlatforms}
              onChange={handleSelectChange}
              inputRef={(el) => (inputRefs.current[8] = el)}
              onKeyDown={(e) => handleKeyDown(e, 8)}
              sx={{ borderRadius: 2, bgcolor: "background.paper" }}
            >
              {platformOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={1} mt={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add custom platform"
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                inputRef={(el) => (inputRefs.current[9] = el)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} container justifyContent="flex-end">
              <IconButton
                onClick={handleAddCustom}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <Add />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CardContent>
  );
}