import { useState, useEffect } from "react";
import {
  CardContent,
  Stack,
  Avatar,
  Typography,
  Grid,
  Skeleton,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import axios from "axios";

export default function YourInfoSection({
  formData,
  setFormData,
  handleChange,
  inputRefs,
  handleKeyDown,
}) {
  const [options, setOptions] = useState([]);
  const [fetchingBD, setFetchingBDM] = useState(true);

  useEffect(() => {
    async function fetchBDM() {
      try {
        setFetchingBDM(true);
        const res = await axiosInstance.get(`${import.meta.env.VITE_APP_BASE_URL}api/bdms/get`);
        setOptions(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingBDM(false);
      }
    }
    fetchBDM();
  }, []);

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
          Your Information
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {fetchingBD ? (
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          ) : (
            <Autocomplete
              options={options}
              getOptionLabel={(option) => option.name}
              value={formData.selectedBDM}
              onChange={(e, newValue) => {
                setFormData({
                  ...formData,
                  selectedBDM: newValue,
                  email: newValue ? newValue.email : "",
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select BDM Name"
                  inputRef={(el) => (inputRefs.current[0] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    },
                  }}
                />
              )}
            />
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            inputRef={(el) => (inputRefs.current[1] = el)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
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