import { useRef, useState, useEffect } from "react";
import { Box } from "@mui/material";
import { io } from "socket.io-client";
import LiveSpeechToText from "../components/LiveSpeechToText";
import AudioToProposal from "../components/UploadAudioSection";
import BusinessInfoSection from "../components/BusinessInfoSection";

export default function TranscriptionPage() {
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const historyEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("Idle");
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [businessInfo, setBusinessInfo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Socket Setup
  useEffect(() => {
    socketRef.current = io(`${import.meta.env.VITE_APP_BASE_URL}`);

    socketRef.current.on("connect", () => {
      setStatus("connected");
    });

    socketRef.current.on("status", (data) => {
      if (typeof data === "string") {
        setStatus(data);
      } else if (data?.message) {
        setLoadingStatus(data.message);
      }
    });

    socketRef.current.on("raw_transcript", (data) => {
      const text = data?.text?.trim();
      if (!text) return;
      setHistory((prev) => [
        ...prev,
        {
          type: "raw",
          text,
          is_final: data.is_final,
          timestamp: Date.now(),
          id: `raw-${Date.now()}-${Math.random()}`,
        },
      ]);
    });

    socketRef.current.on("final_transcript", (data) => {
      const text = data?.text?.trim();
      if (!text) return;
      setHistory((prev) => [
        ...prev,
        {
          type: "final",
          text,
          is_final: true,
          timestamp: Date.now(),
          id: `final-${Date.now()}`,
        },
      ]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // SSE for file upload
  useEffect(() => {
    const evtSource = new EventSource(`${import.meta.env.VITE_APP_BASE_URL}/api/transcribe/sse`);

    evtSource.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);

      if (
        event === "upload_status" ||
        event === "transcription_status" ||
        event === "pipeline_status"
      ) {
        if (!processing) setProcessing(true);
        setStatus(data.step);
        setProgress((prev) => Math.min(prev + 10, 90));
      }

      if (event === "complete") {
        setStatus("✅ Done!");
        setProgress(100);
        setTranscript(data.data.polished);
        setBusinessInfo(data.data.extracted);
        setProcessing(false);
      }

      if (event === "error") {
        setStatus(`❌ ${data.message}`);
        setProcessing(false);
      }
    };

    return () => evtSource.close();
  }, [processing]);

  const startRecording = async () => {
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
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
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
    } catch (err) {
      alert("Mic error: " + err.message);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setLoadingStatus("");

    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (socketRef.current) socketRef.current.emit("stop_recording");
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus("Preparing...");
    setProgress(0);
    setProcessing(true);

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${import.meta.env.VITE_APP_BASE_URL}/api/transcribe`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1000px", mx: "auto" }}>
      <AudioToProposal
        uploading={uploading}
        progress={progress}
        status={status}
        transcript={transcript}
        handleFileUpload={handleFileUpload}
      />

      <LiveSpeechToText
        status={status}
        loadingStatus={loadingStatus}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        history={history}
        historyEndRef={historyEndRef}
      />

      <BusinessInfoSection businessInfo={businessInfo} />
    </Box>
  );
}