import { Paper, Typography, Divider, Box, Avatar, Stack, Tooltip, Fade, Chip, TextField, IconButton } from "@mui/material";
import EmailTwoToneIcon from "@mui/icons-material/EmailTwoTone";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";
import { useState } from "react";
import { CheckCircle, ContentCopyOutlined, ContentCopySharp, Edit, Save } from "@mui/icons-material";

export default function EmailPreview({ formData }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(false);
  
  // Generate initial subject
  const generateSubject = () => {
    return `Your Proposal from ${formData.yourName || "Your Company"}`;
  };

  // Generate initial email body
  const generateInitialEmailBody = () => {
    const {
      clientName,
      businessDescription,
      proposedSolution,
      chargeAmount,
      projectDuration,
      yourName,
      projectTitle,
    } = formData;

    return `Dear ${clientName || "Client"},

Thank you for taking the time to discuss your needs with us. Based on our conversation about your business problem: "${
      businessDescription || "—"
    }", we're pleased to provide you with the following proposal.

📄 Project: ${projectTitle || "Untitled Project"}
💡 Solution Summary: ${
      proposedSolution || "Short description of proposed solution."
    }
⏱️ Estimated Duration: ${projectDuration || "—"}
💰 Estimated Cost: PKR ${chargeAmount || "—"}

Please review the attached proposal for details, timeline, and payment schedule. If you have any questions or would like to discuss any aspects of the proposal, please don't hesitate to contact us.

Best regards,  
${yourName || "Your Name"}`;
  };

  const [subject, setSubject] = useState(generateSubject());
  const [emailBody, setEmailBody] = useState(generateInitialEmailBody());
  
  const handleCopy = () => {
    const fullEmail = `Subject: ${subject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveSubject = () => {
    setIsEditingSubject(false);
  };

  const handleSaveBody = () => {
    setIsEditingBody(false);
  };

  return (
    <Paper
      elevation={isHovered ? 12 : 3}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        mb: 4,
        borderRadius: 5,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        textAlign: "start",
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          backgroundSize: '200% 100%',
        },
        maxWidth: 700,
        mx: 'auto',
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(102, 126, 234, 0.15)',
              borderRadius: '50%',
              width: 64,
              height: 64,
              mr: 2,
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            }}
          >
            <EmailTwoToneIcon sx={{ fontSize: 36, color: '#667eea' }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              Email Preview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Automatically generated message template
            </Typography>
          </Box>
        </Box>

        <Tooltip title={copied ? "Copied!" : "Copy Email"} arrow>
          <Box
            onClick={handleCopy}
            sx={{
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: copied ? 'rgba(76, 175, 80, 0.15)' : 'rgba(102, 126, 234, 0.15)',
              color: copied ? '#4caf50' : '#667eea',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: copied ? '0 4px 20px rgba(76, 175, 80, 0.3)' : '0 4px 20px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                bgcolor: copied ? 'rgba(76, 175, 80, 0.25)' : 'rgba(102, 126, 234, 0.25)',
                transform: 'translateY(-2px)',
                boxShadow: copied ? '0 8px 28px rgba(76, 175, 80, 0.4)' : '0 8px 28px rgba(102, 126, 234, 0.4)',
              },
            }}
          >
            {copied ? <CheckCircle sx={{ fontSize: 28 }} /> : <ContentCopyTwoToneIcon sx={{ fontSize: 28 }} />}
          </Box>
        </Tooltip>
      </Box>

      {/* Subject Line - Editable */}
      <Fade in={true}>
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            mb: 3,
            border: '2px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isEditingSubject ? (
              <TextField
                fullWidth
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                variant="standard"
                sx={{
                  '& .MuiInputBase-input': {
                    fontWeight: 700,
                    color: '#667eea',
                    fontSize: '1.1rem',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ fontWeight: 700, color: '#667eea', fontSize: '1.1rem', mr: 1 }}>
                      📧 Subject:
                    </Typography>
                  ),
                }}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{ 
                  fontWeight: 700, 
                  color: '#667eea',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                📧 Subject: {subject}
              </Typography>
            )}
            
            <Tooltip title={isEditingSubject ? "Save" : "Edit Subject"} arrow>
              <IconButton
                onClick={() => {
                  if (isEditingSubject) {
                    handleSaveSubject();
                  } else {
                    setIsEditingSubject(true);
                  }
                }}
                sx={{
                  ml: 2,
                  color: '#667eea',
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.2)',
                  },
                }}
              >
                {isEditingSubject ? <Save /> : <Edit />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      {/* Email Body - Editable */}
      <Fade in={true}>
        <Box
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.9)',
            border: '2px solid rgba(102, 126, 234, 0.15)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            fontFamily: '"Inter", "Roboto", sans-serif',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Tooltip title={isEditingBody ? "Save" : "Edit Email"} arrow>
              <IconButton
                onClick={() => {
                  if (isEditingBody) {
                    handleSaveBody();
                  } else {
                    setIsEditingBody(true);
                  }
                }}
                sx={{
                  color: '#667eea',
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.2)',
                  },
                }}
              >
                {isEditingBody ? <Save /> : <Edit />}
              </IconButton>
            </Tooltip>
          </Box>

          {isEditingBody ? (
            <TextField
              fullWidth
              multiline
              rows={18}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                  lineHeight: 1.9,
                  letterSpacing: '0.2px',
                  fontFamily: '"Inter", "Roboto", sans-serif',
                  '& fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />
          ) : (
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.primary',
                letterSpacing: '0.2px',
                whiteSpace: "pre-line",
                lineHeight: 1.9,
                fontSize: "1rem",
              }}
            >
              {emailBody}
            </Typography>
          )}
        </Box>
      </Fade>

      {/* Status Chip */}
      {copied && (
        <Fade in={copied}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Chip
              icon={<CheckCircle sx={{ fontSize: 20 }} />}
              label="Email copied to clipboard!"
              sx={{
                fontWeight: 700,
                bgcolor: 'rgba(76, 175, 80, 0.15)',
                color: '#4caf50',
                px: 2,
                py: 2.5,
                fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
              }}
            />
          </Box>
        </Fade>
      )}
    </Paper>
  );
}