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
} from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { pdf } from "@react-pdf/renderer";
import ProposalDocument from "./components/pdf/ProposalDocument";
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
import { addSection } from "./utils/page2Slice";

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
    projectTitle: useRef(null),
    businessDescription: useRef(null),
    proposedSolution: useRef(null),
    callOutcome: useRef(null),
  };
  // ✅ Step-wise required fields
  const stepFields = {
    0: ["clientName", "clientEmail"],
    1: ["projectTitle", "businessDescription", "proposedSolution"],
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
    p: { xs: 2, sm: 3, md: 4 },
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
          sx: { fontSize: 24, color: "#fff" },
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

  const AddSectionToPDf = (data) => {
    handleNext();

    dispatch(
      addSection({
        type: "title",
        title: "Business Description",
        content: data.businessDescription.trim(),
      })
    );
    dispatch(
      addSection({
        type: "title",
        title: "Proposed Solution",
        content: data.proposedSolution.trim(),
      })
    );
  };

  const handleSubmitData = async (data) => {
    console.log("Form data submitted:", data);
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

    await handleSubmitForm(data);
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
                type="email" // ✅ HTML5 email validation bhi
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
            render={({ field }) => (
              <TextField
                {...field}
                label="Brand Name"
                fullWidth
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
      icon: <AttachMoney />,
      content: (
        <>
          {sectionHeader(<AttachMoney />, "Costs")}

          <Controller
            name="advancePercent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Advance Percentage"
                type="number"
                fullWidth
                sx={inputStyle}
              />
            )}
          />
          <Controller
            name="additionalCosts"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Additional Costs"
                type="number"
                fullWidth
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
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.callOutcome}
                sx={inputStyle}
                ref={fieldRefs.callOutcome}
              >
                <InputLabel>Call Outcome *</InputLabel>
                <Select
                  {...field}
                  label="Call Outcome *"
                  onChange={(e) => handleFieldChange("callOutcome", field, e)}
                >
                  <MenuItem value="Interested">Interested</MenuItem>
                  <MenuItem value="No Fit">No Fit</MenuItem>
                  <MenuItem value="Flaked">Flaked</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                </Select>
                {errors.callOutcome && (
                  <FormHelperText>{errors.callOutcome.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="date"
            control={control}
            defaultValue={new Date().toISOString().split("T")[0]}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                disabled
                label="Date"
                fullWidth
                value={new Date().toISOString().split("T")[0]}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
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
                }}
              />
            )}
          />
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
                  px: 6,
                  py: 2,
                  borderRadius: 4,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  boxShadow: 6,
                  background: colorScheme.gradient,
                  "&:hover": {
                    background: colorScheme.hoverGradient,
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                  },
                  width: "100%",
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
      // ✅ Current step ke fields validate karo
      const isValid = await trigger(currentStepFields);

      if (!isValid) {
        // ✅ First error field par scroll karo
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

        return; // ✅ Validation fail - Next step pe mat jao
      }
    }

    // ✅ Validation pass - Next step pe jao
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <Box
        sx={{ maxWidth: 1800, margin: "0 auto", p: { xs: 1, sm: 2, md: 3 } }}
      >
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label} sx={{ mb: 3 }}>
              <StepLabel
                onClick={() => handleStepClick(index)} // Already conditional hai handleStepClick mein
                sx={{
                  cursor: isStepAccessible(index) ? "pointer" : "not-allowed", // ✅ Cursor change
                  opacity: isStepAccessible(index) ? 1 : 0.5, // ✅ Visual feedback
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
                        : "text.secondary", // ✅ Hover bhi conditional
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
                      opacity: isStepAccessible(index) ? 1 : 0.5, // ✅ Icon opacity
                    }}
                  >
                    {activeStep > index ? <CheckCircle /> : step.icon}
                  </Box>
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Card sx={cardStyle}>
                  <CardContent>{step.content}</CardContent>
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent: "space-between",
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
                        "&:hover": {
                          borderColor: colorScheme.secondary,
                          background: `${colorScheme.primary}10`,
                        },
                      }}
                    >
                      Back
                    </Button>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                            "&:hover": {
                              background: colorScheme.hoverGradient,
                              color: "#fff",
                            },
                            borderRadius: 10,
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
                            "&:hover": {
                              background: colorScheme.hoverGradient,
                            },
                            borderRadius: 10,
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
