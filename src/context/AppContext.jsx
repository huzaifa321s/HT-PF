import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    projectTitle: "React-Based E-Commerce Website",
    businessDescription: "",
    proposedSolution: "",
    developmentPlatforms: [],
    projectDuration: "6 weeks",
    chargeAmount: "800",
    advancePercent: "50",
    additionalCosts: "",
    brandName: "",
    proposedBy: "Humantek",
    projectBrief: "",
    businessType: "",
    industoryTitle: "", // Note: "industoryTitle" seems to be a typo; consider renaming to "industryTitle"
    strategicProposal: [],
    brandTagline: "",
    sweeterFashionPresence: "",
    selectedBDM: null,
    recommended_services: [],
    timelineMilestones:
      "Week 1: Design\nWeeks 2-3: Frontend\nWeeks 4-5: Backend\nWeek 6: Deploy & QA",
    terms: "Payments due within 7 days. 30 days post-launch support.",
    callOutcome: "Interested",
    yourName: "Your Name",
    yourEmail: "your.email@example.com",
    date: new Date().toLocaleDateString(),
    serviceCharges: [],
  });
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [businessInfo, setBusinessInfo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([
    "WordPress",
    "Shopify",
    "Webflow",
    "Wix",
    "Squarespace",
    "Joomla",
    "React",
    "Next.js",
    "Vue.js",
    "Laravel",
    "Node.js",
  ]);
  const [customPlatform, setCustomPlatform] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [options, setOptions] = useState([]);
  const [fetchingBD, setFetchingBDM] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef(null);
  const historyEndRef = useRef(null);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const pdfRef = useRef(null);
  const inputRefs = useRef([]);
  const TOTAL_INPUTS = 40;

  // Initialize inputRefs
  useEffect(() => {
    inputRefs.current = Array(TOTAL_INPUTS).fill(null);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        // Move to previous input
        const prev = inputRefs.current[index - 1];
        if (prev) {
          if (prev.focus) prev.focus();
          else prev.querySelector("input")?.focus();
        }
      } else {
        // Move to next input
        const next = inputRefs.current[index + 1];
        if (next) {
          if (next.focus) next.focus();
          else next.querySelector("input")?.focus();
        }
      }
    }
  };

  // Socket setup
  useEffect(() => {
    socketRef.current = io(`${import.meta.env.VITE_APP_BASE_URL}`, { transports: ["websocket"] });
    socketRef.current.on("connect", () => setStatus("connected"));
    socketRef.current.on("status", (data) => {
      if (typeof data === "string") setStatus(data);
      else if (data?.message) setLoadingStatus(data.message);
    });
    socketRef.current.on("raw_transcript", (data) => {
      const text = data?.text?.trim();
      if (!text) return;
      const entry = {
        type: "raw",
        text,
        is_final: data.is_final,
        timestamp: Date.now(),
        id: `raw-${Date.now()}-${Math.random()}`,
      };
      setHistory((prev) => [...prev, entry]);
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
      setHistory((prev) => [...prev, entry]);
    });
    socketRef.current.on("finalized_transcript", (data) => {
      setFormData((prev) => ({
        ...prev,
        businessDescription: data.extracted.business_details,
        proposedSolution: data.extracted.proposed_solution,
        recommended_services: data.extracted.recommended_services,
        projectBrief: data.extracted.project_brief,
        brandName: data.extracted.brand_name,
        brandTagline: data.extracted.brand_tagline,
        businessType: data.extracted.business_type,
        industoryTitle: data.extracted.industry_title,
        strategicProposal: data.extracted.strategic_proposal,
      }));
      setBusinessInfo(data.extracted);
    });
    return () => socketRef.current?.disconnect();
  }, []);

  // SSE setup
  useEffect(() => {
    const evtSource = new EventSource("http://localhost:5000/api/transcribe/sse");
    evtSource.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);
      if (event === "upload_status" || event === "transcription_status" || event === "pipeline_status") {
        if (!processing) setProcessing(true);
        setStatus(data.step);
        setProgress((prev) => Math.min(prev + 10, 90));
      }
      if (event === "complete") {
        setStatus("✅ Done!");
        setProgress(100);
        setTranscript(data.data.polished);
        setBusinessInfo(data.data.extracted);
        setFormData((prev) => ({
          ...prev,
          businessDescription: data.data.extracted.business_details,
          proposedSolution: data.extracted.proposed_solution,
          recommended_services: data.extracted.recommended_services,
          projectBrief: data.data.extracted.project_brief,
          brandName: data.extracted.brand_name,
          brandTagline: data.extracted.brand_tagline,
          businessType: data.extracted.business_type,
          industoryTitle: data.extracted.industry_title,
          strategicProposal: data.extracted.strategic_proposal,
        }));
        setProcessing(false);
      }
      if (event === "error") {
        setStatus(`❌ ${data.message}`);
        setProcessing(false);
        setSnackbar({ open: true, message: `Error: ${data.message}`, severity: "error" });
      }
    };
    evtSource.onerror = () => {
      setStatus("❌ Server error");
      setProcessing(false);
      setSnackbar({ open: true, message: "Server connection error", severity: "error" });
    };
    return () => evtSource.close();
  }, [processing]);

  // Fetch BDM
  useEffect(() => {
    async function fetchBDM() {
      try {
        setFetchingBDM(true);
        const res = await axiosInstance.get("http://localhost:5000/api/bdms/get");
        setOptions(res.data.data);
      } catch (err) {
        console.error("Error fetching BDM:", err);
        setSnackbar({ open: true, message: "Failed to fetch BDM data", severity: "error" });
      } finally {
        setFetchingBDM(false);
      }
    }
    fetchBDM();
  }, []);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("http://localhost:5000/api/get-creds");
        if (res.data && res.data.success) {
          setFormData((prev) => ({
            ...prev,
            yourName: res.data.data.name,
            yourEmail: res.data.data.email,
          }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setSnackbar({ open: true, message: "Failed to fetch profile data", severity: "error" });
      }
    };
    fetchProfile();
  }, []);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setStatus("Preparing...");
    setProgress(0);
    setProcessing(true);
    setSnackbar({ open: true, message: "Uploading audio...", severity: "info" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });
      setSnackbar({ open: true, message: "Audio uploaded successfully", severity: "success" });
    } catch (err) {
      console.error("Error uploading file:", err);
      setSnackbar({ open: true, message: "Failed to upload audio", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  // Recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(audioContext.destination);
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = floatTo16BitPCM(inputData);
        if (socketRef.current?.connected) {
          socketRef.current.emit("audio_chunk", int16Data);
        }
      };
      setIsRecording(true);
      setHistory([]);
      setLoadingStatus("catching words...");
      setSnackbar({ open: true, message: "Recording started", severity: "info" });
    } catch (err) {
      console.error("Mic error:", err);
      setSnackbar({ open: true, message: `Mic error: ${err.message}`, severity: "error" });
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setLoadingStatus("");
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (socketRef.current) socketRef.current.emit("stop_recording");
    setSnackbar({ open: true, message: "Recording stopped", severity: "info" });
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "developmentPlatforms" ? (typeof value === "string" ? value.split(",") : value) : value,
    }));
  };

  const handleSelectChange = (event) => {
    setFormData((prev) => ({ ...prev, developmentPlatforms: event.target.value }));
  };

  const handleAddCustom = () => {
    const trimmed = customPlatform.trim();
    if (!trimmed) return;
    if (!platformOptions.includes(trimmed)) {
      setPlatformOptions((prev) => [...prev, trimmed]);
    }
    if (!formData.developmentPlatforms.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, developmentPlatforms: [...prev.developmentPlatforms, trimmed] }));
    }
    setCustomPlatform("");
    setSnackbar({ open: true, message: `Added platform: ${trimmed}`, severity: "success" });
  };

  const handleCurrencyChange = (event, newCurrency) => {
    if (newCurrency !== null) setCurrency(newCurrency);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setProcessing(true);
    setSnackbar({ open: true, message: "Generating PDF...", severity: "info" });
    try {
      const res = await axiosInstance.post("http://localhost:5000/api/proposals/create-proposal", formData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.success) {
        setSnackbar({ open: true, message: "Proposal created successfully!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: "Failed to create proposal.", severity: "error" });
      }
    } catch (err) {
      console.error("Error creating proposal:", err);
      setSnackbar({ open: true, message: "Error generating PDF.", severity: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <AppContext.Provider
      value={{
        formData,
        setFormData,
        uploading,
        setUploading,
        processing,
        setProcessing,
        status,
        setStatus,
        progress,
        setProgress,
        transcript,
        setTranscript,
        businessInfo,
        setBusinessInfo,
        isRecording,
        setIsRecording,
        loadingStatus,
        setLoadingStatus,
        history,
        setHistory,
        platformOptions,
        setPlatformOptions,
        customPlatform,
        setCustomPlatform,
        currency,
        setCurrency,
        options,
        setOptions,
        fetchingBD,
        setFetchingBDM,
        snackbar,
        setSnackbar,
        fileInputRef,
        historyEndRef,
        socketRef,
        audioContextRef,
        processorRef,
        streamRef,
        pdfRef,
        inputRefs,
        handleFileUpload,
        startRecording,
        stopRecording,
        floatTo16BitPCM,
        handleChange,
        handleSelectChange,
        handleAddCustom,
        handleCurrencyChange,
        handleSubmit,
        handleCloseSnackbar,
        handleKeyDown,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);