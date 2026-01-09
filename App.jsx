import { memo, useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  CardContent,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  OutlinedInput,
  Paper,
  Select,
  Snackbar,
  TextField,
  IconButton,
  Typography,
  Skeleton,
  Autocomplete,
  LinearProgress,
  Fade,
  Stack,
  Avatar,
  alpha,
  useTheme,
  Container,
  useMediaQuery,
  Tooltip,
  // 👇 NEW: Tabs import
  Tabs,
  Tab,
  SvgIcon,
  Switch, // Added for mode toggle
  FormControlLabel,
  Badge,
  duration,
  FormHelperText,
  ListSubheader,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup, // Added for mode toggle label
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import {
  Send,
  Business,
  Person,
  CalendarMonth,
  AttachMoney,
  Code,
  Timeline,
  Add,
  CheckCircle,
  Info,
  DeblurOutlined,
  Download,
  Mic,
  CheckCircleOutlineRounded,
  Expand,
  ExpandMore,
} from "@mui/icons-material";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { io } from "socket.io-client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import BusinessInfoSection from "./components/BusinessInfoSection";
import LiveSpeechToText from "./components/LiveSpeechToText";
import AudioToProposal from "./components/UploadAudioSection";
import EmailPreview from "./components/EmailPreview";
import TranscriptDisplay from "./components/TranscriptionPreview";
import { useDispatch, useSelector } from "react-redux";
import { hideToast, showToast } from "./utils/toastSlice";
import {
  pauseRecordingWithToast,
  resumeRecordingRT,
  showRecordingToast,
  stopRecordingRT,
  updateStatus,
  updateTranscription,
} from "./utils/recordingToastSlice";
import RecordingToast from "./components/RecordingToast";
import { usePrompt } from "./hooks/usePrompt";
import axiosInstance from "./utils/axiosInstance";
import {
  clearTranscript,
  setPolishedTranscript,
} from "./utils/transcriptSlice";
import {
  addServiceRT,
  removeServiceRT,
  setFormDataRT,
  updateServiceChargeRT,
  updateServiceLabelRT,
} from "./utils/formDataSlice";
import { addTranscriptEntry } from "./utils/liveTranscriptionSlice";
import { setBrandName, setProjectBrief } from "./utils/page1Slice";
import ProposalFormWithStepper from "./ProposalFormwithStepper";
import { setBusinessInfo } from "./utils/businessInfoSlice";
import CombinedPdfDocument from "./CombinedPdf";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { addTable } from "./utils/page2Slice";
// import { usePrompt } from "./hooks/usePrompt";
import Pusher from 'pusher-js';
import { Provider } from "react-redux";
import { store } from "./utils/store";

export default function App() {
  const pdfRef = useRef();
  const [isLoading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("dev"); // New state for mode
  const [isPaused, setIsPaused] = useState(false);
  const [pauseTime, setPauseTime] = useState(null);
  const [badges, setBadges] = useState({
    proposal: false,
    live: false,
    audio: false,
    email: false,
    business: false,
    pdf: false,
    polished: false,
  });
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const historyEndRef = useRef(null);
  const inputRefs = useRef({});
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [dontShowNext, setDontShowNext] = useState(false);
  const [hasViewedPdf, setHasViewedPdf] = useState(false);
  const [uploadFile, setUplaodFile] = useState(null);
  const audioChunks = useRef([]);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const transcriptRT = useSelector(
    (state) => state.transcript.polishedTranscript
  );
  const [status, setStatus] = useState("Idle");
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");

  const {
    transcript: liveTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const formDataRT = useSelector((state) => state.form);
  const currentMode = useSelector((s) => s.page1Slice.currentMode);
  const currentMode2 = useSelector((s) => s.page2.currentMode);
  const currentMode3 = useSelector((s) => s.page3.currentMode);
  const currentMode4 = useSelector((s) => s.pricing.currentMode);
  const page1 = useSelector((s) => s.page1Slice[currentMode]);
  console.log("p3", page1);
  const page2 = useSelector((s) => s.page3[currentMode3]);
  const page3 = useSelector((s) => s.page2[currentMode2]); // ← Additional Info (page2Slice)
  const pricingPage = useSelector((s) => s.pricing[currentMode4]);
  const currentMode5 = useSelector((s) => s.paymentTerms.currentMode);
  const paymentTerms = useSelector((s) => s.paymentTerms[currentMode5]);
  const contactPage = useSelector((s) => s.contact);

  const [formData, setFormData] = useState(formDataRT);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const [transcriptWordLength, setTranscriptWordLength] = useState(0);
  const [romanUrdu, setRomanUrdu] = useState("");
  const [englishTranscript, setEnglishTranscript] = useState("");
  const [sttLanguage, setSttLanguage] = useState("ur-PK");
  const lastPolishedLengthRef = useRef(0);
  const [refinedLiveText, setRefinedLiveText] = useState("");
  const rawLengthAtLastPolish = useRef(0);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
    register,
    trigger,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      clientName: "abc",
      clientEmail: "example@gmail.com",
      projectTitle: "Word Press E-commerce Website",
      businessDescription: "abc",
      proposedSolution: "abc",
      developmentPlatforms: [],
      projectDuration: "",
      chargeAmount: "",
      advancePercent: "",
      additionalCosts: "",
      brandName: "Humantek",
      proposedBy: "",
      projectBrief: "",
      businessType: "",
      industoryTitle: "",
      strategicProposal: [],
      brandTagline: "",
      sweeterFashionPresence: "",
      selectedBDM: null,
      recommended_services: [],
      timelineMilestones: "",
      terms: "",
      callOutcome: "Interested",
      yourName: "",
      yourEmail: "",
      date: "",
    },
  });

  const [pdfUrl, setPdfUrl] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // === Socket Setup ===
  useEffect(() => {
    socketRef.current = io("https://ht-pb.vercel.app");

    socketRef.current.on("connect", () => {
      setConnectionStatus(true);
      setStatus("connected");
      dispatch(
        showToast({
          message:
            "🎙️ Live call transcription connected and ready for real-time streaming!",
          severity: "info",
          duration: 4000,
        })
      );
    });

    socketRef.current.on("status", (data) => {
      if (typeof data === "string") {
        setStatus(data);
        console.log("data", data);
      } else if (data?.message) {
        setLoadingStatus(data.message);
        dispatch(updateStatus(data.message));
      }
    });

    socketRef.current.on("pause_recording", () => {
      console.log("🎧 Recording paused by client");
      // stop temporarily forwarding chunks to Deepgram or Gladia
    });

    socketRef.current.on("resume_recording", () => {
      console.log("🎧 Recording resumed by client");
      // resume sending chunks again
    });

    socketRef.current.emit("ready");

    socketRef.current.on("finalized_transcript", (data) => {
      console.log("FULL FINAL TRANSCRIPT:", data);
      const text = data?.text?.trim();
      const extracted = data.extracted;

      if (text) {
        const entry = {
          type: "finalized",
          text,
          is_final: true,
          timestamp: new Date().toLocaleTimeString(),
          id: `finalized-${Date.now()}`,
        };
        setHistory((prev) => [...prev, entry]);
      }

      if (isValidData(extracted) || extracted?.deliverables?.length > 0 || extracted?.quotation?.length > 0) {
        dispatch(setBusinessInfo(extracted));

        // Restore: Prepare updated form data conditionally
        const updatedFormData = {
          ...formData,
          ...(extracted.brand_name && { brandName: extracted.brand_name }),
          ...(extracted.brand_tagline && { brandTagline: extracted.brand_tagline }),
          ...(extracted.business_details && { businessDescription: extracted.business_details }),
          ...(extracted.business_type && { businessType: extracted.business_type }),
          ...(extracted.industry_title && { industoryTitle: extracted.industry_title }),
          ...(extracted.project_brief && { projectBrief: extracted.project_brief }),
          ...(extracted.proposed_solution && { proposedSolution: extracted.proposed_solution }),
          ...(extracted.recommended_services?.length > 0 && { recommended_services: extracted.recommended_services }),
          ...(extracted.strategic_proposal?.length > 0 && { strategicProposal: extracted.strategic_proposal }),
        };
        // Update local state or dispatch if necessary (currently it was just a constant in previous code, 
        // but it implies the user intended to use these values)
      }

      // Update full transcript
      setFullTranscript(data.text);
      setRomanUrdu(data.romanUrdu || "");
      setEnglishTranscript(data.english || "");
      setTranscriptWordLength(data.length);
      setBadges((prev) => ({ ...prev, ["live"]: false }));
      dispatch(setPolishedTranscript(data.text));
    });

    socketRef.current.on("live_polished_text", (data) => {
      console.log("LIVE AI POLISHED:", data.text);
      if (data.text) {
        setRefinedLiveText(data.text);
      }
    });

    return () => {
      setBadges((prev) => ({ ...prev, ["live"]: false }));
      socketRef.current?.disconnect();
    };
  }, []);

  // === Periodic Live AI Polish ===
  useEffect(() => {
    if (!isRecording || isPaused || !transcript) return;

    // Trigger polish every ~15 words (roughly 60 characters) to avoid spamming
    const currentLength = transcript.length;
    if (currentLength - lastPolishedLengthRef.current > 100) {
      console.log("Emitting live_polish for length:", currentLength);
      socketRef.current?.emit("live_polish", { text: liveTranscript });
      lastPolishedLengthRef.current = currentLength;
      rawLengthAtLastPolish.current = currentLength;
    }
  }, [liveTranscript, isRecording, isPaused]);

  // Calculate display transcript: refined part + anything new in raw
  const displayTranscript = refinedLiveText
    ? refinedLiveText + liveTranscript.substring(rawLengthAtLastPolish.current)
    : liveTranscript;


  const startRecording = async () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    if (!browserSupportsSpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    try {
      setIsRecording(true);
      setIsPaused(false);
      resetTranscript();
      lastPolishedLengthRef.current = 0;
      setRefinedLiveText("");
      rawLengthAtLastPolish.current = 0;

      SpeechRecognition.startListening({
        continuous: true,
        language: sttLanguage
      });

      setBadges((prev) => ({ ...prev, live: true }));
      dispatch(showRecordingToast({ transcription: "", status: "Listening..." }));
      setLoadingStatus("Ready for live transcription");
    } catch (err) {
      alert("Mic error: " + err.message);
    }
  };

  const pauseRecording = () => {
    if (!isRecording || isPaused) return;
    setIsPaused(true);
    SpeechRecognition.stopListening();
    dispatch(pauseRecordingWithToast());
    socketRef.current?.emit("pause_recording");
  };

  const resumeRecording = () => {
    if (!isRecording || !isPaused) return;
    setIsPaused(false);
    SpeechRecognition.startListening({ continuous: true, language: sttLanguage });
    dispatch(resumeRecordingRT());
    socketRef.current?.emit("resume_recording");
  };

  const stopRecording = () => {
    setIsRecording(false);
    setLoadingStatus("");
    SpeechRecognition.stopListening();

    dispatch(stopRecordingRT());
    dispatch(showToast({ message: " 🛑 Recording Stopped", severity: "info" }));

    if (liveTranscript.trim().length > 0) {
      // Send the final transcript to backend for NLP
      socketRef.current?.emit("process_transcript", { transcript: liveTranscript });
      dispatch(showToast({ message: "Processing transcript...", severity: "info", loading: true }));
    }
  };

  usePrompt(true);

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;

    const firstErrorKey = Object.keys(errors)[0];
    const errorElement = inputRefs.current[firstErrorKey];

    if (errorElement) {
      errorElement.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        const input =
          errorElement.querySelector("input") ||
          errorElement.querySelector("textarea") ||
          errorElement.querySelector("[role='button']");
        if (input) input.focus();
      }, 300);
    }
  }, [errors]);

  const generatePdfActual = async (data, currency) => {
    setLoading(true);
    // Professional file name
    const brandName = data?.brandName?.trim() || "Client";
    const fileName = `${brandName} Proposal.pdf`;
    const blob = await pdf(
      <Provider store={store}>
        <CombinedPdfDocument
          paymentTerms={paymentTerms}
          pricingPage={pricingPage}
          page1Data={page1}
          page2Data={page2}
          page3Data={page3}
          contactData={contactPage}
          clientName={data.clientName}
          date={data.date}
        />
      </Provider>
    ).toBlob();

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
    const pdfPages = {
      paymentTerms,
      pricingPage,
      page1,
      page2,
      page3,
      contactPage,
    };

    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_APP_BASE_URL}api/proposals/create-proposal`,
        { data: data, selectedCurrency: currency, pdfPages },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.data.success) throw new Error("Proposal creation failed");
      const proposalId = res.data.data._id;

      dispatch(
        showToast({
          message: "Generating PDF...",
          severity: "info",
          loading: true,
        })
      );

      const formData = new FormData();
      formData.append("pdfFile", blob, fileName);
      formData.append("proposalId", proposalId);

      const uploadRes = await axiosInstance.post(
        `${import.meta.env.VITE_APP_BASE_URL}api/proposals/upload-pdf`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!uploadRes.data.success) throw new Error("PDF upload failed");

      const serverPdfUrl = `${uploadRes.data.filePath}`;
      setPdfUrl(serverPdfUrl);

      dispatch(
        showToast({ message: "Proposal + PDF ready!", severity: "success" })
      );
      return serverPdfUrl;
    } catch (err) {
      console.error(err);
      dispatch(hideToast());
      dispatch(
        showToast({
          message: err.response.data.message || "PDF generation/upload failed",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
      setMode("dev");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/get-creds");

        if (res.data?.success && res.data.data) {
          const { name, email } = res.data.data;

          // Only update if values exist
          const updatedData = {};
          if (name) updatedData.yourName = name;
          if (email) updatedData.yourEmail = email;

          if (Object.keys(updatedData).length > 0) {
            // Update local form state
            setFormData((prevData) => ({ ...prevData, ...updatedData }));

            // Update Redux slice
            dispatch(setFormDataRT({ ...formData, ...updatedData }));

            // Reset React Hook Form values
            reset({ ...getValues(), ...updatedData });
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []); // runs once on mount

  const isValidData = (obj, maxEmptyAllowed = 5) => {
    let emptyCount = 0;

    for (const key in obj) {
      // Skip *_prompt keys
      if (key.endsWith("_prompt")) continue;

      const value = obj[key];

      // Check empty text, empty array, null, undefined
      const isEmpty =
        value === "" ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) emptyCount++;
    }

    return emptyCount <= maxEmptyAllowed;
  };



  useEffect(() => {
    // ✅ Pusher client initialize
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'ap2'
    });

    const channel = pusher.subscribe('sse-channel');

    // ✅ Bind all events
    channel.bind_global((event, data) => {
      console.log("Pusher Event:", event, data);

      if (
        event === "upload_status" ||
        event === "transcription_status" ||
        event === "pipeline_status"
      ) {
        if (!processing) setProcessing(true);
        setStatus(data.step);
        dispatch(showToast({ message: "Processing...", severity: "info" }));
        if (data.progress) {
          setProgress(data.progress);
        } else {
          setProgress((prev) => Math.min(prev + 10, 90));
        }
      }

      if (event === "completed_audio" || event === "complete") {
        setStatus("✅ Done!");
        const extracted = (data.data?.extracted || data.extracted || {});
        const polished = (data.data?.polished || data.polished || "");

        if (isValidData(extracted) || extracted?.deliverables?.length > 0 || extracted?.quotation?.length > 0) {
          dispatch(setBusinessInfo(extracted));

          if (extracted.brand_name) dispatch(setBrandName(extracted.brand_name));
          if (extracted.project_brief) dispatch(setProjectBrief(extracted.project_brief));

          const generateId = () => crypto.randomUUID();

          if (extracted.deliverables?.length > 0) {
            const rows = extracted.deliverables.map((row) => ({
              id: generateId(),
              col1: row.item || "",
              col2: row.estimated_time || "",
            }));
            dispatch(addTable({ title: "Deliverables", T_ID: "123", rows }));
          }

          if (extracted.quotation?.length > 0) {
            const rows = extracted.quotation.map((row) => ({
              id: generateId(),
              col1: row.item || "",
              col2: row.quantity || 0,
              col3: row.estimated_cost_pkr || "",
            }));
            dispatch(addTable({ title: "Quotation", columnCount: 3, T_ID: "321", rows, type: "quotation" }));
          }

          setBadges((prev) => ({
            ...prev,
            polished: true,
            business: true,
            proposal: true,
            email: true,
            pdf: true,
          }));
        }

        if (polished) {
          dispatch(setPolishedTranscript(polished));
          setTranscript(polished);
        }

        setProgress(100);
        setProcessing(false);
      }

      if (event === "error") {
        setProcessing(false);
        setUploading(false);
        setStatus("❌ Error");
        dispatch(
          showToast({
            message: `⚠️ ${data.message || "An error occurred during processing"}`,
            severity: "error",
            duration: 6000,
          })
        );
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [processing, dispatch, formData]);
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUplaodFile(file);
    setUploading(true);
    setStatus("Preparing...");
    setProgress(0);
    setProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${import.meta.env.VITE_APP_BASE_URL}api/transcribe`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const keys = ["proposal", "live", "audio", "business", "email", "polished"];
    const key = keys[newValue];
    if (badges[key]) {
      setBadges((prev) => ({ ...prev, [key]: false }));
    }
  };

  const renderLabel = (label, key) => {
    return (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        {label}
        {badges[key] && (
          <Box
            sx={{
              position: "absolute",
              top: -4,
              right: -8,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#f44336",
              boxShadow: "0 0 0 2px white",
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{

        bgcolor: "#f4f6fa",
        minHeight: "100vh",
        width: { xs: "100vw", md: "100%" },
        position: { xs: "relative", md: "static" },
        left: { xs: "50%", md: "0" },
        right: { xs: "50%", md: "0" },
        marginLeft: { xs: "-50vw", md: 0 },
        marginRight: { xs: "-50vw", md: 0 },
      }}
    >
      <Grid spacing={4} sx={{ m: 0, width: "100%", p: 0 }}>
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              bgcolor: "white",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  // Scrollbar styling
                  "& .MuiTabs-scrollButtons": {
                    "&.Mui-disabled": { opacity: 0.3 }
                  },
                  "& .MuiTabs-scroller": {
                    // Show scrollbar on small screens
                    overflowX: { xs: "auto", md: "hidden" },
                    "&::-webkit-scrollbar": {
                      height: "6px",
                      display: { xs: "block", md: "none" }
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f1f1",
                      borderRadius: "10px"
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#667eea",
                      borderRadius: "10px",
                      "&:hover": {
                        background: "#764ba2"
                      }
                    }
                  },
                  "& .MuiTab-root": {
                    py: { xs: 1.5, md: 2 },
                    px: { xs: 2, md: 3 },
                    minHeight: { xs: "48px", md: "auto" },
                    fontWeight: 600,
                    fontSize: { xs: "0.85rem", md: "1rem" },
                    color: "#333",
                    textTransform: "none",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    boxShadow: "0 4px 12px rgba(102,126,234,0.08)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 24px rgba(102,126,234,0.15)",
                      background: "linear-gradient(135deg, #e0e7ff 0%, #c3cfe2 100%)",
                    },
                    "&.Mui-selected": {
                      color: "#fff",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 12px 32px rgba(102,126,234,0.4)",
                    },
                  },
                  "& .MuiTabs-indicator": {
                    height: 4,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              >
                <Tab label={renderLabel("📝 Proposal Form", "proposal")} />
                <Tab label={renderLabel("🎤 Live Transcription", "live")} />
                <Tab label={renderLabel("🎵 Audio Upload", "audio")} />
                <Tab label={renderLabel("🏢 Business Info", "business")} />
                <Tab label={renderLabel("📧 Email Preview", "email")} />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 2.5, sm: 3.5, md: 4 }, bgcolor: "white" }}>
              {tabValue === 0 && (
                <ProposalFormWithStepper
                  control={control}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  handleSubmit={handleSubmit}
                  handleSubmitForm={generatePdfActual}
                  inputRefs={inputRefs}
                  register={register}
                  processing={processing}
                  isLoading={isLoading}
                  formData={formData}
                  trigger={trigger}
                />
              )}
              {tabValue === 1 && (
                <Box sx={{ animation: "fadeIn 0.4s ease" }}>
                  <LiveSpeechToText
                    status={status}
                    loadingStatus={loadingStatus}
                    isRecording={isRecording}
                    isPaused={isPaused}
                    polished={fullTranscript}
                    liveTranscript={displayTranscript}
                    romanUrdu={romanUrdu}
                    englishTranscript={englishTranscript}
                    sttLanguage={sttLanguage}
                    setSttLanguage={setSttLanguage}
                    transcriptLength={transcriptWordLength}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    pauseRecording={pauseRecording}
                    resumeRecording={resumeRecording}
                    history={history}
                    historyEndRef={historyEndRef}
                    audioUrl={audioUrl}
                    audioFileName={audioFileName}
                    clearAudioUrl={() => {
                      if (audioUrl) URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }}
                  />
                </Box>
              )}

              {tabValue === 2 && (
                <Box sx={{ animation: "fadeIn 0.4s ease" }}>
                  <AudioToProposal
                    uploading={uploading}
                    progress={progress}
                    status={status}
                    transcript={transcript}
                    handleFileUpload={handleFileUpload}
                    file={uploadFile}
                  />
                </Box>
              )}

              {tabValue === 3 && (
                <Box sx={{ animation: "fadeIn 0.4s ease" }}>
                  <BusinessInfoSection fullTranscript={fullTranscript} />
                </Box>
              )}

              {tabValue === 4 && (
                <Box sx={{ animation: "fadeIn 0.4s ease" }}>
                  <EmailPreview formData={formData} />
                </Box>
              )}


            </Box>
          </Paper>
        </Grid>
      </Grid>

      <RecordingToast
        pauseRecording={pauseRecording}
        socketRef={socketRef}
        stopRecordingMF={stopRecording}
        resumeRecordingMF={resumeRecording}
      />
    </Box>
  );
}
