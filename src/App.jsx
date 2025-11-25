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
import PreviewConfirmDialog from "./components/modals/PDFViewDialog";
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

// import { usePrompt } from "./hooks/usePrompt";

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
  const hasRun = useRef(false);
  const [status, setStatus] = useState("Idle");
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { historyRT } = useSelector((state) => state.liveTranscription);
  const formDataRT = useSelector((state) => state.form);
  const formDataPT = useSelector((state) => state.proposal);

  const [formData, setFormData] = useState(formDataRT);
  const [audioUrl, setAudioUrl] = useState(null);
  const [customPlatform, setCustomPlatform] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [audioFileName, setAudioFileName] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      clientName: "",
      clientEmail: "",
      projectTitle: "",
      businessDescription: "",
      proposedSolution: "",
      developmentPlatforms: [],
      projectDuration: "",
      chargeAmount: "",
      advancePercent: "",
      additionalCosts: "",
      brandName: "",
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
      callOutcome: "",
      yourName: "",
      yourEmail: "",
      date: "",
    },
  });
  useEffect(() => {
    if (formDataPT) {
      reset(formDataPT); // 🔥 All fields synced in one line
    }
  }, [formDataPT, reset]);
  const watchedServices = watch("recommended_services");
  const watchedCharges = watch("serviceCharges");
  const [pdfUrl, setPdfUrl] = useState("");
  const [customPlatformOptions, setCustomPlatformOptions] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const platformGroups = {
    Marketing: ["SEO", "Content Writing", "Social Media", "Branding"],
    Development: ["Frontend", "Backend", "Full Stack", "Mobile Apps", "DevOps"],
    Services: ["UI/UX", "Cloud Services", "Consulting", "Maintenance"],
  };

  // === Socket Setup ===
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

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

    socketRef.current.on("raw_transcript", (data) => {
      setBadges((prev) => ({ ...prev, ["live"]: true }));
      const text = data?.text?.trim();
      if (!text) return;

      const entry = {
        type: "raw",
        text,
        is_final: data.is_final,
        timestamp: Date.now(),
        id: `raw-${Date.now()}-${Math.random()}`,
      };
      console.log("---------", data);

      dispatch(updateTranscription(entry));
      setHistory((prev) => [...prev, entry]);
      dispatch(addTranscriptEntry(entry));
    });

    socketRef.current.on("final_transcript", (data) => {
      const text = data?.text?.trim();
      if (!text) return;

      const entry = {
        type: "final",
        text,
        is_final: true,
        timestamp: Date.now(),
        id: `final-${Date.now()}`,
      };
      dispatch(updateTranscription(entry));
      setHistory((prev) => [...prev, entry]);
      dispatch(addTranscriptEntry(entry));
    });

    socketRef.current.on("finalized_transcript", (data) => {
      console.log("FULL FINAL TRANSCRIPT:", data);

      const extracted = data.extracted;
      dispatch(setBusinessInfo(extracted));
      // Update full transcript
      setFullTranscript(data.text);
      setBadges((prev) => ({ ...prev, ["live"]: false }));

      // Prepare updated form data conditionally
      const updatedFormData = {
        ...formData,
        ...(extracted.business_details && {
          businessDescription: extracted.business_details,
        }),
        ...(extracted.proposed_solution && {
          proposedSolution: extracted.proposed_solution,
        }),
        ...(extracted.recommended_services?.length > 0 && {
          recommended_services: extracted.recommended_services,
        }),
        ...(extracted.project_brief && {
          projectBrief: extracted.project_brief,
        }),
        ...(extracted.brand_name && { brandName: extracted.brand_name }),
        ...(extracted.brand_tagline && {
          brandTagline: extracted.brand_tagline,
        }),
        ...(extracted.business_type && {
          businessType: extracted.business_type,
        }),
        ...(extracted.industry_title && {
          industoryTitle: extracted.industry_title,
        }),
        ...(extracted.strategic_proposal?.length > 0 && {
          strategicProposal: extracted.strategic_proposal,
        }),
      };

      // Update polished transcript
      dispatch(setPolishedTranscript(data.text));
    });

    return () => {
      setBadges((prev) => ({ ...prev, ["live"]: false }));
      socketRef.current?.disconnect();
    };
  }, []);

  const pauseRecording = () => {
    if (!isRecording || isPaused) return;
    setIsPaused(true);
    setPauseTime(Date.now());
    dispatch(pauseRecordingWithToast(pauseRecording, socketRef));
    dispatch(
      showToast({ message: "⏸️ Recording paused", severity: "warning" })
    );
    console.log("Recording paused");

    socketRef.current?.emit("pause_recording");
  };

  const startRecording = async () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = floatTo16BitPCM(inputData);
        audioChunks.current.push(int16Data); // ← YEH LINE ADD KARO
        if (socketRef.current?.connected) {
          socketRef.current.emit("audio_chunk", int16Data);
        }
      };
      dispatch(
        showToast({ message: "🎙️ Recording Started", severity: "success" })
      );
      setIsRecording(true);
      setHistory([]);
      dispatch(
        showRecordingToast({
          transcription: "",
          status: "Listening...",
        })
      );
      setLoadingStatus("Ready for live transcription");
      console.log("Recording started");
    } catch (err) {
      alert("Mic error: " + err.message);
    }
  };

  const resumeRecording = () => {
    if (!isRecording || !isPaused) return;
    setIsPaused(false);
    dispatch(resumeRecordingRT());
    dispatch(showToast({ message: "▶️ Recording resumed", severity: "info" }));
    // Optional: notify backend
    socketRef.current?.emit("resume_recording");
  };
  const stopRecording = () => {
    setIsRecording(false);
    setLoadingStatus(""); // Clear loading
    dispatch(showToast({ message: " 🛑 Recording Stopped", severity: "info" }));
    dispatch(updateStatus("Recording Stopped"));
    dispatch(stopRecordingRT());
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());
    if (socketRef.current) socketRef.current.emit("stop_recording");
    if (audioChunks.current.length > 0) {
      const wavBlob = createWavFile(audioChunks.current, 16000);
      const url = URL.createObjectURL(wavBlob);
      const fileName = `call-recording-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.wav`;

      setAudioUrl(url);
      setAudioFileName(fileName);

      dispatch(
        showToast({
          message: "Audio ready! Download from below",
          severity: "success",
        })
      );
    } else {
      setAudioUrl(null);
    }

    audioChunks.current = [];
    // === END ===
  };

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function createWavFile(chunks, sampleRate = 16000) {
    const totalLength = chunks.reduce(
      (acc, chunk) => acc + chunk.byteLength,
      0
    );
    const buffer = new ArrayBuffer(44 + totalLength);
    const view = new DataView(buffer);

    // RIFF Header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + totalLength, true);
    writeString(view, 8, "WAVE");

    // fmt sub-chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample

    // data sub-chunk
    writeString(view, 36, "data");
    view.setUint32(40, totalLength, true);

    let offset = 44;
    for (const chunk of chunks) {
      for (let i = 0; i < chunk.byteLength; i++) {
        view.setUint8(offset++, chunk[i]);
      }
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  const floatTo16BitPCM = (float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  useEffect(() => {
    if (!hasRun.current) {
      setFormData(formDataRT);

      // Conditionally prepare values to reset
      const resetValues = {
        ...formDataRT,
        ...(formDataRT.businessDescription && {
          businessDescription: formDataRT.businessDescription,
        }),
        ...(formDataRT.proposedSolution && {
          proposedSolution: formDataRT.proposedSolution,
        }),
        ...(formDataRT.recommended_services?.length > 0 && {
          recommended_services: formDataRT.recommended_services,
        }),
        ...(formDataRT.projectBrief && {
          projectBrief: formDataRT.projectBrief,
        }),
        ...(formDataRT.brandName && { brandName: formDataRT.brandName }),
        ...(formDataRT.brandTagline && {
          brandTagline: formDataRT.brandTagline,
        }),
        ...(formDataRT.businessType && {
          businessType: formDataRT.businessType,
        }),
        ...(formDataRT.industoryTitle && {
          industoryTitle: formDataRT.industoryTitle,
        }),
        ...(formDataRT.strategicProposal?.length > 0 && {
          strategicProposal: formDataRT.strategicProposal,
        }),
      };

      reset(resetValues); // Reset only non-empty fields
      hasRun.current = true;
      setHistory(historyRT);
    } else {
      dispatch(clearTranscript());
    }
  }, [formDataRT, reset, historyRT]);

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

  // Scroll to PDF preview
  const scrollToPdf = () => {
    pdfRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHasViewedPdf(true);
    setOpenDialog(false);
  };

  // Continue generating PDF after user has viewed
  const continueGeneratePdf = () => {
    setHasViewedPdf(false);
    generatePdfActual(getValues());
  };

  const generatePdfActual = async (data, filename = "Proposal.pdf") => {
    setLoading(true);
    dispatch(setFormDataRT(data));
    setMode("prod");
    try {
      const res = await axiosInstance.post(
        "http://localhost:5000/api/proposals/create-proposal",
        data,
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

      const pdfPages = pdfRef.current?.querySelectorAll(".pdf-page");
      if (!pdfPages?.length) throw new Error("No .pdf-page found!");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pdfPages.length; i++) {
        const canvas = await html2canvas(pdfPages[i], {
          scale: 3,
          useCORS: true,
          backgroundColor: "#fff",
          scrollY: -window.scrollY,
        });
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        if (i > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          pageWidth,
          pageHeight,
          undefined,
          "FAST"
        );
      }

      const pdfBlob = pdf.output("blob");

      const formData = new FormData();
      formData.append("pdfFile", pdfBlob, filename);
      formData.append("proposalId", proposalId);

      const uploadRes = await axiosInstance.post(
        "http://localhost:5000/api/proposals/upload-pdf",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!uploadRes.data.success) throw new Error("PDF upload failed");

      const serverPdfUrl = `http://localhost:5000/${uploadRes.data.filePath}`;
      setPdfUrl(serverPdfUrl);

      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      dispatch(
        showToast({ message: "Proposal + PDF ready!", severity: "success" })
      );
      return serverPdfUrl;
    } catch (err) {
      console.error(err);
      dispatch(hideToast());
      dispatch(
        showToast({
          message: "PDF generation/upload failed",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
      setMode("dev");
    }
  };

  const handleCurrencyChange = (event, newCurrency) => {
    if (newCurrency !== null) {
      setCurrency(newCurrency);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customPlatform.trim();
    if (!trimmed) return;

    // Add to our custom list if not already
    if (!customPlatformOptions.includes(trimmed)) {
      setCustomPlatformOptions((prev) => [...prev, trimmed]);
    }

    // Add to form state
    const current = getValues("developmentPlatforms") || [];

    if (!current.includes(trimmed)) {
      const updated = [...current, trimmed];

      // RHF update
      setValue("developmentPlatforms", updated);

      // local state update
      setFormData((prev) => ({
        ...prev,
        developmentPlatforms: updated,
      }));

      // redux update
      dispatch(
        setFormDataRT({
          ...formData,
          developmentPlatforms: updated,
        })
      );
    }

    setCustomPlatform("");
  };

  const handleSubmitForm = async (data) => {
    console.log("data", data);

    // if (dontShowNext) {
    //   // Skip dialog if user opted out and generate PDF immediately
    //   await generatePdfActual(
    //     data,
    //     `${data.clientName || "proposal"}_proposal.pdf`
    //   );
    // } else {
    //   // Open confirmation/dialog for user
    //   setOpenDialog(true);
    // }
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

  useEffect(() => {
    const evtSource = new EventSource(
      "http://localhost:5000/api/transcribe/sse"
    );

    evtSource.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);
      console.log("SSE Event:", event, data);

      if (
        event === "upload_status" ||
        event === "transcription_status" ||
        event === "pipeline_status"
      ) {
        if (!processing) setProcessing(true);
        setStatus(data.step);
        dispatch(showToast({ message: data.step, severity: "info" }));
        setProgress((prev) => Math.min(prev + 10, 90));
      }
      if (event === "complete") {
        setStatus("✅ Done!");
        console.log("data.data", data.data);
        const extracted = data.data.extracted || {};
        dispatch(setBusinessInfo(extracted));
        // Show toast if transcription or extraction exists
        if (history.length > 0 || data.data.polished.length > 0) {
          dispatch(
            showToast({
              message: `✅ Transcription completed${
                extracted.business_details
                  ? " and business details extracted"
                  : ""
              } successfully!.`,
              severity: "success",
              duration: 4000,
            })
          );

          setBadges((prev) => ({
            ...prev,
            polished: true,
            business: !!extracted.business_details,
          }));

          if (event === "upload_status") {
            setBadges((prev) => ({ ...prev, audio: true }));
            setTimeout(
              () => setBadges((prev) => ({ ...prev, audio: false })),
              3000
            );
          }
        }

        // Set polished transcript
        dispatch(setPolishedTranscript(data.data.polished));
        setTranscript(data.data.polished);

        // Set progress
        setProgress(100);

        // Set business info

        // Prepare updated form data with conditional fields
        const updatedData = {
          ...formData,
          ...(extracted.business_details && {
            businessDescription: extracted.business_details,
          }),
          ...(extracted.proposed_solution && {
            proposedSolution: extracted.proposed_solution,
          }),
          ...(extracted.recommended_services?.length > 0 && {
            recommended_services: extracted.recommended_services,
          }),
          ...(extracted.project_brief && {
            projectBrief: extracted.project_brief,
          }),
          ...(extracted.brand_name && { brandName: extracted.brand_name }),
          ...(extracted.brand_tagline && {
            brandTagline: extracted.brand_tagline,
          }),
          ...(extracted.business_type && {
            businessType: extracted.business_type,
          }),
          ...(extracted.industry_title && {
            industoryTitle: extracted.industry_title,
          }),
          ...(extracted.strategic_proposal?.length > 0 && {
            strategicProposal: extracted.strategic_proposal,
          }),
        };

        // Set badges for proposal, email, pdf if brand name exists
        if (extracted.brand_name || extracted.project_brief) {
          setBadges((prev) => ({
            ...prev,
            proposal: true,
            email: true,
            pdf: true,
          }));
          if (extracted.brand_name)
            dispatch(setBrandName(extracted.brand_name));
          if (extracted.project_brief)
            dispatch(setProjectBrief(extracted.project_brief));
        }

        setProcessing(false);
      }

      if (event === "error") {
        setStatus(`❌ ${data.message}`);
        setProcessing(false);
      }
    };

    return () => evtSource.close();
  }, [processing]);

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

    await fetch("http://localhost:5000/api/transcribe", {
      method: "POST",
      body: formData,
    });

    setUploading(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Jab tab click ho to uska badge hata do
    const keys = ["proposal", "live", "audio", "email", "business", "polished"];
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
      p: { xs: 2, sm: 4 },
      bgcolor: "#f4f6fa",
      minHeight: "100vh",
      // Yeh add karo - sabse important
      width: "100vw",
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50vw",
      marginRight: "-50vw",
    }}
  >
    <Grid  spacing={4} sx={{ m: 0, width: "100%", p: 0 }}>
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
            <Box sx={{ borderBottom: "1px solid", borderColor: "divider" ,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    py: 2,
                    px: 3,
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#333",
                    textTransform: "none",
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    background:
                      "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                    boxShadow: "0 4px 12px rgba(102,126,234,0.08)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 24px rgba(102,126,234,0.15)",
                      background:
                        "linear-gradient(135deg, #e0e7ff 0%, #c3cfe2 100%)",
                    },
                    "&.Mui-selected": {
                      color: "#fff",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 12px 32px rgba(102,126,234,0.4)",
                    },
                  },
                  "& .MuiTabs-indicator": {
                    height: 4,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              >
                <Tab label={renderLabel("📝 Proposal Form", "proposal")} />
                <Tab label={renderLabel("🎤 Live Transcription", "live")} />
                <Tab label={renderLabel("🎵 Audio Upload", "audio")} />
                <Tab label={renderLabel("📧 Email Preview", "email")} />
                <Tab label={renderLabel("🏢 Business Info", "business")} />
                <Tab
                  label={renderLabel("🗒️ Polished Transcript", "polished")}
                />
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
                  handleSubmitForm={handleSubmitForm}
                  inputRefs={inputRefs}
                  processing={processing}
                  watchedServices={watchedServices}
                  watchedCharges={watchedCharges}
                  currency={currency}
                  handleCurrencyChange={handleCurrencyChange}
                  platformGroups={platformGroups}
                  customPlatformOptions={customPlatformOptions}
                  customPlatform={customPlatform}
                  setCustomPlatform={setCustomPlatform}
                  handleAddCustom={handleAddCustom}
                  dispatch={dispatch}
                  updateServiceLabelRT={updateServiceLabelRT}
                  updateServiceChargeRT={updateServiceChargeRT}
                  removeServiceRT={removeServiceRT}
                  addServiceRT={addServiceRT}
                  isLoading={isLoading}
                  formData={formData}
                  pdfRef={pdfRef}
                  mode={mode}
                  setMode={setMode}
                  showToast={showToast}
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
                  <EmailPreview formData={formData} />
                </Box>
              )}

              {tabValue === 4 && (
                <Box sx={{ animation: "fadeIn 0.4s ease" }}>
                  <BusinessInfoSection fullTranscript={fullTranscript} />
                </Box>
              )}

              {tabValue === 5 && (
                <Box sx={{ animation: "fadeIn 0.4s ease" }}>
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: 5,
                      p: { xs: 3, md: 5 },
                      minHeight: 350,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                      color: "text.primary",
                      gap: 3,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "6px",
                        background:
                          "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                        backgroundSize: "200% 100%",
                      },
                      maxWidth: 900,
                      mx: "auto",
                    }}
                  >
                    {fullTranscript?.trim().length > 0 ||
                    transcript.trim().length > 0 ||
                    transcriptRT.trim().length > 0 ? (
                      <Box
                        sx={{
                          width: "100%",
                          maxHeight: 500,
                          overflowY: "auto",
                          textAlign: "left",
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          fontSize: "1rem",
                          lineHeight: 1.8,
                          color: "text.primary",
                        }}
                      >
                        {/* Header */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 3,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(102, 126, 234, 0.15)",
                              borderRadius: "50%",
                              width: 56,
                              height: 56,
                              mr: 2,
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                            }}
                          >
                            <CheckCircleOutlineRounded
                              sx={{ fontSize: 32, color: "#667eea" }}
                            />
                          </Box>
                          <Typography
                            variant="h5"
                            fontWeight={800}
                            sx={{
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              letterSpacing: "-0.5px",
                            }}
                          >
                            Polished Transcript
                          </Typography>
                        </Box>

                        {/* Transcript Content */}
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: "rgba(255,255,255,0.9)",
                            border: "2px solid rgba(102, 126, 234, 0.15)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            "&::-webkit-scrollbar": {
                              width: "8px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "rgba(102, 126, 234, 0.3)",
                              borderRadius: "4px",
                            },
                          }}
                        >
                          <TranscriptDisplay
                            transcriptText={
                              fullTranscript || transcript || transcriptRT
                            }
                          />
                        </Box>
                      </Box>
                    ) : (
                      <>
                        {/* Empty State Header */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(102, 126, 234, 0.15)",
                              borderRadius: "50%",
                              width: 80,
                              height: 80,
                              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                            }}
                          >
                            <Mic sx={{ fontSize: 48, color: "#667eea" }} />
                          </Box>
                        </Box>

                        <Typography
                          variant="h4"
                          fontWeight={800}
                          sx={{
                            mb: 1,
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          Polished Transcript
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            maxWidth: 500,
                            mx: "auto",
                            color: "text.secondary",
                            fontSize: "1.05rem",
                            mb: 4,
                            lineHeight: 1.7,
                            fontWeight: 500,
                          }}
                        >
                          🎤 Once your live session or audio upload is complete,
                          your polished transcript will appear here.
                        </Typography>

                        {/* Action Buttons */}
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: 2,
                            mt: 2,
                          }}
                        >
                          <Button
                            variant="contained"
                            size="large"
                            onClick={() => setTabValue(1)}
                            sx={{
                              px: 5,
                              py: 1.8,
                              fontWeight: 700,
                              borderRadius: 3,
                              fontSize: "1.1rem",
                              textTransform: "none",
                              background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                                transform: "translateY(-2px)",
                                boxShadow:
                                  "0 12px 32px rgba(102, 126, 234, 0.5)",
                              },
                              transition: "all 0.3s ease",
                            }}
                            startIcon={<i className="fas fa-microphone" />}
                          >
                            Start Recording
                          </Button>

                          <Button
                            variant="outlined"
                            size="large"
                            onClick={() => setTabValue(2)}
                            sx={{
                              px: 5,
                              py: 1.8,
                              fontWeight: 700,
                              borderRadius: 3,
                              fontSize: "1.1rem",
                              textTransform: "none",
                              borderColor: "#667eea",
                              borderWidth: 2,
                              color: "#667eea",
                              bgcolor: "rgba(255,255,255,0.7)",
                              "&:hover": {
                                backgroundColor: "rgba(102, 126, 234, 0.1)",
                                borderColor: "#5568d3",
                                borderWidth: 2,
                                transform: "translateY(-2px)",
                                boxShadow:
                                  "0 8px 24px rgba(102, 126, 234, 0.3)",
                              },
                              transition: "all 0.3s ease",
                            }}
                            startIcon={<i className="fas fa-upload" />}
                          >
                            Upload Audio
                          </Button>
                        </Box>
                      </>
                    )}
                  </Paper>
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
      <PreviewConfirmDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onViewPDF={() => {
          scrollToPdf();
        }}
        onContinue={() => {
          setOpenDialog(false);
          generatePdfActual(getValues());
        }}
        dontShowNext={dontShowNext}
        setDontShowNext={setDontShowNext}
      />
    </Box>
  );
}
