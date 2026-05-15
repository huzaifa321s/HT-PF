"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  Select,
  MenuItem,
  Divider,
  Tooltip,
} from "@mui/material";
import { useDispatch } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

export default function AddPageDialog({
  addDialogOpen,
  setAddDialogOpen,
  newPageType,
  setNewPageType,
  insertAfter,
  setInsertAfter,
  pages,
  confirmAddPage,
}) {
  const handleSelect = (type) => {
    setNewPageType(type);
  };

  return (
    <Dialog
      open={addDialogOpen}
      onClose={() => setAddDialogOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          background: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
              "linear-gradient(90deg, #f3a833 0%, #f59e0b 50%, #fbbf24 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
          p: 0.5,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          textAlign: "center",
          background: "rgba(20, 20, 20, 0.8)",
          color: "transparent",
          py: 2,
          background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <AddIcon sx={{ fontSize: 24, color: "#f3a833" }} />
        Add New Page
      </DialogTitle>

      <DialogContent sx={{ mt: 2, background: "rgba(255,255,255,0.7)" }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            color: "#f3a833",
            background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Select Page Type:
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Tooltip title="Add a blank page" arrow>
              <Paper
                elevation={newPageType === "BlankContentPage" ? 6 : 1}
                sx={{
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 2,
                  border:
                    newPageType === "BlankContentPage"
                      ? "2px solid #f3a833"
                      : "1px solid rgba(243, 168, 51, 0.3)",
                  transition: "all 0.3s ease",
                  background: "rgba(20, 20, 20, 0.8)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.8)",
                  },
                }}
                onClick={() => handleSelect("BlankContentPage")}
              >
                <InsertDriveFileOutlinedIcon
                  sx={{
                    fontSize: 40,
                    color:
                      newPageType === "BlankContentPage"
                        ? "#f3a833"
                        : "text.secondary",
                  }}
                />
                <Typography
                  sx={{
                    mt: 1,
                    fontWeight: 500,
                    color:
                      newPageType === "BlankContentPage"
                        ? "#f3a833"
                        : "text.primary",
                  }}
                >
                  Blank Page
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 90,
                    mt: 1,
                    border: "1px dashed rgba(243, 168, 51, 0.3)",
                    borderRadius: 1,
                    background: "rgba(255,255,255,0.7)",
                  }}
                />
              </Paper>
            </Tooltip>
          </Grid>

          <Grid item xs={6}>
            <Tooltip title="Add an empty text template" arrow>
              <Paper
                elevation={newPageType === "CustomContentPage" ? 6 : 1}
                sx={{
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 2,
                  border:
                    newPageType === "CustomContentPage"
                      ? "2px solid #f3a833"
                      : "1px solid rgba(243, 168, 51, 0.3)",
                  transition: "all 0.3s ease",
                  background: "rgba(20, 20, 20, 0.8)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.8)",
                  },
                }}
                onClick={() => handleSelect("CustomContentPage")}
              >
                <DescriptionOutlinedIcon
                  sx={{
                    fontSize: 40,
                    color:
                      newPageType === "CustomContentPage"
                        ? "#f3a833"
                        : "text.secondary",
                  }}
                />
                <Typography
                  sx={{
                    mt: 1,
                    fontWeight: 500,
                    color:
                      newPageType === "CustomContentPage"
                        ? "#f3a833"
                        : "text.primary",
                  }}
                >
                  Empty Text Template
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 90,
                    mt: 1,
                    border: "1px dashed rgba(243, 168, 51, 0.3)",
                    borderRadius: 1,
                    background: "rgba(255,255,255,0.7)",
                  }}
                />
              </Paper>
            </Tooltip>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "rgba(243, 168, 51, 0.3)" }} />

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: "#f3a833",
            background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Insert After:
        </Typography>
        <Select
          fullWidth
          size="small"
          value={insertAfter}
          onChange={(e) => setInsertAfter(Number(e.target.value))}
          sx={{
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(243, 168, 51, 0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f3a833",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f3a833",
            },
            background: "rgba(20, 20, 20, 0.8)",
          }}
        >
          {pages.slice(0, -1).map((_, i) => (
            <MenuItem key={i} value={i}>
              After Page {i + 1}
            </MenuItem>
          ))}
          <MenuItem value={pages.length}>At the end</MenuItem>
        </Select>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          pb: 2,
          gap: 1,
          background: "rgba(20, 20, 20, 0.8)",
        }}
      >
        <Tooltip title="Cancel adding a new page" arrow>
          <Button
            onClick={() => setAddDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 3,
              fontSize: "1rem",
              fontWeight: 600,
              borderColor: "#f3a833",
              color: "#f3a833",
              "&:hover": {
                borderColor: "#eab308",
                color: "#eab308",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(243, 168, 51, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Cancel
          </Button>
        </Tooltip>
        <Tooltip title="Confirm adding the new page" arrow>
          <Button
            onClick={confirmAddPage}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              fontSize: "1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #f3a833 0%, #f59e0b 100%)",
              boxShadow: "0 8px 24px rgba(243, 168, 51, 0.4)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #eab308 0%, #d97706 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 32px rgba(243, 168, 51, 0.5)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Add Page
          </Button>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}