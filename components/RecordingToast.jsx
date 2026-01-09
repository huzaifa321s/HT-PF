import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Snackbar,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Slide,
  Tooltip,
} from "@mui/material";
import {
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
} from "@mui/icons-material";
import {
  pauseRecordingWithToast,
  resumeRecordingRT,
  stopRecordingRT,
  toggleMinimize,
} from "../utils/recordingToastSlice";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

export default function RecordingToast({
  pauseRecording,
  socketRef,
  stopRecordingMF,
  resumeRecordingMF,
}) {
  const dispatch = useDispatch();
  const {
    open,
    transcription,
    transcriptionHistory,
    status,
    isRecording,
    isPaused,
    isMinimized,
  } = useSelector((state) => state.recordingToast);

  const handlePauseResume = () => {
    if (isPaused) {
      dispatch(resumeRecordingRT());
      resumeRecordingMF();
    } else {
      dispatch(pauseRecordingWithToast(pauseRecording, socketRef));
    }
  };

  const handleStop = () => {
    dispatch(stopRecordingRT());
    stopRecordingMF();
  };

  const handleToggleMinimize = () => {
    dispatch(toggleMinimize());
  };

  return (
    <>
      {open && isMinimized && (
        <Box
          sx={{
            position: "fixed",
            top: 20,
            right: 16,
            zIndex: 1300,
            marginTop: 10,
          }}
        >
          <Tooltip title="Show recording controls" arrow>
            <Button
              variant="contained"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
                },
                transition: "all 0.3s ease",
              }}
              startIcon={<ShowIcon />}
              onClick={handleToggleMinimize}
            >
              Show Recording
            </Button>
          </Tooltip>
        </Box>
      )}

      <Snackbar
        open={open && !isMinimized}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ maxWidth: 400, marginTop: 10 }}
      >
        <Box
          sx={{
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            color: "#1e1e1e",
            borderRadius: 5,
            padding: 2,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transformOrigin: "top right",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
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
              animation: isRecording && !isPaused ? "shimmer 2s infinite" : "none",
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "-200% 0" },
              "100%": { backgroundPosition: "200% 0" },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress
              size={20}
              sx={{
                color: "#f44336",
                display: isRecording && !isPaused ? "block" : "none",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {isRecording && !isPaused ? "Recording..." : "Paused"}
            </Typography>
            <Tooltip title="Minimize recording controls" arrow>
              <IconButton
                onClick={handleToggleMinimize}
                sx={{
                  marginLeft: "auto",
                  color: "#667eea",
                  "&:hover": {
                    background: "rgba(102, 126, 234, 0.1)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <HideIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {transcriptionHistory.length > 0 && (
            <Box
              sx={{
                background: "rgba(255,255,255,0.7)",
                padding: 1,
                borderRadius: 2,
                maxHeight: 280,
                overflowY: "auto",
                border: "2px solid rgba(102, 126, 234, 0.3)",
                transition: "opacity 0.4s ease",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "#667eea",
                  display: "block",
                  mb: 0.5,
                }}
              >
                Previous Transcriptions:
              </Typography>
              {transcriptionHistory.map((text, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                >
                  {index + 1}. {text}
                </Typography>
              ))}
            </Box>
          )}

          <Box
            sx={{
              background: "rgba(255,255,255,0.9)",
              padding: 1,
              borderRadius: 2,
              minHeight: 50,
              maxHeight: 100,
              overflowY: "auto",
              border: "2px solid rgba(102, 126, 234, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: "1rem",
                lineHeight: 1.8,
                background:
                  transcription?.type === "final"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                WebkitBackgroundClip:
                  transcription?.type === "final" ? "text" : "none",
                WebkitTextFillColor:
                  transcription?.type === "final" ? "transparent" : "#1e1e1e",
                padding: 1,
                borderRadius: 1,
                transition: "background 0.3s ease, color 0.3s ease",
              }}
            >
              {transcription?.text
                ? transcription?.type === "final"
                  ? `Final Polished: ${transcription.text}`
                  : `${transcription.text}`
                : "No transcription yet..."}
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: isPaused ? "#ff9800" : "#4caf50",
              fontWeight: 700,
              background: "rgba(102, 126, 234, 0.15)",
              padding: "4px 8px",
              borderRadius: 1,
              textAlign: "center",
              fontSize: "0.9rem",
              transition: "all 0.3s ease",
            }}
          >
            Status: {status}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Tooltip title={isPaused ? "Resume recording" : "Pause recording"} arrow>
              <IconButton
                onClick={handlePauseResume}
                disabled={!isRecording}
                sx={{
                  background: "rgba(102, 126, 234, 0.15)",
                  color: "#667eea",
                  "&:hover": {
                    background: "rgba(102, 126, 234, 0.3)",
                    transform: "scale(1.1)",
                  },
                  "&:disabled": {
                    background: "rgba(0,0,0,0.08)",
                    color: "#999",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Stop recording" arrow>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                  boxShadow: "0 8px 24px rgba(244, 67, 54, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 32px rgba(244, 67, 54, 0.5)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #ccc 0%, #999 100%)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                  transition: "all 0.3s ease",
                }}
                startIcon={<StopIcon />}
                onClick={handleStop}
                disabled={!isRecording}
              >
                Stop
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Snackbar>
    </>
  );
}