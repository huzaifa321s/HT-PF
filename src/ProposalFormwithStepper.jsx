import React, { useEffect, useState } from "react";
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
import { useDebouncedCallback } from "use-debounce";
import axiosInstance from "./utils/axiosInstance";

const ProposalFormWithStepper = ({
  control,
  errors,
  watch,
  setValue,
  handleSubmit,
  handleSubmitForm,
  inputRefs,
  watchedServices,
  watchedCharges,
  currency,
  handleCurrencyChange,
  customPlatform,
  setCustomPlatform,
  isLoading,
  showToast,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
    const [creds, setCreds] = useState({ yourName: "", yourEmail: "" });
  const [pdfBlob, setPdfBlob] = useState(null);
  const dispatch = useDispatch();
const proposaldata = useSelector((s) => s.proposal)
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

  // Enhanced platform groups with nested structure
  const enhancedPlatformGroups = {
    Marketing: {
      "Email Marketing": [
        "Newsletter Campaigns",
        "Automated Emails",
        "Lead Nurturing",
      ],
      "Digital Marketing": [
        "SEO Optimization",
        "Social Media Marketing",
        "PPC Campaigns",
      ],
      "Content Marketing": ["Blog Writing", "Video Content", "Infographics"],
    },
    Development: {
      "WordPress Development": [
        "Theme Development",
        "Plugin Development",
        "WooCommerce",
      ],
      "Web Development": [
        "Frontend Development",
        "Backend Development",
        "Full Stack",
      ],
      "Mobile Development": [
        "iOS Development",
        "Android Development",
        "React Native",
      ],
    },
    Design: {
      "UI/UX Design": ["Wireframing", "Prototyping", "User Testing"],
      "Graphic Design": ["Logo Design", "Brand Identity", "Print Materials"],
    },
  };

  const allPlatformGroups = {
  ...enhancedPlatformGroups,

  ...(proposaldata.customPlatforms?.length > 0 && {
    "Custom Platforms": {
      Custom: [...(watch("customPlatforms") || [])],
    },
  }),
};

  // Generate PDF Preview
  const generatePdfPreview = async () => {
    try {
      const formData = watch();
      const blob = await pdf(<ProposalDocument formData={formData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBlob(blob);
      setPreviewOpen(true);
    } catch (error) {
      console.error("PDF generation failed:", error);
      showToast("PDF generation failed. Please try again.", "error");
    }
  };
  const debouncedAddPlatform = useDebouncedCallback(
    (platformName) => {
      dispatch(addCustomPlatform({ platformName }));
    },
    300 // debounce delay in ms
  );
  // Download PDF
  const downloadPdf = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${watch("clientName") || "client"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };


  const handleSubmitData = (data) => {
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
    dispatch(updateCharges({ serviceCharges: data.serviceCharges }));
  }
console.log('creds',creds);
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
            value={creds?.yourName}
            rules={{ required: "Your name is required" }}
            disabled
            render={({ field }) => (
              <TextField
                {...field}
                label="Your Name *"
                fullWidth
               value={creds.yourName} 
                error={!!errors.yourName}
                helperText={errors.yourName?.message}
                inputRef={(el) => {
                  field.ref(el);
                  inputRefs.current.yourName = el;
                }}
                disabled
                sx={inputStyle}
              />
            )}
          />
          <Controller
            name="yourEmail"
            control={control}
            value={creds?.yourEmail}
            rules={{
              required: "Your email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            }}
            disabled
            render={({ field }) => (
              <TextField
                {...field}
                label="Your Email *"
                fullWidth
                error={!!errors.yourEmail}
                helperText={errors.yourEmail?.message}
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
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
                inputRef={(el) => {
                  field.ref(el);
                  inputRefs.current.clientName = el;
                }}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                sx={inputStyle}
              />
            )}
          />
          <Controller
            name="clientEmail"
            control={control}
            rules={{
              required: "Client email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Client Email *"
                fullWidth
                error={!!errors.clientEmail}
                helperText={errors.clientEmail?.message}
                inputRef={(el) => (inputRefs.current.clientEmail = el)}
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
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
                inputRef={(el) => (inputRefs.current.brandName = el)}
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
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
                inputRef={(el) => (inputRefs.current.projectTitle = el)}
                sx={inputStyle}
              />
            )}
          />
          <Controller
            name="businessDescription"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Business Description"
                multiline
                rows={3}
                fullWidth
                inputRef={(el) => (inputRefs.current.businessDescription = el)}
                sx={inputStyle}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  console.log("field", field);
                }}
              />
            )}
          />

          <Controller
            name="proposedSolution"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Proposed Solution"
                multiline
                rows={3}
                fullWidth
                inputRef={(el) => (inputRefs.current.proposedSolution = el)}
                sx={inputStyle}
              />
            )}
          />

          {/* ENHANCED PLATFORM SELECTOR */}
          <Controller
            name="developmentPlatforms"
            control={control}
            rules={{
              validate: (value) =>
                (Array.isArray(value) && value.length > 0) ||
                "At least one platform is required",
            }}
            render={({ field }) => (
              <FormControl
                fullWidth
                error={!!errors.developmentPlatforms}
                sx={{ ...inputStyle }}
              >
                <Typography
                  sx={{ fontSize: 20, fontWeight: 600, textAlign: "start" }}
                >
                  Development Platforms *
                </Typography>

                <Box sx={{ mt: 2 }}>
                  {Object.keys(allPlatformGroups).map((parent) => (
                    <Accordion
                      key={parent}
                      sx={{
                        mb: 1,
                        border: `2px solid ${
                          field.value.some((item) =>
                            Object.keys(allPlatformGroups[parent]).some(
                              (child) =>
                                allPlatformGroups[parent][child].includes(item)
                            )
                          )
                            ? colorScheme.primary
                            : "#e0e0e0"
                        }`,
                        borderRadius: 2,
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={Object.keys(
                                allPlatformGroups[parent]
                              ).some((child) =>
                                allPlatformGroups[parent][child].some(
                                  (subItem) => field.value.includes(subItem)
                                )
                              )}
                              indeterminate={
                                Object.keys(allPlatformGroups[parent]).some(
                                  (child) =>
                                    allPlatformGroups[parent][child].some(
                                      (subItem) => field.value.includes(subItem)
                                    )
                                ) &&
                                !Object.keys(allPlatformGroups[parent]).every(
                                  (child) =>
                                    allPlatformGroups[parent][child].every(
                                      (subItem) => field.value.includes(subItem)
                                    )
                                )
                              }
                              onChange={(e) => {
                                const allSubItems = Object.keys(
                                  allPlatformGroups[parent]
                                ).flatMap(
                                  (child) => allPlatformGroups[parent][child]
                                );
                                const newValue = e.target.checked
                                  ? [
                                      ...new Set([
                                        ...field.value,
                                        ...allSubItems,
                                      ]),
                                    ]
                                  : field.value.filter(
                                      (item) => !allSubItems.includes(item)
                                    );
                                field.onChange(newValue);
                                dispatch(
                                  updateField({
                                    field: "developmentPlatforms",
                                    value: newValue,
                                  })
                                );
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: colorScheme.primary,
                              }}
                            >
                              {parent}
                            </Typography>
                          }
                        />
                      </AccordionSummary>
                      <AccordionDetails>
                        {Object.keys(allPlatformGroups[parent]).map((child) => (
                          <Box key={child} sx={{ ml: 3, mb: 2 }}>
                            <FormGroup sx={{ ml: 1 }}>
                              {allPlatformGroups[parent][child].map(
                                (subItem) => (
                                  <FormControlLabel
                                    key={subItem}
                                    control={
                                      <Checkbox
                                        checked={field.value.includes(subItem)}
                                        onChange={(e) => {
                                          const newValue = e.target.checked
                                            ? [...field.value, subItem]
                                            : field.value.filter(
                                                (val) => val !== subItem
                                              );
                                          field.onChange(newValue);
                                          dispatch(
                                            updateField({
                                              field: "developmentPlatforms",
                                              value: newValue,
                                            })
                                          );
                                        }}
                                      />
                                    }
                                    label={subItem}
                                  />
                                )
                              )}
                            </FormGroup>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
                {errors.developmentPlatforms && (
                  <FormHelperText
                    sx={{
                      color: colorScheme.error,
                      fontSize: "0.875rem",
                      mt: 1,
                    }}
                  >
                    {errors.developmentPlatforms.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* ADD CUSTOM PLATFORM */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              value={customPlatform}
              onChange={(e) => setCustomPlatform(e.target.value)}
              placeholder="Add custom platform..."
              fullWidth
              sx={inputStyle}
            />
            <Button
              variant="contained"
              sx={{
                background: colorScheme.gradient,
                "&:hover": { background: colorScheme.hoverGradient },
                minWidth: "120px",
                height: "56px",
                borderRadius:10
              }}
              onClick={() => {
                if (customPlatform.trim()) {
                    dispatch(addCustomPlatform({ platformName:customPlatform }));
                  setCustomPlatform("");
                }
              }}
            >
              Add
            </Button>


          </Box>
        </>
      ),
    },
    {
      label: "Timeline and Costs",
      icon: <AttachMoney />,
      content: (
        <>
          {sectionHeader(<AttachMoney />, "Timeline and Costs")}
          <Controller
            name="projectDuration"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Project Duration"
                fullWidth
                inputRef={(el) => (inputRefs.current.projectDuration = el)}
                sx={inputStyle}
              />
            )}
          />
          <Controller
            name="advancePercent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Advance Percentage"
                type="number"
                fullWidth
                inputRef={(el) => (inputRefs.current.advancePercent = el)}
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
                inputRef={(el) => (inputRefs.current.additionalCosts = el)}
                sx={inputStyle}
              />
            )}
          />
          <Controller
            name="timelineMilestones"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Timeline Milestones"
                multiline
                rows={3}
                fullWidth
                inputRef={(el) => (inputRefs.current.timelineMilestones = el)}
                sx={inputStyle}
              />
            )}
          />

          {/* Services Charges */}
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: colorScheme.primary }}
              >
                Charge Amount ({currency === "USD" ? "$" : "₨"})
              </Typography>
              <ToggleButtonGroup
                value={currency}
                exclusive
                onChange={handleCurrencyChange}
                sx={{
                  "& .MuiToggleButton-root": {
                    borderColor: colorScheme.primary,
                    color: colorScheme.primary,
                    "&.Mui-selected": {
                      background: colorScheme.gradient,
                      color: "#fff",
                    },
                  },
                }}
              >
                <ToggleButton value="USD">$ USD</ToggleButton>
                <ToggleButton value="PKR">₨ PKR</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {watchedServices?.length > 0 && (
              <>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: colorScheme.primary, fontWeight: 600 }}
                >
                  Recommended Services
                </Typography>
                {watchedServices?.map((service, i) => (
                  <Card
                    key={i}
                    sx={{
                      mb: 2,
                      p: 2,
                      background: "#f8f9ff",
                      border: `1px solid ${colorScheme.primary}20`,
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <TextField
                          value={service}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newServices = [...watchedServices];
                            newServices[i] = val;
                            setValue("recommended_services", newServices);
                            dispatch(updateServices(newServices));
                          }}
                          label="Service Name"
                          fullWidth
                          sx={inputStyle}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          value={
                            watchedCharges[i] !== undefined
                              ? watchedCharges[i]
                              : ""
                          }
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const newCharges = [...watchedCharges];
                            newCharges[i] = isNaN(val) ? 0 : val; // store 0 if invalid
                            setValue("serviceCharges", newCharges);
                          }}
                          label="Charge Amount"
                          type="number"
                          fullWidth
                          sx={inputStyle}
                        />
                      </Grid>

                      {i === 0 && watchedServices?.length === 1 ? null : (
                        <Grid item xs={12} md={3}>
                          <Button
                            onClick={() => {
                              const newServices = [...watchedServices];
                              newServices.splice(i, 1);
                              setValue("recommended_services", newServices);
                              const newCharges = [...watchedCharges];
                              newCharges.splice(i, 1);
                              setValue("serviceCharges", newCharges);
                              dispatch(removeService({ index: i }));
                            }}
                            variant="outlined"
                            color="error"

                            fullWidth
                            sx={{ height: "30px" ,display:'flex',alignItems:'center',borderRadius:10}}
                          >
                            Delete <Delete/>
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Card>
                ))}
                <Button
                  onClick={() => {
                    setValue("recommended_services", [
                      ...watchedServices,
                      "New Service",
                    ]);
                    setValue("serviceCharges", [...watchedCharges, 0]);
                    dispatch(addService({ serviceName: "New Service" }));
                  }}
                  variant="contained"
                  startIcon={<Add />}
                  sx={{
                    background: colorScheme.gradient,
                    "&:hover": { background: colorScheme.hoverGradient },
                    mb: 2,
                    borderRadius:10
                  }}
                >
                  + Add Service
                </Button>

                {watchedCharges?.length > 0 && (
                  <Card
                    sx={{
                      p: 3,
                      background: colorScheme.gradient,
                      color: "#fff",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, textAlign: "center" }}
                    >
                      Grand Total: {currency === "USD" ? "$" : "₨"}{" "}
                      {watchedCharges
                        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                        .toFixed(2)}
                    </Typography>
                  </Card>
                )}
              </>
            )}

            <Box sx={{ mt: 2, p: 2, background: "#f0f2ff", borderRadius: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: colorScheme.primary }}
              >
                {watchedServices?.length || 0} Services Selected
              </Typography>
              {watchedServices?.length > 0 ? (
                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {watchedServices.map((s, i) => (
                    <Chip
                      key={i}
                      label={s}
                      sx={{
                        background: colorScheme.gradient,
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                  No services recommended yet.
                </Typography>
              )}
            </Box>
          </Box>
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
              >
                <InputLabel>Call Outcome *</InputLabel>
                <Select {...field} label="Call Outcome *">
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
            defaultValue={new Date().toISOString().split("T")[0]} // <-- today
            disabled
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                disabled
                label="Date"
                fullWidth
                value={new Date().toISOString().split("T")[0]} // fallback today
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
            <Button
                onClick={() => {handleSubmit(handleSubmitData),dispatch(showToast({message:'Data added to PDF successfully',servity:'success'}))}}
                variant="contained"
                size="large"
                startIcon={<Send />}
                disabled={isLoading}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 4,
                  fontSize: "1rem",
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
              Set form Data To Pdf
              </Button>
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
            <UnifiedPdfEditor />
            <Grid item xs={12} md={6}>
              <Button
                onClick={handleSubmit(handleSubmitForm)}
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
                {isLoading ? "Generating Proposal..." : "Generate Proposal PDF"}
              </Button>
            </Grid>
          </Box>
        </>
      ),
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (stepIndex) => {
    setActiveStep(stepIndex);
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
                onClick={() => handleStepClick(index)}
                sx={{
                  cursor: "pointer",
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
                      color: colorScheme.primary,
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
                        borderRadius:10,
                        color: colorScheme.primary,
                        "&:hover": {
                          borderColor: colorScheme.secondary,
                          background: `${colorScheme.primary}10`,
                        },
                      }}
                    >
                      Back
                    </Button>
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
                          borderRadius:10,
                        }}
                      >
                        Next
                      </Button>
                    )}
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
