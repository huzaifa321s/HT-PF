import {
  CardContent,
  Stack,
  Avatar,
  Typography,
  Grid,
  TextField,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Timeline, AttachMoney, CurrencyRupee } from "@mui/icons-material";

export default function TimelineCostsSection({
  formData,
  handleChange,
  currency,
  handleCurrencyChange,
  setFormData,
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
          <Timeline />
        </Avatar>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Timeline and Costs
        </Typography>
      </Stack>

      <Grid container spacing={3} sx={{ display: "flex", flexDirection: "column" }}>
        <TextField
          fullWidth
          label="Project Duration"
          name="projectDuration"
          value={formData.projectDuration}
          onChange={handleChange}
          inputRef={(el) => (inputRefs.current[10] = el)}
          onKeyDown={(e) => handleKeyDown(e, 10)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />

        <TextField
          fullWidth
          label="Advance Payment (%)"
          name="advancePercent"
          value={formData.advancePercent}
          onChange={handleChange}
          type="number"
          inputRef={(el) => (inputRefs.current[11] = el)}
          onKeyDown={(e) => handleKeyDown(e, 11)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />

        <TextField
          fullWidth
          label="Cost"
          name="additionalCosts"
          value={formData.additionalCosts}
          onChange={handleChange}
          inputRef={(el) => (inputRefs.current[12] = el)}
          onKeyDown={(e) => handleKeyDown(e, 12)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />

        <TextField
          fullWidth
          label="Timeline / Milestones"
          name="timelineMilestones"
          multiline
          rows={5}
          value={formData.timelineMilestones}
          onChange={handleChange}
          inputRef={(el) => (inputRefs.current[13] = el)}
          onKeyDown={(e) => handleKeyDown(e, 13)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
            },
          }}
        />

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Charge Amount ({currency === "USD" ? "$" : "₨"})
            </Typography>
            <ToggleButtonGroup
              value={currency}
              exclusive
              onChange={handleCurrencyChange}
              size="small"
            >
              <ToggleButton value="USD">
                <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} /> USD
              </ToggleButton>
              <ToggleButton value="PKR">
                <CurrencyRupee sx={{ fontSize: 16, mr: 0.5 }} /> PKR
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Stack spacing={2}>
            {formData.recommended_services?.length > 0 ? (
              <>
                {formData.recommended_services.map((service, index) => (
                  <Grid container spacing={2} key={index} alignItems="center">
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        label={service}
                        value={formData.serviceCharges?.[index] || ""}
                        onChange={(e) => {
                          const newCharges = [...(formData.serviceCharges || [])];
                          newCharges[index] = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            serviceCharges: newCharges,
                          }));
                        }}
                        type="number"
                        inputRef={(el) => (inputRefs.current[14 + index] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 14 + index)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "background.paper",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Sub-Total"
                        value={`${currency === "USD" ? "$" : "₨"}${(
                          parseFloat(formData.serviceCharges?.[index] || "0") || 0
                        ).toFixed(2)}`}
                        disabled
                        sx={{
                          "& .Mui-disabled": {
                            bgcolor: "background.default",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                ))}

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    boxShadow: 3,
                  }}
                >
                  <Typography variant="subtitle1">Grand Total</Typography>
                  <Typography variant="h6">
                    {currency === "USD" ? "$" : "₨"}
                    {(
                      (formData.serviceCharges || []).reduce(
                        (sum, val) => sum + (parseFloat(val) || 0),
                        0
                      ) || 0
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </>
            ) : (
              <TextField
                fullWidth
                label={`Total Charge Amount (${currency === "USD" ? "$" : "₨"})`}
                name="chargeAmount"
                value={formData.chargeAmount}
                onChange={handleChange}
                type="number"
                inputRef={(el) => (inputRefs.current[20] = el)}
                onKeyDown={(e) => handleKeyDown(e, 20)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  },
                }}
              />
            )}
          </Stack>
        </Grid>

        {/* Services Summary */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
            <Box
              sx={{
                minWidth: 80,
                textAlign: "center",
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography variant="h5" fontWeight={800}>
                {formData.recommended_services?.length || 0}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                Services
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              {formData.recommended_services?.length > 0 ? (
                <Stack spacing={1.5}>
                  {formData.recommended_services.map((service, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#000",
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                        }}
                      />
                      <Typography>{service}</Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" fontStyle="italic">
                  No services recommended yet.
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  );
}