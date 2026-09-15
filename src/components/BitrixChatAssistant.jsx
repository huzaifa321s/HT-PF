"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  IconButton,
  Alert,
  Fade,
} from "@mui/material";
import {
  AutoAwesome,
  Send,
  Lock,
  Person,
  Email,
  Title,
  Category,
  Description,
  Launch,
  RestartAlt,
  CheckCircle,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import axiosInstance from "../utils/axiosInstance";

const CATEGORIES = [
  "Web Development & E-Commerce",
  "Branding & Graphic Design",
  "Performance Marketing & Ads",
  "Mobile App Development",
  "SEO & Content Strategy",
  "Custom Strategy",
];

export default function BitrixChatAssistant() {
  const router = useRouter();

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1); // 1: Client Name, 2: Client Email, 3: Title, 4: Category, 5: Brief
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    projectTitle: "",
    category: "Web Development & E-Commerce",
    projectBrief: "",
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [createdProposalId, setCreatedProposalId] = useState(null);

  const briefInputRef = useRef(null);

  // Check if already logged in
  useEffect(() => {
    try {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(sessionStorage.getItem("user") || "null");
      if (token && user && user.id) {
        if (user.role === "agent" || user.role === "admin") {
          setCurrentUser(user);
        } else {
          setLoginError("Access Denied: Your account is not authorized to generate proposals.");
        }
      }
    } catch (_) {}
    setAuthLoading(false);
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setIsSubmittingLogin(true);
    setLoginError("");

    try {
      const res = await axiosInstance.post("/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      const { token, user } = res.data;
      if (!token || !user) throw new Error("Invalid response from server");

      if (user.role !== "agent" && user.role !== "admin") {
        setLoginError("Access Denied: Only authorized agents or admins can use the AI Assistant.");
        setIsSubmittingLogin(false);
        return;
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      setCurrentUser(user);
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError(err.response?.data?.message || err.message || "Invalid credentials");
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setCurrentUser(null);
    setCurrentStep(1);
    setCreatedProposalId(null);
  };

  // Generate Proposal
  const handleGenerate = async () => {
    if (!formData.projectBrief.trim()) {
      setGenerationError("Please enter a project brief before generating.");
      return;
    }

    setIsGenerating(true);
    setGenerationError("");

    try {
      const res = await axiosInstance.post("/api/bitrix/generate-chat-proposal", {
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim(),
        projectTitle: formData.projectTitle.trim(),
        category: formData.category,
        projectBrief: formData.projectBrief.trim(),
        companyName: "Humantek",
      });

      if (res.data?.success && res.data.proposalId) {
        setCreatedProposalId(res.data.proposalId);
      } else {
        throw new Error(res.data?.error || "Proposal generation failed.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setGenerationError(
        err.response?.data?.error || err.message || "Failed to generate proposal with AI."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const resetWizard = () => {
    setFormData({
      clientName: "",
      clientEmail: "",
      projectTitle: "",
      category: "Web Development & E-Commerce",
      projectBrief: "",
    });
    setCurrentStep(1);
    setCreatedProposalId(null);
    setGenerationError("");
  };

  if (authLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0a0a0a" }}>
        <CircularProgress sx={{ color: "#f3a833" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0a0a0a",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          borderBottom: "1px solid rgba(243, 168, 51, 0.2)",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AutoAwesome sx={{ color: "#f3a833", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              AI Proposal Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Bitrix24 Embedded Edition
            </Typography>
          </Box>
        </Box>

        {currentUser && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              icon={<Person sx={{ color: "#f3a833 !important" }} />}
              label={currentUser.name || currentUser.email}
              sx={{
                bgcolor: "rgba(243, 168, 51, 0.1)",
                color: "#f3a833",
                border: "1px solid rgba(243, 168, 51, 0.3)",
                fontWeight: 600,
              }}
            />
            <Button
              size="small"
              onClick={handleLogout}
              sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", fontSize: "0.8rem" }}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </Box>

      {/* ── CARD 1: LOGIN GATE (If not authenticated) ── */}
      {!currentUser ? (
        <Fade in>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: "480px",
              p: 4,
              borderRadius: "16px",
              bgcolor: "#141414",
              border: "1px solid rgba(243, 168, 51, 0.2)",
              textAlign: "center",
              mt: 4,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "rgba(243, 168, 51, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Lock sx={{ color: "#f3a833", fontSize: 28 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Agent Authentication
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
              Enter your Proposal Maker credentials to unlock the AI Proposal Assistant.
            </Typography>

            {loginError && (
              <Alert severity="error" sx={{ mb: 3, textAlign: "left", bgcolor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Proposal Maker Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@humantek.com"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.03)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                      "&:hover fieldset": { borderColor: "#f3a833" },
                      "&.Mui-focused fieldset": { borderColor: "#f3a833" },
                    },
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.03)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                      "&:hover fieldset": { borderColor: "#f3a833" },
                      "&.Mui-focused fieldset": { borderColor: "#f3a833" },
                    },
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmittingLogin}
                  sx={{
                    py: 1.5,
                    bgcolor: "#f3a833",
                    color: "#000",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "10px",
                    "&:hover": { bgcolor: "#e09320" },
                  }}
                >
                  {isSubmittingLogin ? <CircularProgress size={24} sx={{ color: "#000" }} /> : "Sign In & Continue"}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Fade>
      ) : createdProposalId ? (
        /* ── CARD 2: GENERATION SUCCESS CARD ── */
        <Fade in>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: "600px",
              p: 4,
              borderRadius: "16px",
              bgcolor: "#141414",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              textAlign: "center",
              mt: 2,
            }}
          >
            <CheckCircle sx={{ color: "#22c55e", fontSize: 60, mb: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
              Proposal Generated Successfully!
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
              Your proposal is ready in the Proposal Studio with complete Scope of Work, Deliverables, Timeline, and Pricing.
            </Typography>

            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.03)",
                p: 2.5,
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                mb: 3,
                textAlign: "left",
              }}
            >
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 0.5 }}>
                Client: <strong style={{ color: "#fff" }}>{formData.clientName}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 0.5 }}>
                Project: <strong style={{ color: "#fff" }}>{formData.projectTitle}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                Category: <strong style={{ color: "#f3a833" }}>{formData.category}</strong>
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                endIcon={<Launch />}
                onClick={() => router.push(`/proposal-studio/${createdProposalId}`)}
                sx={{
                  bgcolor: "#f3a833",
                  color: "#000",
                  fontWeight: 700,
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "#e09320" },
                }}
              >
                Open in Proposal Studio
              </Button>

              <Button
                variant="outlined"
                startIcon={<RestartAlt />}
                onClick={resetWizard}
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                  textTransform: "none",
                  borderRadius: "10px",
                }}
              >
                Create Another
              </Button>
            </Stack>
          </Paper>
        </Fade>
      ) : (
        /* ── CARD 3: GUIDED WIZARD FLOW ── */
        <Box sx={{ width: "100%", maxWidth: "720px" }}>
          {/* Steps Progress Indicator */}
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Box
                key={s}
                sx={{
                  flex: 1,
                  height: "4px",
                  borderRadius: "2px",
                  bgcolor: s <= currentStep ? "#f3a833" : "rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: "16px",
              bgcolor: "#141414",
              border: "1px solid rgba(243, 168, 51, 0.15)",
            }}
          >
            {/* ── STEP 1: CLIENT NAME ── */}
            {currentStep === 1 && (
              <Fade in>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Person sx={{ color: "#f3a833" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Step 1 of 5: Client / Company Name
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
                    Who is this proposal being prepared for?
                  </Typography>

                  <TextField
                    fullWidth
                    autoFocus
                    placeholder="e.g. Trendfumes, Acme Corp, or John Smith"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && formData.clientName.trim()) setCurrentStep(2);
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.03)",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                        "&:hover fieldset": { borderColor: "#f3a833" },
                        "&.Mui-focused fieldset": { borderColor: "#f3a833" },
                      },
                    }}
                  />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                    <Button
                      variant="contained"
                      disabled={!formData.clientName.trim()}
                      onClick={() => setCurrentStep(2)}
                      sx={{
                        bgcolor: "#f3a833",
                        color: "#000",
                        fontWeight: 700,
                        textTransform: "none",
                        px: 3,
                        borderRadius: "8px",
                        "&:hover": { bgcolor: "#e09320" },
                      }}
                    >
                      Next: Client Email →
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* ── STEP 2: CLIENT EMAIL ── */}
            {currentStep === 2 && (
              <Fade in>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Email sx={{ color: "#f3a833" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Step 2 of 5: Client Email Address
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
                    Enter client email for contact info (optional).
                  </Typography>

                  <TextField
                    fullWidth
                    autoFocus
                    placeholder="e.g. client@example.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setCurrentStep(3);
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.03)",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                        "&:hover fieldset": { borderColor: "#f3a833" },
                        "&.Mui-focused fieldset": { borderColor: "#f3a833" },
                      },
                    }}
                  />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                    <Button
                      onClick={() => setCurrentStep(1)}
                      sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}
                    >
                      ← Back
                    </Button>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setFormData({ ...formData, clientEmail: "" });
                          setCurrentStep(3);
                        }}
                        sx={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)", textTransform: "none" }}
                      >
                        Skip
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => setCurrentStep(3)}
                        sx={{
                          bgcolor: "#f3a833",
                          color: "#000",
                          fontWeight: 700,
                          textTransform: "none",
                          px: 3,
                          borderRadius: "8px",
                          "&:hover": { bgcolor: "#e09320" },
                        }}
                      >
                        Next: Project Title →
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* ── STEP 3: PROJECT TITLE ── */}
            {currentStep === 3 && (
              <Fade in>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Title sx={{ color: "#f3a833" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Step 3 of 5: Project Title
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
                    What is the headline for this proposal?
                  </Typography>

                  <TextField
                    fullWidth
                    autoFocus
                    placeholder="e.g. Next.js E-Commerce Platform, Digital Branding & Social Media Kit"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && formData.projectTitle.trim()) setCurrentStep(4);
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.03)",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                        "&:hover fieldset": { borderColor: "#f3a833" },
                        "&.Mui-focused fieldset": { borderColor: "#f3a833" },
                      },
                    }}
                  />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                    <Button onClick={() => setCurrentStep(2)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}>
                      ← Back
                    </Button>
                    <Button
                      variant="contained"
                      disabled={!formData.projectTitle.trim()}
                      onClick={() => setCurrentStep(4)}
                      sx={{
                        bgcolor: "#f3a833",
                        color: "#000",
                        fontWeight: 700,
                        textTransform: "none",
                        px: 3,
                        borderRadius: "8px",
                        "&:hover": { bgcolor: "#e09320" },
                      }}
                    >
                      Next: Category →
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* ── STEP 4: CATEGORY ── */}
            {currentStep === 4 && (
              <Fade in>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Category sx={{ color: "#f3a833" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Step 4 of 5: Select Category
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
                    This tunes the AI tone, deliverables, and scope templates.
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
                    {CATEGORIES.map((cat) => {
                      const isSelected = formData.category === cat;
                      return (
                        <Chip
                          key={cat}
                          label={cat}
                          onClick={() => setFormData({ ...formData, category: cat })}
                          sx={{
                            p: 2,
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            bgcolor: isSelected ? "rgba(243, 168, 51, 0.2)" : "rgba(255,255,255,0.05)",
                            color: isSelected ? "#f3a833" : "rgba(255,255,255,0.8)",
                            border: isSelected ? "1.5px solid #f3a833" : "1px solid rgba(255,255,255,0.1)",
                            "&:hover": { bgcolor: "rgba(243, 168, 51, 0.15)" },
                          }}
                        />
                      );
                    })}
                  </Stack>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                    <Button onClick={() => setCurrentStep(3)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}>
                      ← Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setCurrentStep(5)}
                      sx={{
                        bgcolor: "#f3a833",
                        color: "#000",
                        fontWeight: 700,
                        textTransform: "none",
                        px: 3,
                        borderRadius: "8px",
                        "&:hover": { bgcolor: "#e09320" },
                      }}
                    >
                      Next: Project Brief →
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* ── STEP 5: PROJECT BRIEF & GENERATE ── */}
            {currentStep === 5 && (
              <Fade in>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Description sx={{ color: "#f3a833" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Step 5 of 5: Project Brief
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}>
                    Paste the client requirements, notes, scope, target deliverables, or goals.
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    autoFocus
                    placeholder="Client is an emerging luxury lifestyle brand requiring a complete brand overhaul, including website redesign, product photography guidelines, social media management, and quarterly performance marketing campaigns..."
                    value={formData.projectBrief}
                    onChange={(e) => setFormData({ ...formData, projectBrief: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.03)",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                        "&:hover fieldset": { borderColor: "#f3a833" },
                        "&.Mui-focused fieldset": { borderColor: "#f3a833" },
                      },
                    }}
                  />

                  {generationError && (
                    <Alert severity="error" sx={{ mt: 2, bgcolor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                      {generationError}
                    </Alert>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                    <Button onClick={() => setCurrentStep(4)} sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none" }}>
                      ← Back
                    </Button>

                    <Button
                      variant="contained"
                      size="large"
                      disabled={isGenerating || !formData.projectBrief.trim()}
                      onClick={handleGenerate}
                      startIcon={isGenerating ? <CircularProgress size={20} sx={{ color: "#000" }} /> : <AutoAwesome />}
                      sx={{
                        bgcolor: "#f3a833",
                        color: "#000",
                        fontWeight: 700,
                        textTransform: "none",
                        px: 4,
                        py: 1.5,
                        borderRadius: "10px",
                        boxShadow: "0 4px 20px rgba(243, 168, 51, 0.4)",
                        "&:hover": { bgcolor: "#e09320" },
                      }}
                    >
                      {isGenerating ? "Crafting Proposal with AI..." : "Generate Proposal"}
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}
