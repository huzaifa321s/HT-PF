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
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
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
              "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
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
          background: "rgba(255,255,255,0.9)",
          color: "transparent",
          py: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <AddIcon sx={{ fontSize: 24, color: "#667eea" }} />
        Add New Page
      </DialogTitle>

      <DialogContent sx={{ mt: 2, background: "rgba(255,255,255,0.7)" }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            color: "#667eea",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                      ? "2px solid #667eea"
                      : "1px solid rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                  background: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => handleSelect("BlankContentPage")}
              >
                <InsertDriveFileOutlinedIcon
                  sx={{
                    fontSize: 40,
                    color:
                      newPageType === "BlankContentPage"
                        ? "#667eea"
                        : "text.secondary",
                  }}
                />
                <Typography
                  sx={{
                    mt: 1,
                    fontWeight: 500,
                    color:
                      newPageType === "BlankContentPage"
                        ? "#667eea"
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
                    border: "1px dashed rgba(102, 126, 234, 0.3)",
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
                      ? "2px solid #667eea"
                      : "1px solid rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                  background: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => handleSelect("CustomContentPage")}
              >
                <DescriptionOutlinedIcon
                  sx={{
                    fontSize: 40,
                    color:
                      newPageType === "CustomContentPage"
                        ? "#667eea"
                        : "text.secondary",
                  }}
                />
                <Typography
                  sx={{
                    mt: 1,
                    fontWeight: 500,
                    color:
                      newPageType === "CustomContentPage"
                        ? "#667eea"
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
                    border: "1px dashed rgba(102, 126, 234, 0.3)",
                    borderRadius: 1,
                    background: "rgba(255,255,255,0.7)",
                  }}
                />
              </Paper>
            </Tooltip>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "rgba(102, 126, 234, 0.3)" }} />

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: "#667eea",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
              borderColor: "rgba(102, 126, 234, 0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#667eea",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#667eea",
            },
            background: "rgba(255,255,255,0.9)",
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
          background: "rgba(255,255,255,0.9)",
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
              borderColor: "#667eea",
              color: "#667eea",
              "&:hover": {
                borderColor: "#5568d3",
                color: "#5568d3",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
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