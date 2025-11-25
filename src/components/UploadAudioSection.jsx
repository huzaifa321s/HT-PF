import React, { useRef, useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Fade,
  Chip,
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  Mic as MicIcon,
  GraphicEq as GraphicEqIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const AudioToProposal = ({
  uploading,
  progress,
  status,
  transcript,
  handleFileUpload,
  file
}) => {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
const fileName = file?.name;
const fileSize = file?.size ? (file.size / (1024 * 1024)).toFixed(2) : null; 
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        handleFileUpload({ target: { files: [file] } });
      }
    }
  };

  return (
    <Paper
      elevation={isDragging ? 12 : 3}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        mb: 4,
        borderRadius: 5,
        background: isDragging
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isDragging ? '3px dashed #fff' : '3px solid transparent',
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
          animation: uploading ? 'shimmer 2s infinite' : 'none',
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        maxWidth: 700,
        mx: 'auto',
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
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
          <MicIcon sx={{ fontSize: 36, color: '#667eea' }} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            Audio to Business Proposal
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Transform your voice into professional documents
          </Typography>
        </Box>
      </Box>

      {/* Upload Area */}
      <Box
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? '#fff' : uploading ? '#667eea' : 'rgba(0,0,0,0.12)',
          borderRadius: 4,
          p: 4,
          textAlign: 'center',
          bgcolor: isDragging ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
          transition: 'all 0.3s ease',
          mb: 3,
        }}
      >
        {uploading ? (
          <Box>
            <GraphicEqIcon
              sx={{
                fontSize: 64,
                color: '#667eea',
                mb: 2,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.6, transform: 'scale(1.1)' },
                },
              }}
            />
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontWeight: 600 }}>
              Processing your audio...
            </Typography>
          </Box>
        ) : transcript ? (
          <Box>
            <CheckCircleIcon
              sx={{
                fontSize: 64,
                color: '#4caf50',
                mb: 2,
              }}
            />
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontWeight: 600 }}>
              Successfully processed!
            </Typography>
          </Box>
        ) : (
          <Box>
            <UploadFileIcon
              sx={{
                fontSize: 64,
                color: '#667eea',
                mb: 2,
                opacity: 0.8,
              }}
            />
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 1, fontWeight: 600 }}>
              {isDragging ? 'Drop your audio file here' : 'Upload or drag & drop'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Supported formats: MP3, WAV, M4A, OGG
            </Typography>
          </Box>
        )}

        <Tooltip title="Click to browse files or drag and drop" arrow>
          <Button
            variant="contained"
            component="label"
            disabled={uploading}
            size="large"
            sx={{
              py: 1.8,
              px: 5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
              },
              transition: 'all 0.3s ease',
            }}
            startIcon={<UploadFileIcon />}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {uploading ? 'Processing...' : transcript ? 'Upload Another' : 'Choose Audio File'}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="audio/*"
              onChange={handleFileUpload}
            />
          </Button>
        </Tooltip>
      </Box>


      {file && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: 'rgba(102,126,234,0.1)',
            border: '1px solid rgba(102,126,234,0.3)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
            File Name: <b>{fileName}</b> | Size: <b>{fileSize} MB</b>
          </Typography>
        </Box>
      )}

        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: 'rgba(255, 193, 7, 0.15)',
            border: '1px solid rgba(255, 193, 7, 0.4)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#b28900',
            }}
          >
            File size limit is <b>20 MB</b>.
          </Typography>
        </Box>
      

      {/* 🔥 Minimum Words Note */}
      {uploading && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: 'rgba(255, 235, 59, 0.15)',
            border: '1px solid rgba(255, 193, 7, 0.4)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#b28900',
            }}
          >
            Minimum transcription length is <b>100 words</b> for business details extraction.
          </Typography>
        </Box>
      )}

      {/* Progress Section */}
      {(uploading || progress > 0) && (
        <Fade in={true}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {status || 'Processing...'}
              </Typography>
              <Chip
                label={`${Math.round(progress)}%`}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: 'rgba(102, 126, 234, 0.15)',
                  color: '#667eea',
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'rgba(0,0,0,0.08)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)',
                },
              }}
            />
          </Box>
        </Fade>
      )}

      {/* Transcript Display */}
      {transcript && (
        <Fade in={true}>
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.9)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: '#667eea',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CheckCircleIcon sx={{ mr: 1, fontSize: 24 }} />
              Polished Transcript
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={transcript}
              variant="outlined"
              InputProps={{
                readOnly: true,
                sx: {
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  fontFamily: '"Inter", "Roboto", sans-serif',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fff',
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
          </Box>
        </Fade>
      )}

      {/* Loading Indicator */}
      {uploading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress
            size={40}
            thickness={4}
            sx={{
              color: '#667eea',
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default AudioToProposal;
