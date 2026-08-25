"use client";
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
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  InputAdornment,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import {
  Timeline,
  CheckCircle,
  Send,
  ArrowBack,
  ArrowForward,
  Person,
  Business,
  Description,
  Preview,
  Edit,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  setFullFormData,
} from "../utils/proposalSlice";
import axiosInstance from "../utils/axiosInstance";
import { replacePage2Content, setOriginalAiResponse } from "../utils/page2Slice";
import { setBrandName } from "../utils/page1Slice";
import { updateTitle } from "../utils/page3Slice";
import { useDebounce } from "use-debounce";
import { store } from "../utils/store";
import { showToast } from "../utils/toastSlice";
import { motion, AnimatePresence } from "framer-motion";
import AiAssistantModal from "./modals/AiAssistantModal";

const ProposalFormWithStepper = ({
  control,
  errors,
  watch,
  handleSubmit,
  register,
  handleSubmitForm,
  isLoading,
  trigger,
  setValue,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [creds, setCreds] = useState({ yourName: "", yourEmail: "" });
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [existingProposalId, setExistingProposalId] = useState(null); // Added state for existing proposal
  const [existingProposalOwner, setExistingProposalOwner] = useState(null); // Added state for ownership check
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [existingProposalsCount, setExistingProposalsCount] = useState(0); // Added for multiple proposals limit
  const [limitExceeded, setLimitExceeded] = useState(false); // Added for multiple proposals limit
  const existingProposalRef = useRef({ id: null, owner: null }); // Backup ref to survive React 18 strict mode state-loss
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize navigate

  let userStr = null;
  if (typeof window !== "undefined") {
    try {
      userStr = sessionStorage.getItem("user");
    } catch (e) {
      console.warn("sessionStorage access failed in ProposalFormWithStepper:", e);
    }
  }
  const user = userStr ? JSON.parse(userStr) : {};
  const clientEmailValue = watch("clientEmail");
  const [debouncedClientEmail] = useDebounce(clientEmailValue, 600);

  // ✅ Refs for all required fields
  const fieldRefs = {
    clientName: useRef(null),
    clientEmail: useRef(null),
    brandName: useRef(null),
    projectTitle: useRef(null),
  };
  // ✅ Step-wise required fields
  const stepFields = {
    0: ["clientName"],
    1: ["brandName", "projectTitle"],
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

  useEffect(() => {
    const email =
      typeof debouncedClientEmail === "string"
        ? debouncedClientEmail.trim()
        : "";
    if (!email) return;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return;

    // Use a small timeout to ensure the field is registered before triggering validation
    const timer = setTimeout(() => {
      trigger("clientEmail");
    }, 200);

    return () => clearTimeout(timer);
  }, [debouncedClientEmail, trigger]);

  // Color scheme matching Generate PDF button
  const colorScheme = {
    primary: "#f3a833",
    secondary: "#f59e0b",
    accent: "#f3a833",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#f44336",
    gradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    brandGradient: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
    hoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
    brandHoverGradient: "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };
  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  const listItemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const cardStyle = {
    mb: 3,
    p: { xs: 0, sm: 3, md: 4 },
    background: "#0a0a0a",
    border: "1px solid rgba(243, 168, 51, 0.2)",
    borderRadius: 3,
    boxShadow: "0 4px 20px rgba(243, 168, 51, 0.1)",
  };

  const inputStyle = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: "#141414",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: colorScheme.primary,
        },
      },
    },
  };

  const sectionHeader = (icon, title) => (
    <Box component={motion.div} variants={sectionVariants} initial="hidden" animate="visible" sx={{ display: "flex", alignItems: "center", mb: 3, mt: 2 }}>
      <Box
        component={motion.div}
        sx={{
          p: 1.5,
          mr: 2,
          background: colorScheme.gradient,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 12, color: "#fff" },
        })}
      </Box>
      <Typography
        component={motion.div}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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

  const handleSubmitData = async (data) => {
    const submitData = { ...data };
    if (submitData.projectCategory === "Other" && submitData.customProjectCategory) {
      submitData.projectCategory = submitData.customProjectCategory;
    }
    
    // Fields businessDescription and proposedSolution have been removed from backend schema

    console.log("Form data submitted:", submitData);
    dispatch(setFullFormData({ ...submitData, isUnsavedEdit: true }));

    await handleSubmitForm(submitData);
  };

  const handleGenerateAI = () => {
    setAiModalOpen(true);
  };

  const handleApplyAiData = (data, updatedBrief) => {
    if (data && data.sections) {
      dispatch(replacePage2Content(data));
      dispatch(setOriginalAiResponse(data.sections));
      if (updatedBrief) {
        setValue("projectBrief", updatedBrief);
      }
      handleSubmit(handleSubmitData, onInvalid)();
    }
  };

  // ✅ Check if a step is accessible
  const isStepAccessible = (stepIndex) => {
    if (stepIndex > 0 && errors?.clientEmail) return false;
    if (stepIndex > 0 && limitExceeded) return false;

    // Current step ya pehle ke steps accessible hain
    for (let i = 0; i < stepIndex; i++) {
      const fields = stepFields[i];
      // Agar koi bhi field empty hai previous step mein
      const hasError = fields.some((field) => {
        const value = watch(field); // react-hook-form se value lao
        const isEmpty =
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "");
        return isEmpty || !!errors?.[field];
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
  const isMobile = useMediaQuery("(max-width:768px)");
  // Add this state at the top of your component
  const formatNumberDisplay = (value) => {
    if (!value) return "";
    const number = value.toString().replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  // Updated formatNumberInWords function jo teeno currencies ko handle kare
  const formatNumberInWords = (value) => {
    if (!value) return "";

    const number = parseInt(value.toString().replace(/[^0-9]/g, ""), 10);
    if (isNaN(number) || number === 0) return "";

    if (number >= 1000000000) {
      return `${(number / 1000000000).toFixed(2)}B`;
    } else if (number >= 1000000) {
      return `${(number / 1000000).toFixed(2)}M`;
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(2)}K`;
    }
    return number.toLocaleString();
  };
  const allSteps = [
    {
      label: "Your & Client Information",
      icon: <Person />,
      content: (
        <>
          {/* YOUR INFORMATION */}
          {sectionHeader(<Person />, "Your Information")}
          <Box component={motion.div} variants={fieldVariants}>
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
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
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
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
            <Button
              variant="outlined"
              onClick={() => router.push("/profile")}
              startIcon={<Edit />}
              sx={{
                mb: 3,
                borderRadius: 2,
                borderColor: colorScheme.primary,
                color: colorScheme.primary,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "rgba(243, 168, 51, 0.1)",
                  borderColor: colorScheme.secondary,
                },
              }}
            >
              Edit Profile Info
            </Button>
          </Box>

          {/* CLIENT INFORMATION */}
          {sectionHeader(<Business />, "Client Information")}
          <Box component={motion.div} variants={fieldVariants}>
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
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="clientEmail"
              control={control}
              rules={{
                required: false,
                validate: {
                  isValidEmail: (value) => {
                    if (!value) return true;
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    return emailRegex.test(value) || "Please enter a valid email address";
                  },
                  checkUniqueness: async (value) => {
                    if (!value) return true;
                    try {
                      const res = await axiosInstance.get("/api/proposals/check-email", {
                        params: { email: value },
                      });
                      if (res.data?.success && res.data.exists) {
                        setExistingProposalsCount(res.data.count);
                        setLimitExceeded(res.data.limitExceeded);
                        setExistingProposalId(res.data.proposalId); // legacy
                        setExistingProposalOwner(res.data.createdBy); // legacy
                        existingProposalRef.current = { id: res.data.proposalId, owner: res.data.createdBy };

                        if (res.data.limitExceeded) {
                          return "Limit exceeded: Max 5 proposals allowed for this client email";
                        }
                      } else {
                        setExistingProposalsCount(0);
                        setLimitExceeded(false);
                        setExistingProposalId(null);
                        setExistingProposalOwner(null);
                        existingProposalRef.current = { id: null, owner: null };
                      }
                      return true;
                    } catch (err) {
                      console.error("Error checking uniqueness:", err);
                      return true; // Proceed if API fails
                    }
                  },
                  // ✅ Check for valid email domains
                  validDomain: (value) => {
                    if (!value) return true;
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
                    if (!value) return true;
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
                <Box>
                  <TextField
                    {...field}
                    label="Client Email"
                    fullWidth
                    type="email"
                    error={!!errors.clientEmail || limitExceeded}
                    helperText={
                      errors.clientEmail?.message || (limitExceeded ? "Limit exceeded: Max 5 proposals allowed for this client email" : "")
                    }
                    inputRef={fieldRefs.clientEmail}
                    sx={inputStyle}
                    onChange={(e) => {
                      handleFieldChange("clientEmail", field, e);
                      if (existingProposalsCount > 0) setExistingProposalsCount(0);
                      if (limitExceeded) setLimitExceeded(false);
                      if (existingProposalId) setExistingProposalId(null);
                      existingProposalRef.current = { id: null, owner: null };
                    }}
                  />

                  {existingProposalsCount > 0 && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Preview />}
                      onClick={() =>
                        router.push(`/admin/proposals?search=${encodeURIComponent(field.value)}`)
                      }
                      sx={{
                        mt: -1,
                        mb: 2,
                        background: colorScheme.gradient,
                        borderRadius: 10,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          background: colorScheme.hoverGradient,
                        },
                      }}
                    >
                      View All Proposals ({existingProposalsCount})

                    </Button>
                  )}
                </Box>
              )}
            />
          </Box>
        </>
      ),
    },
    {
      label: "Project Details",
      icon: <Description />,
      content: (
        <>
          {sectionHeader(<Description />, "Project Details")}
          <Box component={motion.div} variants={fieldVariants}>
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
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
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
          </Box>
          <Box component={motion.div} variants={fieldVariants}>
            <Controller
              name="projectCategory"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormControl fullWidth sx={inputStyle} error={!!errors.projectCategory}>
                  <InputLabel>Project Category</InputLabel>
                  <Select
                    {...field}
                    label="Project Category"
                    onChange={(e) => handleFieldChange("projectCategory", field, e)}
                    MenuProps={{
                      disablePortal: true,
                      sx: {
                        position: "absolute !important",
                        top: "0 !important",
                        left: "0 !important",
                        width: "100%",
                        height: "100%",
                        "& .MuiPaper-root": {
                          top: "100% !important",
                          left: "0 !important",
                          position: "absolute !important",
                          width: "100%",
                          boxSizing: "border-box",
                          transform: "none !important",
                          mt: 0.5,
                        },
                      },
                      PaperProps: {
                        sx: {
                          bgcolor: "#1a1a1a",
                          border: "1px solid rgba(243, 168, 51, 0.2)",
                          borderRadius: 2,
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
                          maxHeight: 250,
                          "& .MuiMenuItem-root": {
                            fontSize: "0.85rem",
                            py: 1.2,
                            px: 2,
                            color: "#e2e8f0",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              bgcolor: "rgba(243, 168, 51, 0.1)",
                              color: "#f3a833",
                            },
                            "&.Mui-selected": {
                              bgcolor: "rgba(243, 168, 51, 0.15)",
                              color: "#f3a833",
                              fontWeight: 600,
                              "&:hover": {
                                bgcolor: "rgba(243, 168, 51, 0.2)",
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="Fashion & Apparel">Fashion & Apparel</MenuItem>
                    <MenuItem value="E-commerce & Retail">E-commerce & Retail</MenuItem>
                    <MenuItem value="Technology & SaaS">Technology & SaaS</MenuItem>
                    <MenuItem value="Real Estate">Real Estate</MenuItem>
                    <MenuItem value="Health & Wellness">Health & Wellness</MenuItem>
                    <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                    <MenuItem value="Agency & Portfolio">Agency & Portfolio</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {errors.projectCategory && <FormHelperText>{errors.projectCategory.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
          {watch("projectCategory") === "Other" && (
            <Box component={motion.div} variants={fieldVariants} sx={{ mt: -1, mb: 2 }}>
              <Controller
                name="customProjectCategory"
                control={control}
                defaultValue=""
                rules={{ required: "Custom category is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Please Specify Category *"
                    fullWidth
                    error={!!errors.customProjectCategory}
                    helperText={errors.customProjectCategory?.message}
                    sx={inputStyle}
                  />
                )}
              />
            </Box>
          )}

          {/* Project Brief for AI Generation */}
          <Box component={motion.div} variants={fieldVariants} sx={{ mb: 2 }}>
            <Controller
              name="projectBrief"
              control={control}
              defaultValue=""
              rules={{
                minLength: { value: 50, message: "Brief must be at least 50 characters" },
                maxLength: { value: 5000, message: "Brief must not exceed 5,000 characters" },
              }}
              render={({ field, fieldState }) => {
                const charCount = (field.value || "").length;
                const MIN = 50;
                const MAX = 5000;
                const tooShort = charCount > 0 && charCount < MIN;
                const tooLong = charCount > MAX;
                const isValid = charCount >= MIN && charCount <= MAX;
                return (
                  <>
                    <TextField
                      {...field}
                      label="Project Brief (for AI Generation)"
                      fullWidth
                      multiline
                      rows={5}
                      placeholder={`Describe the client's business, what they need, and goals for this proposal.\n\nInclude key details such as:\n• Services required (website, mobile app, branding, etc.)\n• Target audience or industry\n• Any specific requirements or deadlines\n• Budget range (if known)`}
                      error={tooShort || tooLong || !!fieldState.error}
                      sx={inputStyle}
                    />
                    {/* Live char counter + hint */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5, px: 0.5 }}>
                      <Box sx={{ fontSize: "11px", color: tooShort ? "#f3a833" : tooLong ? "#f43f5e" : isValid ? "#10b981" : "#64748b" }}>
                        {charCount === 0 && "Minimum 50 characters required for quality AI output"}
                        {charCount > 0 && charCount < MIN && `⚠ ${MIN - charCount} more character${MIN - charCount === 1 ? '' : 's'} needed`}
                        {isValid && "✓ Good — AI ready to generate"}
                        {tooLong && `✕ ${charCount - MAX} character${charCount - MAX === 1 ? '' : 's'} over limit`}
                      </Box>
                      <Box sx={{ fontSize: "11px", fontWeight: 600, color: tooLong ? "#f43f5e" : charCount >= MIN ? "#10b981" : "#64748b" }}>
                        {charCount} / 5,000
                      </Box>
                    </Box>
                  </>
                );
              }}
            />
            
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || !watch("projectBrief")}
              sx={{
                mt: 1.5,
                borderRadius: 10,
                borderColor: colorScheme.primary,
                color: colorScheme.primary,
                "&:hover": {
                  bgcolor: "rgba(243, 168, 51, 0.1)",
                  borderColor: colorScheme.secondary,
                }
              }}
            >
              {isGeneratingAI ? "Generating Content..." : "Generate with AI & Continue"}
            </Button>
          </Box>


        </>
      ),
    },
  ];

  const steps = allSteps.filter(step => step.label !== "Additional Details" || showAdditionalDetails);

  const handleNext = async (targetStep) => {
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

    if (targetStep !== undefined) {
      setActiveStep(targetStep);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          maxWidth: 1800,
          margin: "0 auto",
          p: { xs: 0, sm: 2, md: 3 },
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: { xs: 2, sm: 0 },
            position: { xs: "relative", sm: "absolute" },
            top: { sm: 16 },
            right: { sm: 16 },
            zIndex: 10,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => window.open('/docs', '_blank')}
            sx={{
              color: colorScheme.primary,
              borderColor: colorScheme.primary,
              borderRadius: 8,
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "rgba(243, 168, 51, 0.1)" }
            }}
          >
            Help & Docs
          </Button>
        </Box>
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
                    component={motion.div}
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
                    animate={{ scale: activeStep === index ? [1, 1.06, 1] : 1 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {activeStep > index ? <CheckCircle /> : step.icon}
                  </Box>
                }
              >
                {step.label}
              </StepLabel>
              <StepContent sx={{ ml: { xs: 0, sm: 3 }, pl: { xs: 0, sm: 3 }, borderLeft: { xs: "none", sm: "1px solid #bdbdbd" } }}>
                <AnimatePresence mode="popLayout">
                  {activeStep === index && (
                    <Card
                      key={`step-card-${index}`}
                      component={motion.div}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      sx={{ ...cardStyle, m: { xs: 0, sm: 2 }, width: "100%" }}
                    >
                      <CardContent
                        sx={{ p: { xs: 2, sm: 2 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}
                      >
                        {step.content}
                      </CardContent>
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.35 }}
                        sx={{
                          mt: 3,
                          pb: 2,
                          px: 2,
                          display: "flex",
                          justifyContent: activeStep === 0 ? "flex-end" : "space-between",
                          flexDirection: isMobile ? "column" : "row",
                          gap: isMobile ? 2 : 0,
                          alignItems: isMobile ? "stretch" : "center",
                        }}
                      >
                        {activeStep > 0 && (
                          <Button
                            component={motion.button}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBack}
                            startIcon={<ArrowBack />}
                            variant="outlined"
                            sx={{
                              borderColor: colorScheme.primary,
                              borderRadius: 10,
                              color: colorScheme.primary,
                              width: isMobile ? "100%" : "auto",
                              "&:hover": {
                                borderColor: colorScheme.secondary,
                                background: `${colorScheme.primary}10`,
                              },
                            }}
                          >
                            Back
                          </Button>
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            flexDirection: isMobile ? "column" : "row",
                            width: isMobile ? "100%" : "auto",
                          }}
                        >
                          {index < steps.length - 1 && (
                            <Button
                              component={motion.button}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleNext()}
                              endIcon={<ArrowForward />}
                              variant="contained"
                              disabled={!isStepAccessible(index + 1)}
                              sx={{
                                background: colorScheme.gradient,
                                borderRadius: 10,
                                width: isMobile ? "100%" : "auto",
                                "&:hover": {
                                  background: colorScheme.hoverGradient,
                                },
                              }}
                            >
                              Next
                            </Button>
                          )}
                          {index === steps.length - 1 && (
                            <Button
                              component={motion.button}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSubmit(handleSubmitData, onInvalid)()}
                              variant="contained"
                              disabled={isLoading}
                              startIcon={isLoading ? <Timeline /> : <Send />}
                              sx={{
                                background: colorScheme.gradient,
                                borderRadius: 10,
                                px: { xs: 3, sm: 6 },
                                py: { xs: 1.5, sm: 2 },
                                fontWeight: 700,
                                width: isMobile ? "100%" : "auto",
                                "&:hover": {
                                  background: colorScheme.hoverGradient,
                                  boxShadow: "0 12px 32px rgba(243, 168, 51, 0.4)",
                                },
                              }}
                            >
                              {isLoading ? "Saving & Redirecting..." : "Save & Continue to Studio"}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Card>
                  )}
                </AnimatePresence>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <AiAssistantModal
          open={aiModalOpen}
          handleClose={() => setAiModalOpen(false)}
          initialBrief={watch("projectBrief")}
          onApply={handleApplyAiData}
        />
      </Box>
    </>
  );
};

export default ProposalFormWithStepper;
