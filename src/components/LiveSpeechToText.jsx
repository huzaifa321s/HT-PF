import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Stack,
  Fade,
  Chip,
  Tooltip,
  IconButton,
  Container,
  Zoom,
  Slide,
} from "@mui/material";
import {
  Clear,
  Download,
  Mic,
  Stop,
  Pause,
  PlayArrow,
  GraphicEq,
  CheckCircle,
  RadioButtonChecked,
  AutoAwesome,
} from "@mui/icons-material";

const LiveSpeechToText = ({
  status,
  loadingStatus,
  isRecording,
  isPaused,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  history,
  historyEndRef,
  pauseTime,
  audioUrl,
  audioFileName,
  clearAudioUrl,
  polished
}) => {
  return (
    <Fade in timeout={600}>
      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 3, md: 5 },
            px: { xs: 2, md: 3 },
            minHeight: "100vh",
          }}
        >
          {/* Header Section */}
          <Box textAlign="center" mb={5}>
            <Zoom in timeout={800}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                  mb: 3,
                }}
              >
                <Mic sx={{ fontSize: 40, color: "white" }} />
              </Box>
            </Zoom>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
                letterSpacing: -0.5,
              }}
            >
              Live Speech to Text
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto" }}
            >
              Real-time transcription with speaker identification and instant playback
            </Typography>
          </Box>
          

          {/* Status Card */}
          <Slide in direction="down" timeout={500}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                border: "1px solid rgba(255,255,255,0.5)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: status === "connected" ? "#4caf50" : "#f44336",
                      boxShadow: `0 0 12px ${
                        status === "connected" ? "#4caf50" : "#f44336"
                      }`,
                      animation: status === "connected" ? "pulse 2s infinite" : "none",
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.5 },
                      },
                    }}
                  />
                  <Typography variant="body1" fontWeight={600} color="text.primary">
                    Connection Status
                  </Typography>
                  <Chip
                    label={status?.toUpperCase() || "DISCONNECTED"}
                    size="small"
                    sx={{
                      bgcolor: status === "connected" ? "#4caf50" : "#f44336",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: 0.5,
                    }}
                  />
                </Stack>

                {loadingStatus && (
                  <Chip
                    icon={<RadioButtonChecked sx={{ fontSize: 16 }} />}
                    label={loadingStatus}
                    color="primary"
                    variant="filled"
                    sx={{
                      fontWeight: 600,
                      animation: "glow 1.5s ease-in-out infinite",
                      "@keyframes glow": {
                        "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
                        "50%": { opacity: 1, transform: "scale(1.02)" },
                      },
                    }}
                  />
                )}
              </Stack>
            </Paper>
          </Slide>

          {/* Recording Controls */}
          <Box textAlign="center" mb={4}>
            {isRecording ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Tooltip title="Stop Recording" arrow placement="top">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Stop />}
                    onClick={stopRecording}
                    sx={{
                      px: 5,
                      py: 1.8,
                      borderRadius: 50,
                      fontWeight: 700,
                      fontSize: "1rem",
                      textTransform: "none",
                      bgcolor: "#f44336",
                      boxShadow: "0 6px 20px rgba(244, 67, 54, 0.4)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "#d32f2f",
                        boxShadow: "0 8px 28px rgba(244, 67, 54, 0.6)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Stop Recording
                  </Button>
                </Tooltip>

                <Tooltip
                  title={isPaused ? "Resume Recording" : "Pause Recording"}
                  arrow
                  placement="top"
                >
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={isPaused ? <PlayArrow /> : <Pause />}
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    sx={{
                      px: 5,
                      py: 1.8,
                      borderRadius: 50,
                      fontWeight: 700,
                      fontSize: "1rem",
                      textTransform: "none",
                      borderWidth: 2,
                      color: isPaused ? "#4caf50" : "#ff9800",
                      borderColor: isPaused ? "#4caf50" : "#ff9800",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderWidth: 2,
                        borderColor: isPaused ? "#388e3c" : "#f57c00",
                        bgcolor: isPaused
                          ? "rgba(76, 175, 80, 0.08)"
                          : "rgba(255, 152, 0, 0.08)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                </Tooltip>
              </Stack>
            ) : (
              <Zoom in timeout={600}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Mic sx={{ fontSize: 28 }} />}
                  onClick={startRecording}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: "1.1rem",
                    borderRadius: 50,
                    fontWeight: 700,
                    textTransform: "none",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 32px rgba(102, 126, 234, 0.6)",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  Start Recording
                </Button>
              </Zoom>
            )}
{/* Polished Length Indicator - With Word Count Alert */}
{polished.length > 0 && (
  <Fade in={true}>
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        textAlign: 'center',
        animation: 'fadeIn 0.6s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        // Conditional Styling
        bgcolor: polished.trim().split(/\s+/).filter(Boolean).length < 100
          ? 'rgba(244, 67, 54, 0.12)'
          : 'rgba(102, 126, 234, 0.08)',
        border: polished.trim().split(/\s+/).filter(Boolean).length < 100
          ? '1px solid rgba(244, 67, 54, 0.3)'
          : '1px solid rgba(102, 126, 234, 0.2)',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: polished.trim().split(/\s+/).filter(Boolean).length < 100
            ? '#d32f2f'
            : '#667eea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
    {polished.trim().split(/\s+/).filter(Boolean).length < 100 ? (
  <>
    <span style={{ fontSize: 30 }}>Warning</span>
    Business details cannot be extracted — only {polished.trim().split(/\s+/).filter(Boolean).length} words provided.  
    (Minimum required: 100 words)
  </>
) : (
  <>
    <AutoAwesome sx={{ fontSize: 30, color: '#f093fb' }} />
    Final proposal ready for business details extraction • 
    {polished.length} characters ({polished.trim().split(/\s+/).filter(Boolean).length} words)
  </>
)}

      </Typography>
    </Box>
  </Fade>
)}
            {/* Audio Download Section */}
            {audioUrl && (
              <Fade in timeout={400}>
                <Box mt={3}>
                  <Paper
                    elevation={3}
                    sx={{
                      display: "inline-block",
                      p: 2.5,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                      border: "1px solid #81c784",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CheckCircle sx={{ color: "#4caf50", fontSize: 28 }} />
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        Recording Complete
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Download />}
                        href={audioUrl}
                        download={audioFileName}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Download
                      </Button>
                      <IconButton
                        onClick={clearAudioUrl}
                        size="small"
                        sx={{
                          bgcolor: "rgba(0,0,0,0.05)",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
                        }}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                </Box>
              </Fade>
            )}
          </Box>

          {/* Recording Status */}
          {isRecording && (
            <Fade in timeout={400}>
              <Box textAlign="center" mb={3}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "inline-block",
                    px: 3,
                    py: 1.5,
                    borderRadius: 50,
                    bgcolor: isPaused
                      ? "rgba(255, 152, 0, 0.1)"
                      : "rgba(76, 175, 80, 0.1)",
                    border: `2px solid ${isPaused ? "#ff9800" : "#4caf50"}`,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {isPaused ? (
                      <Pause sx={{ color: "#ff9800", fontSize: 20 }} />
                    ) : (
                      <GraphicEq
                        sx={{
                          color: "#4caf50",
                          fontSize: 20,
                          animation: "wave 1s ease-in-out infinite",
                          "@keyframes wave": {
                            "0%, 100%": { transform: "scaleY(1)" },
                            "50%": { transform: "scaleY(1.5)" },
                          },
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={isPaused ? "#ff9800" : "#4caf50"}
                    >
                      {isPaused
                        ? "Recording Paused"
                        : "Listening & Transcribing..."}
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            </Fade>
          )}

          {/* Transcription Window */}
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 4,
              minHeight: 450,
              maxHeight: 650,
              overflowY: "auto",
              background: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid #e0e0e0",
              position: "relative",
              "&::-webkit-scrollbar": {
                width: 8,
              },
              "&::-webkit-scrollbar-track": {
                bgcolor: "#f1f1f1",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#888",
                borderRadius: 4,
                "&:hover": {
                  bgcolor: "#555",
                },
              },
            }}
          >
            {history.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 400,
                }}
              >
                <Mic
                  sx={{
                    fontSize: 80,
                    color: "#bdbdbd",
                    mb: 2,
                    animation: "float 3s ease-in-out infinite",
                    "@keyframes float": {
                      "0%, 100%": { transform: "translateY(0)" },
                      "50%": { transform: "translateY(-10px)" },
                    },
                  }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  textAlign="center"
                  fontWeight={500}
                >
                  Ready to transcribe
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 1, maxWidth: 400 }}
                >
                  Press "Start Recording" and begin speaking. Your words will appear here in real-time.
                </Typography>
              </Box>
            ) : (
              <Box>
                {history.map((item, index) => {
                  const speakerMatch = item.text.match(/Speaker (\d+):/);
                  const speakerId = speakerMatch ? parseInt(speakerMatch[1]) : null;
                  const isLeft = speakerId === null || speakerId % 2 === 0;

                  return (
                    <Fade in timeout={300} key={item.id || index}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: isLeft ? "flex-start" : "flex-end",
                          mb: 2.5,
                          px: 1,
                        }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            maxWidth: "80%",
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor:
                              item.type === "finalized"
                                ? "#fff3e0"
                                : item.type === "final"
                                ? isLeft
                                  ? "#e3f2fd"
                                  : "#e8f5e9"
                                : isLeft
                                ? "#f5f5f5"
                                : "#eeeeee",
                            border:
                              item.type === "finalized"
                                ? "2px solid #ff9800"
                                : item.type === "final"
                                ? isLeft
                                  ? "2px solid #2196f3"
                                  : "2px solid #4caf50"
                                : "1px solid #e0e0e0",
                            position: "relative",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: 4,
                            },
                            "&::before": item.type === "finalized" || item.type === "final" ? {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              borderRadius: "3px 3px 0 0",
                              background:
                                item.type === "finalized"
                                  ? "linear-gradient(90deg, #ff9800 0%, #ffc107 100%)"
                                  : isLeft
                                  ? "linear-gradient(90deg, #2196f3 0%, #64b5f6 100%)"
                                  : "linear-gradient(90deg, #4caf50 0%, #81c784 100%)",
                            } : {},
                          }}
                        >
                          {speakerId !== null && (
                            <Box mb={1}>
                              <Chip
                                label={`Speaker ${speakerId}`}
                                size="small"
                                sx={{
                                  bgcolor: isLeft ? "#2196f3" : "#4caf50",
                                  color: "white",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  height: 22,
                                }}
                              />
                            </Box>
                          )}

                          <Stack direction="row" spacing={1} alignItems="baseline" mb={0.5}>
                            <Chip
                              label={
                                item.type === "finalized"
                                  ? "✓ FINALIZED"
                                  : item.type === "final"
                                  ? "✓ Final"
                                  : "Live"
                              }
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                bgcolor:
                                  item.type === "finalized"
                                    ? "#ff9800"
                                    : item.type === "final"
                                    ? "#4caf50"
                                    : "#9e9e9e",
                                color: "white",
                              }}
                            />
                          </Stack>

                          <Typography
                            variant="body1"
                            sx={{
                              lineHeight: 1.7,
                              color: "#212121",
                              fontSize:
                                item.type === "final" || item.type === "finalized"
                                  ? "1rem"
                                  : "0.9rem",
                            }}
                          >
                            {item.text.replace(/Speaker \d+:/g, "").trim()}
                            {item.is_final === false && (
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-block",
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: "#666",
                                  ml: 1,
                                  animation: "blink 1s infinite",
                                  "@keyframes blink": {
                                    "0%, 100%": { opacity: 1 },
                                    "50%": { opacity: 0 },
                                  },
                                }}
                              />
                            )}
                          </Typography>
                        </Paper>
                      </Box>
                    </Fade>
                  );
                })}
                <div ref={historyEndRef} />
              </Box>
            )}
          </Paper>

          {/* Footer */}
          <Box mt={4} textAlign="center">
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontStyle: "italic",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <CheckCircle sx={{ fontSize: 16, color: "#4caf50" }} />
              Complete conversation history with speaker identification
            </Typography>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
};

export default LiveSpeechToText;