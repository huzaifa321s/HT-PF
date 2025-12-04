import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardContent,
  Chip,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Switch,
  Card,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import {
  Info,
  DeblurOutlined,
  Timeline,
  CheckCircle,
  Send,
  CalendarMonth,
  ExpandMore,
  Add,
  ArrowBack,
  ArrowForward,
  Person,
  Business,
  Code,
  AttachMoney,
  Description,
  Preview,
  Download,
  Delete,
  Money,
  Payment,
} from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { pdf } from "@react-pdf/renderer";
import ProposalDocument from "./components/pdf/ProposalDocument";
import dayjs from "dayjs";
import UnifiedPdfEditor from "./UnifiedPDFEditor";
import { useDispatch, useSelector } from "react-redux";
import {
  addCustomPlatform,
  addService,
  removeService,
  updateCharges,
  updateField,
  updateServices,
} from "./utils/proposalSlice";
import axiosInstance from "./utils/axiosInstance";
import { addSection, updateSection } from "./utils/page2Slice";
import { setBrandName } from "./utils/page1Slice";
import { updateTitle } from "./utils/page3Slice";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { store } from "./utils/store";
const ProposalFormWithStepper = ({
  control,
  errors,
  watch,
  handleSubmit,
  register,
  handleSubmitForm,
  isLoading,
  trigger,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [creds, setCreds] = useState({ yourName: "", yourEmail: "" });
  const dispatch = useDispatch();

  // ✅ Refs for all required fields
  const fieldRefs = {
    clientName: useRef(null),
    clientEmail: useRef(null),
    brandName: useRef(null),
    projectTitle: useRef(null),
    businessDescription: useRef(null),
    proposedSolution: useRef(null),
    callOutcome: useRef(null),
  };
  // ✅ Step-wise required fields
  const stepFields = {
    0: ["clientName", "clientEmail"],
    1: ["brandName", "projectTitle", "businessDescription", "proposedSolution"],
    2: [],
    3: ["callOutcome"],
    4: [],
  };

  // ✅ Scroll to first error field
  const onInvalid = (errors) => {
    console.log("Validation errors:", errors);
    const firstField = Object.keys(errors)[0];

    if (fieldRefs[firstField]?.current) {
      fieldRefs[firstField].current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Focus after scroll
      setTimeout(() => {
        fieldRefs[firstField].current.focus();
      }, 300);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/get-creds");

        if (res.data?.success && res.data.data) {
          const { name, email } = res.data.data;
          setCreds({ yourName: name, yourEmail: email });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Color scheme matching Generate PDF button
  const colorScheme = {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#f44336",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
  };

  const cardStyle = {
    mb: 3,
    p: { xs: 0, sm: 3, md: 4 },
    background: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
    border: "2px solid #e0e7ff",
    borderRadius: 3,
    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
  };

  const inputStyle = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: "#fff",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: colorScheme.primary,
        },
      },
    },
  };

  const sectionHeader = (icon, title) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 2 }}>
      <Box
        sx={{
          p: 1.5,
          mr: 2,
          background: colorScheme.gradient,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 12, color: "#fff" },
        })}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background: colorScheme.gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  const pdfPage3Data = store.getState((s) => s.page);
  const orderedSections = pdfPage3Data?.page2.create.orderedSections;
  const businessSectionExists = orderedSections.some(
    (item) => item.id === "business"
  );
  const proposedSectionExists = orderedSections.some(
    (item) => item.id === "proposed"
  );
  const AddSectionToPDf = (data) => {
    handleNext();
    orderedSections.some((item) => item.id === "business");

    if (businessSectionExists) {
      console.log("updated");
      dispatch(
        updateSection({
          id: "business",
          type: "title",
          title: "Business Description",
          content: data.businessDescription.trim(),
        })
      );
    } else {
      dispatch(
        addSection({
          type: "title",
          title: "Business Description",
          content: data.businessDescription.trim(),
          id: "business",
        })
      );
    }
    if (proposedSectionExists) {
      dispatch(
        updateSection({
          id: "proposed",
          type: "title",
          title: "Proposed Solution",
          content: data.proposedSolution.trim(),
        })
      );
    } else {
      dispatch(
        addSection({
          type: "title",
          title: "Proposed Solution",
          content: data.proposedSolution.trim(),
          id: "proposed",
        })
      );
    }
  };

  const handleSubmitData = async (data) => {
    console.log("Form data submitted:", data);
    console.log("selected", selectedCurrency);
    dispatch(updateField({ field: "clientName", value: data.clientName }));
    dispatch(updateField({ field: "clientEmail", value: data.clientEmail }));
    dispatch(updateField({ field: "brandName", value: data.brandName }));
    dispatch(
      updateField({
        field: "businessDescription",
        value: data.businessDescription,
      })
    );

    dispatch(
      updateField({ field: "proposedSolution", value: data.proposedSolution })
    );

    await handleSubmitForm(data, selectedCurrency);
  };

  // ✅ Check if a step is accessible
  const isStepAccessible = (stepIndex) => {
    // Current step ya pehle ke steps accessible hain
    for (let i = 0; i < stepIndex; i++) {
      const fields = stepFields[i];
      // Agar koi bhi field empty hai previous step mein
      const hasError = fields.some((field) => {
        const value = watch(field); // react-hook-form se value lao
        return !value || value.trim() === "";
      });
      if (hasError) return false;
    }
    return true;
  };

  const handleStepClick = (stepIndex) => {
    // ✅ Sirf accessible steps par hi click ho
    if (isStepAccessible(stepIndex)) {
      setActiveStep(stepIndex);
    }
  };

  const handleFieldChange = (fieldName, field, e) => {
    field.onChange(e); // Update value
    if (errors[fieldName] && e.target.value.trim()) {
    }
  };
  const isSmall = useMediaQuery("(max-width:1325px)");
  // Add this state at the top of your component
  const formatNumberDisplay = (value) => {
    if (!value) return "";
    const number = value.toString().replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  // Updated formatNumberInWords function jo teeno currencies ko handle kare
  const formatNumberInWords = (value, currency) => {
    if (!value) return "";

    const number = parseInt(value.toString().replace(/[^0-9]/g, ""), 10);
    if (isNaN(number) || number === 0) return "";

    // Common formatting for USD, GBP, EUR, AED
    if (["USD", "GBP", "EUR", "AED"].includes(currency)) {
      if (number >= 1000000000) {
        return `${(number / 1000000000).toFixed(2)}B`;
      } else if (number >= 1000000) {
        return `${(number / 1000000).toFixed(2)}M`;
      } else if (number >= 1000) {
        return `${(number / 1000).toFixed(2)}K`;
      }
      return number.toLocaleString();
    }

    // PKR - Lakh & Crore
    if (currency === "PKR") {
      if (number >= 10000000) {
        return `${(number / 10000000).toFixed(2)} Crore`;
      } else if (number >= 100000) {
        return `${(number / 100000).toFixed(2)} Lakh`;
      } else if (number >= 1000) {
        return `${(number / 1000).toFixed(2)}K`;
      }
      return number.toLocaleString();
    }

    return number.toLocaleString();
  };

  // Add this state at the top of your component
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Add this handler function
  const handleCurrencyChange = (event, newCurrency) => {
    if (newCurrency !== null) {
      setSelectedCurrency(newCurrency);
    }
  };
  const steps = [
    {
      label: "Your & Client Information",
      icon: <Person />,
      content: (
        <>
          {/* YOUR INFORMATION */}
          {sectionHeader(<Person />, "Your Information")}
          <Controller
            name="yourName"
            control={control}
            rules={{ required: "Your name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Your Name *"
                fullWidth
                value={creds.yourName}
                error={!!errors.yourName}
                helperText={errors.yourName?.message}
                disabled
                sx={inputStyle}
              />
            )}
          />
          <Controller
            name="yourEmail"
            control={control}
            rules={{
              required: "Your email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Your Email *"
                fullWidth
                value={creds.yourEmail}
                error={!!errors.yourEmail}
                helperText={errors.yourEmail?.message}
                disabled
                sx={inputStyle}
              />
            )}
          />

          {/* CLIENT INFORMATION */}
          {sectionHeader(<Business />, "Client Information")}
          <Controller
            name="clientName"
            control={control}
            rules={{ required: "Client name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Client Name *"
                fullWidth
                error={!!errors.clientName}
                helperText={errors.clientName?.message}
                inputRef={fieldRefs.clientName}
                sx={inputStyle}
                onChange={(e) => handleFieldChange("clientName", field, e)}
              />
            )}
          />
          <Controller
            name="clientEmail"
            control={control}
            rules={{
              required: "Client email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address",
              },
              validate: {
                // ✅ Check for valid email domains
                validDomain: (value) => {
                  const domain = value.split("@")[1];
                  if (!domain || domain.length < 3) {
                    return "Email must have a valid domain";
                  }

                  // ✅ Check if domain has proper extension (.com, .net, etc)
                  const hasDot = domain.includes(".");
                  if (!hasDot) {
                    return "Email must include a valid domain (e.g., gmail.com)";
                  }

                  // ✅ Check for common invalid patterns
                  if (
                    domain === "abc" ||
                    domain === "example.com" ||
                    domain === "test.com"
                  ) {
                    return "Please enter a real email address";
                  }

                  return true;
                },

                trustedDomain: (value) => {
                  const trustedDomains = [
                    "gmail.com",
                    "yahoo.com",
                    "outlook.com",
                    "hotmail.com",
                  ];
                  const domain = value.split("@")[1]?.toLowerCase();

                  return true;
                },
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Client Email *"
                fullWidth
                type="email"
                error={!!errors.clientEmail}
                helperText={errors.clientEmail?.message}
                inputRef={fieldRefs.clientEmail}
                sx={inputStyle}
                onChange={(e) => handleFieldChange("clientEmail", field, e)}
              />
            )}
          />
        </>
      ),
    },
    {
      label: "Project Details",
      icon: <Description />,
      content: (
        <>
          {sectionHeader(<Description />, "Project Details")}
          <Controller
            name="brandName"
            control={control}
            rules={{ required: "Brand Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Brand Name *"
                fullWidth
                error={!!errors.brandName}
                helperText={errors.brandName?.message}
                inputRef={fieldRefs.projectTitle}
                onChange={(e) => {
                  console.log("e", e.target.value);
                  field.onChange(e);

                  dispatch(setBrandName(e.target.value));
                  dispatch(updateTitle(`Proposal For ${e.target.value}`));
                }}
                sx={inputStyle}
              />
            )}
          />
          <Controller
            name="projectTitle"
            control={control}
            rules={{ required: "Project title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Project Title *"
                fullWidth
                error={!!errors.projectTitle}
                helperText={errors.projectTitle?.message}
                inputRef={fieldRefs.projectTitle}
                sx={inputStyle}
                onChange={(e) => handleFieldChange("projectTitle", field, e)}
              />
            )}
          />
          <Controller
            name="businessDescription"
            control={control}
            rules={{ required: "Business Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Business Description *"
                multiline
                rows={3}
                fullWidth
                inputRef={fieldRefs.businessDescription}
                error={!!errors.businessDescription}
                helperText={errors.businessDescription?.message}
                sx={inputStyle}
                onChange={(e) =>
                  handleFieldChange("businessDescription", field, e)
                }
              />
            )}
          />

          <Controller
            name="proposedSolution"
            control={control}
            rules={{ required: "Proposed Solution is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Proposed Solution *"
                multiline
                rows={3}
                error={!!errors.proposedSolution}
                helperText={errors.proposedSolution?.message}
                inputRef={fieldRefs.proposedSolution}
                fullWidth
                sx={inputStyle}
                onChange={(e) =>
                  handleFieldChange("proposedSolution", field, e)
                }
              />
            )}
          />
        </>
      ),
    },
    {
      label: "Costs",
      icon: <Payment />,
      content: (
        <>
          {sectionHeader(<Payment />, "Costs")}

          {/* Currency Toggle - 5 Currencies */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "start" }}>
            <ToggleButtonGroup
              value={selectedCurrency}
              exclusive
              onChange={handleCurrencyChange}
              aria-label="currency selection"
              sx={{
                gap: 1,
                flexWrap: "wrap",
                "& .MuiToggleButton-root": {
                  px: { xs: 1, sm: 2 },
                  py: { xs: 0.3, sm: 0.5 },
                  fontSize: { xs: "0.65rem", sm: "0.85rem" },
                  fontWeight: 700,
                  border: "2px solid",
                  borderColor: colorScheme.primary,
                  borderRadius: 3,
                  minWidth: { xs: 60, sm: 90 },
                  "&.Mui-selected": {
                    background: colorScheme.gradient,
                    color: "#fff",
                    "&:hover": {
                      background: colorScheme.hoverGradient,
                    },
                  },
                  "&:hover": {
                    background: `${colorScheme.primary}15`,
                  },
                },
              }}
            >
              <ToggleButton value="USD">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>$</Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>USD</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="PKR">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>₨</Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>PKR</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value="GBP">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>£</Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>GBP</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="EUR">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "1rem", sm: "1.4rem" } }}>€</Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>EUR</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="AED">
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.8 } }}>
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1.3rem" }, fontWeight: 800 }}>
                    د.إ
                  </Typography>
                  <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" } }}>AED</Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {/* Advance Percentage */}
          <Controller
            name="advancePercent"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                label="Advance Percentage"
                type="text"
                fullWidth
                value={value || ""}
                onChange={(e) => {
                  // Only allow numbers
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  // Limit to 100
                  const limitedValue = numericValue
                    ? Math.min(parseInt(numericValue), 100).toString()
                    : "";
                  onChange(limitedValue);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography
                        sx={{ fontWeight: 600, color: colorScheme.primary }}
                      >
                        %
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: value && (
                    <InputAdornment position="end">
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        / 100
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter percentage (e.g., 50)"
                sx={{
                  ...inputStyle,
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 100px #fff inset !important",
                    WebkitTextFillColor: "#000 !important",
                    caretColor: "#000",
                  },
                  "& .MuiInputBase-root": {
                    backgroundColor: "#fff !important",
                  },
                }}
              />
            )}
          />

          {/* Additional Costs with Currency Symbol and Formatting */}
          <Controller
            name="additionalCosts"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                label={`Additional Costs (${selectedCurrency})`}
                type="text"
                fullWidth
                value={value ? parseInt(value).toLocaleString() : ""}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  onChange(numericValue);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.4rem",
                          color: colorScheme.primary,
                        }}
                      >
                        {selectedCurrency === "USD" && "$"}
                        {selectedCurrency === "GBP" && "£"}
                        {selectedCurrency === "EUR" && "€"}
                        {selectedCurrency === "AED" && "د.إ"}
                        {selectedCurrency === "PKR" && "₨"}
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: value && (
                    <InputAdornment position="end">
                      <Typography
                        variant="caption"
                        sx={{
                          color: colorScheme.primary,
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatNumberInWords(value, selectedCurrency)}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                placeholder={`Enter amount in ${selectedCurrency}`}
                sx={inputStyle}
              />
            )}
          />
        </>
      ),
    },
    {
      label: "Additional Details",
      icon: <Info />,
      content: (
        <>
          {sectionHeader(<Info />, "Additional Details")}
          <Controller
            name="callOutcome"
            control={control}
            rules={{ required: "Call outcome is required" }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error} sx={inputStyle}>
                <InputLabel>Call Outcome *</InputLabel>
                <Select {...field} label="Call Outcome *">
                  <MenuItem value="Interested">Interested</MenuItem>
                  <MenuItem value="No Fit">No Fit</MenuItem>
                  <MenuItem value="Flaked">Flaked</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                </Select>
                {error && (
                  <FormHelperText error>{error.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="date"
              control={control}
              defaultValue={dayjs().format("YYYY-MM-DD")} // ✅ String format for form
              render={({ field: { onChange, value, ...field } }) => (
                <DatePicker
                  {...field}
                  label="Date"
                  value={value ? dayjs(value) : dayjs()} // ✅ Convert string back to dayjs for display
                  onChange={(newValue) => {
                    // ✅ Convert dayjs to string before saving to form
                    const formattedDate = newValue
                      ? newValue.format("YYYY-MM-DD")
                      : "";
                    onChange(formattedDate);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputLabelProps: {
                        shrink: true,
                      },
                      sx: {
                        height: 56,
                        width: "100%",
                        fontSize: "1rem",
                        fontWeight: 600,
                        background: "#ffffff",
                        borderRadius: 2,
                        mb: 2,
                        "& .MuiInputBase-root": {
                          height: 56,
                        },
                      },
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </>
      ),
    },

    {
      label: "Review & Generate PDF",
      icon: <Send />,
      content: (
        <>
          {/* PDF ACTIONS */}
          <Box
            sx={{
              textAlign: "center",
              mt: 4,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <UnifiedPdfEditor pdfPages={{}} mode="doc" />
            <Grid item xs={12} md={6}>
              <Button
                onClick={() => handleSubmit(handleSubmitData, onInvalid)()}
                variant="contained"
                size="large"
                startIcon={isLoading ? <Timeline /> : <Send />}
                disabled={isLoading}
                sx={{
                  px: { xs: 3, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: 4,
                  fontSize: { xs: "0.85rem", sm: "1.1rem" },
                  fontWeight: 700,
                  boxShadow: 6,
                  background: colorScheme.gradient,
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: "100%", sm: "none" },
                  "&:hover": {
                    background: colorScheme.hoverGradient,
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                  },
                }}
              >
                {isLoading
                  ? "Generating Proposal..."
                  : "Generate Proposal & Download PDF"}
              </Button>
            </Grid>
          </Box>
        </>
      ),
    },
  ];
  const handleNext = async () => {
    const currentStepFields = stepFields[activeStep];

    if (currentStepFields.length > 0) {
      const isValid = await trigger(currentStepFields);

      if (!isValid) {
        const firstError = currentStepFields.find((field) => errors[field]);

        if (firstError && fieldRefs[firstError]?.current) {
          fieldRefs[firstError].current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          setTimeout(() => {
            fieldRefs[firstError].current.focus();
          }, 300);
        }

        return;
      }
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <Box
        sx={{
          maxWidth: 1800,
          margin: "0 auto",
          p: { xs: 0, sm: 2, md: 3 },
        }}
      >
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{
            mb: { xs: 0, sm: 4 },
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            p: { xs: 0, sm: 2 },
          }}
        >
          {steps.map((step, index) => (
            <Step
              key={step.label}
              sx={{
                mb: { xs: 0, sm: 3 },
                width: "100%",
                minWidth: { xs: "100%", sm: "300px" },
                p: { xs: 0, sm: 2 },
              }}
            >
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor: isStepAccessible(index) ? "pointer" : "not-allowed",
                  opacity: isStepAccessible(index) ? 1 : 0.5,
                  "& .MuiStepLabel-label": {
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color:
                      activeStep === index
                        ? colorScheme.primary
                        : "text.secondary",
                  },
                  "&:hover": {
                    "& .MuiStepLabel-label": {
                      color: isStepAccessible(index)
                        ? colorScheme.primary
                        : "text.secondary",
                    },
                  },
                }}
                icon={
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        activeStep >= index ? colorScheme.gradient : "#e0e0e0",
                      color: activeStep >= index ? "#fff" : "#999",
                      opacity: isStepAccessible(index) ? 1 : 0.5,
                    }}
                  >
                    {activeStep > index ? <CheckCircle /> : step.icon}
                  </Box>
                }
              >
                {step.label}
              </StepLabel>
              <StepContent sx={{ ml: { xs: 0, sm: 3 }, pl: { xs: 0, sm: 3 }, borderLeft: { xs: "none", sm: "1px solid #bdbdbd" } }}>
                <Card sx={{ ...cardStyle, m: { xs: 0, sm: 2 }, width: "100%" }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>{step.content}</CardContent>
                  <Box
                    sx={{
                      mt: 3,
                      pb: 2,
                      px: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      // ✅ Step 1 ke liye responsive flexDirection
                      flexDirection: activeStep === 1 && isSmall ? "column" : "row",
                      gap: activeStep === 1 && isSmall ? 2 : 0,
                      alignItems: activeStep === 1 && isSmall ? "flex-start" : "center",
                    }}
                  >
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                      variant="outlined"
                      sx={{
                        borderColor: colorScheme.primary,
                        borderRadius: 10,
                        color: colorScheme.primary,
                        // ✅ Back button ko left corner pe fixed width
                        width: activeStep === 1 && isSmall ? "auto" : "auto",
                        alignSelf: "flex-start",
                        "&:hover": {
                          borderColor: colorScheme.secondary,
                          background: `${colorScheme.primary}10`,
                        },
                      }}
                    >
                      Back
                    </Button>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        // ✅ Step 1 ke liye responsive layout
                        flexDirection: activeStep === 1 && isSmall ? "column" : "row",
                        width: activeStep === 1 && isSmall ? "100%" : "auto",
                      }}
                    >
                      {activeStep === 1 && (
                        <Button
                          onClick={() => {
                            const data = {
                              businessDescription: watch("businessDescription"),
                              proposedSolution: watch("proposedSolution"),
                            };
                            AddSectionToPDf(data);
                          }}
                          variant="outlined"
                          endIcon={<ArrowForward />}
                          sx={{
                            border: "1px solid black",
                            borderRadius: 10,
                            // ✅ Full width on small screens
                            width: isSmall ? "100%" : "auto",
                            "&:hover": {
                              background: colorScheme.hoverGradient,
                              color: "#fff",
                            },
                          }}
                        >
                          Add These Sections to PDF
                        </Button>
                      )}

                      {index < steps.length - 1 && (
                        <Button
                          onClick={handleNext}
                          endIcon={<ArrowForward />}
                          variant="contained"
                          sx={{
                            background: colorScheme.gradient,
                            borderRadius: 10,
                            // ✅ Step 1 pe full width on small screens
                            width: activeStep === 1 && isSmall ? "100%" : "auto",
                            "&:hover": {
                              background: colorScheme.hoverGradient,
                            },
                          }}
                        >
                          Next
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </>
  );
};

export default ProposalFormWithStepper;
