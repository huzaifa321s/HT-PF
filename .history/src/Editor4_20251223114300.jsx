// src/components/editors/PdfEditorPage.jsx
import React, { useState, useCallback } from "react";
import { showToast } from "../src/utils/toastSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Divider,
  TextField,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  RefreshOutlined,
  Add as AddIcon,
  Delete as DeleteIcon,
  Title,
  TextFields,
  FeaturedPlayList,
  GridView,
  CheckCircle,
  WarningAmber,
  AttachMoney, // Added for section header
} from "@mui/icons-material";

import {
  updatePageTitle,
  updateHeading,
  updateSubheading,
  addGridPackage,
  updateGridPackage,
  updateGridPackageItem,
  addItemToGridPackage,
  deleteItemFromGridPackage,
  deleteGridPackage,
  addElement,
  updateElementContent,
  updateStandalonePackage,
  updateStandalonePackageItem,
  addItemToStandalonePackage,
  deleteItemFromStandalonePackage,
  deleteElement,
  resetPageData,
  addMultipleItemsToGridPackage,
  addMultipleItemsToStandalonePackage,
} from "../src/utils/pricingReducer";

const PdfEditorPage = ({ mode }) => {
  const dispatch = useDispatch();
  const data =
    mode === "edit-doc"
      ? useSelector(
        (state) => state.pricing.edit || { elements: [], gridPackages: [] }
      )
      : useSelector(
        (state) => state.pricing.create || { elements: [], gridPackages: [] }
      );
  const [addAnchor, setAddAnchor] = useState(null);
  const [resetDialog, setResetDialog] = useState(false);

  const handleAddElement = useCallback(
    (type) => dispatch(addElement({ type })),
    [dispatch]
  );
  const handleAddGrid = useCallback(
    () => dispatch(addGridPackage()),
    [dispatch]
  );

  const handleResetConfirm = () => {
    dispatch(resetPageData());
    setResetDialog(false);
  };

  // Styles from ProposalFormwithStepper
  const colorScheme = {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#f44336",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
  };

  const cardStyle = {
    mb: 3,
    p: { xs: 0, sm: 3, md: 4 },
    background: "linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%)",
    border: "2px solid #e0e7ff",
    borderRadius: 3,
    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
  };

  const inputStyle = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      background: "#fff",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: colorScheme.primary,
        },
      },
    },
  };

  const sectionHeader = (icon, title) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 2 }}>
      <Box
        sx={{
          p: 1.5,
          mr: 2,
          background: colorScheme.gradient,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 20, color: "#fff" },
        })}
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background: colorScheme.gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        width: "100%",
        boxSizing: "border-box",
        bgcolor: "#fff",
      }}
    >
      <Card sx={cardStyle}>
        <CardContent>
          {sectionHeader(<AttachMoney />, "Pricing Page Editor")}
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            Design your pricing structure with full control — updates appear
            instantly in PDF preview
          </Typography>

          {/* Auto-save Info */}
          <Alert
            icon={<CheckCircle sx={{ color: "#4caf50" }} />}
            severity="success"
            sx={{
              borderRadius: 4,
              bgcolor: "rgba(76,175,80,0.1)",
              border: "1px solid rgba(76,175,80,0.3)",
              fontWeight: 600,
              mb: 4,
            }}
          >
            All changes are saved automatically and reflected instantly in your
            PDF preview.
          </Alert>

          {/* Top Action Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={() => setResetDialog(true)}
              sx={{
                borderRadius: 10,
                borderColor: colorScheme.primary,
                color: colorScheme.primary,
                fontWeight: 600,
                px: 3,
                py: 1.5,
                "&:hover": {
                  borderColor: colorScheme.secondary,
                  bgcolor: "rgba(102,126,234,0.1)",
                },
              }}
            >
              Reset All Content
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={(e) => setAddAnchor(e.currentTarget)}
              sx={{
                borderRadius: 10,
                px: 3,
                py: 1.5,
                fontWeight: 700,
                background: colorScheme.gradient,
                boxShadow: 6,
                "&:hover": {
                  background: colorScheme.hoverGradient,
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
                },
              }}
            >
              Add New Block
            </Button>
          </Stack>

          {/* Add Block Menu */}
          <Menu
            anchorEl={addAnchor}
            open={Boolean(addAnchor)}
            onClose={() => setAddAnchor(null)}
            PaperProps={{
              sx: {
                borderRadius: 4,
                mt: 1,
                boxShadow: "0 12px 32px rgba(102,126,234,0.25)",
                minWidth: 240,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleAddElement("mainHeading");
                setAddAnchor(null);
              }}
            >
              <Title sx={{ mr: 2, color: "#667eea" }} /> Heading Block
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleAddElement("text");
                setAddAnchor(null);
              }}
            >
              <TextFields sx={{ mr: 2, color: "#667eea" }} /> Text Block
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleAddElement("package");
                setAddAnchor(null);
              }}
            >
              <FeaturedPlayList sx={{ mr: 2, color: "#667eea" }} /> Standalone
              Package
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleAddGrid();
                setAddAnchor(null);
              }}
            >
              <GridView sx={{ mr: 2, color: "#667eea" }} /> Grid Package (2 per
              row)
            </MenuItem>
          </Menu>

          {/* Page Title & Headings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Page Header Settings
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Page Title"
                fullWidth
                value={data.pageTitle || ""}
                onChange={(e) => dispatch(updatePageTitle(e.target.value))}
                sx={inputStyle}
              />
              <TextField
                label="Main Heading"
                fullWidth
                value={data.heading || ""}
                onChange={(e) => dispatch(updateHeading(e.target.value))}
                sx={inputStyle}
              />
              <TextField
                label="Subheading"
                fullWidth
                multiline
                rows={3}
                value={data.subheading || ""}
                onChange={(e) => dispatch(updateSubheading(e.target.value))}
                sx={inputStyle}
              />
            </Stack>
          </Box>

          <Divider sx={{ my: 4 }}>
            <Chip
              label={`Total Blocks: ${(data.elements?.length || 0) + (data.gridPackages?.length || 0)
                }`}
              sx={{
                bgcolor: "rgba(102,126,234,0.15)",
                color: "#667eea",
                fontWeight: 700,
                fontSize: "1rem",
                height: 40,
              }}
            />
          </Divider>

          {/* Blocks List */}
          <Stack spacing={4}>
            {(!data.elements || data.elements.length === 0) &&
              (!data.gridPackages || data.gridPackages.length === 0) ? (
              <Box
                sx={{
                  p: 5,
                  textAlign: "center",
                  border: "2px dashed rgba(102,126,234,0.3)",
                  borderRadius: 5,
                  bgcolor: "rgba(102,126,234,0.02)",
                }}
              >
                <AddIcon
                  sx={{ fontSize: 80, color: "#667eea", opacity: 0.4, mb: 3 }}
                />
                <Typography
                  variant="h5"
                  color="text.secondary"
                  fontWeight={600}
                >
                  No content blocks yet
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1}>
                  Click "Add New Block" to start building your pricing page
                </Typography>
              </Box>
            ) : (
              <>
                {data.elements?.map((el) => (
                  <Card
                    key={el.id}
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #e0e7ff",
                      bgcolor: "#f8f9fa",
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      {el.type === "package" ? (
                        <MemoStandalonePackage el={el} colorScheme={colorScheme} inputStyle={inputStyle} />
                      ) : (
                        <MemoSimpleTextBlock el={el} inputStyle={inputStyle} />
                      )}
                    </CardContent>
                    <CardActions
                      sx={{
                        bgcolor: "rgba(102,126,234,0.03)",
                        justifyContent: "flex-end",
                        p: 2,
                      }}
                    >
                      <Tooltip title="Delete this block">
                        <IconButton
                          onClick={() =>
                            dispatch(deleteElement({ elementId: el.id }))
                          }
                          sx={{
                            bgcolor: "rgba(244,67,54,0.1)",
                            color: "#f44336",
                            "&:hover": { bgcolor: "rgba(244,67,54,0.2)" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                ))}

                {data.gridPackages?.map((pkg) => (
                  <Card
                    key={pkg.id}
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #e0e7ff",
                      bgcolor: "#f8f9fa",
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <MemoGridPackage pkg={pkg} colorScheme={colorScheme} inputStyle={inputStyle} />
                    </CardContent>
                    <CardActions
                      sx={{
                        bgcolor: "rgba(102,126,234,0.03)",
                        justifyContent: "flex-end",
                        p: 2,
                      }}
                    >
                      <Tooltip title="Delete grid package">
                        <IconButton
                          onClick={() =>
                            dispatch(deleteGridPackage({ pkgId: pkg.id }))
                          }
                          sx={{
                            bgcolor: "rgba(244,67,54,0.1)",
                            color: "#f44336",
                            "&:hover": { bgcolor: "rgba(244,67,54,0.2)" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                ))}
              </>
            )}
          </Stack>

          {/* Reset Confirmation Dialog */}
          <Dialog
            open={resetDialog}
            onClose={() => setResetDialog(false)}
            maxWidth="sm"
            fullWidth
            sx={{ borderRadius: 5 }}
          >
            <DialogTitle
              sx={{
                bgcolor: "#667eea",
                color: "white",
                py: 3,
                fontWeight: 700,
              }}
            >
              <Box display="flex" alignItems="center">
                <WarningAmber sx={{ mr: 1 }} />
                Reset Pricing Page?
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 4 }}>
              <Typography variant="h6" gutterBottom>
                This will permanently delete all content on this page.
              </Typography>
              <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>
                This action cannot be undone!
              </Alert>
              <Typography color="text.secondary">
                All headings, text blocks, packages, and pricing grids will be
                removed.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button
                onClick={() => setResetDialog(false)}
                size="large"
                sx={{ borderRadius: 10 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetConfirm}
                variant="contained"
                color="error"
                size="large"
                sx={{ px: 5, fontWeight: 700, borderRadius: 10 }}
              >
                Yes, Reset Everything
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

/* === Helper for Auto-detecting pasted features === */
const parsePastedFeatures = (e) => {
  const text = e.clipboardData.getData("text");
  if (!text) return null;

  // Split by lines
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length > 1 || (lines.length === 1 && (text.includes("•") || text.includes("*")))) {
    // If it's a single line but contains multiple bullets, split by bullets
    let itemsToProcess = lines;
    if (lines.length === 1 && (text.includes("•") || text.includes("*"))) {
      itemsToProcess = text.split(/[\u2022\*]/).map(t => t.trim()).filter(t => t.length > 0);
    }

    const cleanedFeatures = itemsToProcess.map(line => {
      return line
        .replace(/^\d+[\.\)]\s*/, "") // Remove "1. " or "1) "
        .replace(/^[\u2022\u25CF\u00B7\*\-\+]\s*/, "") // Remove bullets
        .trim();
    }).filter(line => line.length > 0);

    return cleanedFeatures.length > 0 ? cleanedFeatures : null;
  }
  return null;
};

/* === Reusable Memoized Blocks === */
const SimpleTextBlock = ({ el, inputStyle }) => {
  const dispatch = useDispatch();
  const onChange = useCallback(
    (e) =>
      dispatch(updateElementContent({ id: el.id, content: e.target.value })),
    [dispatch, el.id]
  );

  return (
    <TextField
      fullWidth
      multiline
      rows={el.type === "mainHeading" ? 2 : 5}
      label={el.type === "mainHeading" ? "Main Heading" : "Text Content"}
      value={el.content || ""}
      onChange={onChange}
      sx={inputStyle}
    />
  );
};
const MemoSimpleTextBlock = React.memo(SimpleTextBlock);

const StandalonePackage = ({ el, colorScheme, inputStyle }) => {
  const dispatch = useDispatch();
  const onField = useCallback(
    (field, value) =>
      dispatch(updateStandalonePackage({ id: el.id, field, value })),
    [dispatch, el.id]
  );
  const addFeature = useCallback(
    () => dispatch(addItemToStandalonePackage({ elementId: el.id })),
    [dispatch, el.id]
  );
  const deleteFeature = useCallback(
    (index) =>
      dispatch(deleteItemFromStandalonePackage({ elementId: el.id, index })),
    [dispatch, el.id]
  );
  const updateFeature = useCallback(
    (index, value) =>
      dispatch(updateStandalonePackageItem({ elementId: el.id, index, value })),
    [dispatch, el.id]
  );

  const [value, setValue] = useState("PKR");

  const handleChange = (event, newValue) => {
    if (newValue === null) return;
    else setValue(newValue);
    onField("currency", newValue);
  };
  return (
    <Stack spacing={3}>
      <TextField
        label="Package Title"
        fullWidth
        value={el.title || ""}
        onChange={(e) => onField("title", e.target.value)}
        sx={inputStyle}
      />
      <TextField
        label="Subtitle"
        fullWidth
        value={el.subtitle || ""}
        onChange={(e) => onField("subtitle", e.target.value)}
        sx={inputStyle}
      />
      <TextField
        label="Price"
        fullWidth
        value={el.price || ""}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          const formatted = raw ? Number(raw).toLocaleString("en-IN") : "";
          onField("price", formatted);
        }}
        placeholder="50000"
        sx={inputStyle}
      />
      <ToggleButtonGroup
        value={el.currency}
        exclusive
        onChange={handleChange}
        aria-label="Select currency"
        size="small"
        sx={{
          gap: 1,
          flexWrap: "wrap",
          "& .MuiToggleButton-root": {
            px: 2,
            py: 0.5,
            fontSize: "0.85rem",
            fontWeight: 700,
            border: "2px solid",
            borderColor: colorScheme.primary,
            borderRadius: 3,
            "&.Mui-selected": {
              background: colorScheme.gradient,
              color: "#fff",
              "&:hover": {
                background: colorScheme.hoverGradient,
              },
            },
            "&:hover": {
              background: `${colorScheme.primary}15`,
            },
          },
        }}
      >
        <Tooltip title="Pakistani Rupee (PKR)">
          <ToggleButton value="PKR" aria-label="PKR">
            PKR
          </ToggleButton>
        </Tooltip>

        <Tooltip title="US Dollar (USD)">
          <ToggleButton value="USD" aria-label="USD">
            USD
          </ToggleButton>
        </Tooltip>

        <Tooltip title="British Pound (GBP)">
          <ToggleButton value="GBP" aria-label="GBP">
            GBP
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Euro (EUR)">
          <ToggleButton value="EUR" aria-label="EUR">
            EUR
          </ToggleButton>
        </Tooltip>

        <Tooltip title="United Arab Emirates Dirham (AED)">
          <ToggleButton value="AED" aria-label="AED">
            AED
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Typography fontWeight={700} color="#667eea">
        Features
      </Typography>
      {(el.items || []).map((item, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            value={item}
            onChange={(e) => updateFeature(i, e.target.value)}
            onPaste={(e) => {
              const features = parsePastedFeatures(e);
              if (features) {
                e.preventDefault();
                const isGrid = !!pkg;
                if (isGrid) {
                  dispatch(addMultipleItemsToGridPackage({ pkgId: pkg.id, items: features }));
                } else {
                  dispatch(addMultipleItemsToStandalonePackage({ elementId: el.id, items: features }));
                }
                dispatch(showToast({ message: `${features.length} features detected and added!`, severity: "success" }));
              }
            }}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
          />
          <IconButton
            color="error"
            onClick={() => deleteFeature(i)}
            sx={{ bgcolor: "rgba(244,67,54,0.1)" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addFeature}
        sx={{ alignSelf: "flex-start", borderRadius: 10 }}
      >
        Add Feature
      </Button>
    </Stack>
  );
};
const MemoStandalonePackage = React.memo(StandalonePackage);

const GridPackage = ({ pkg, colorScheme, inputStyle }) => {
  const dispatch = useDispatch();
  const onField = useCallback(
    (field, value) => dispatch(updateGridPackage({ id: pkg.id, field, value })),
    [dispatch, pkg.id]
  );
  const addFeature = useCallback(
    () => dispatch(addItemToGridPackage({ pkgId: pkg.id })),
    [dispatch, pkg.id]
  );
  const deleteFeature = useCallback(
    (index) => dispatch(deleteItemFromGridPackage({ pkgId: pkg.id, index })),
    [dispatch, pkg.id]
  );
  const updateFeature = useCallback(
    (index, value) =>
      dispatch(updateGridPackageItem({ pkgId: pkg.id, index, value })),
    [dispatch, pkg.id]
  );

  return (
    <Stack spacing={3}>
      <TextField
        label="Package Title"
        fullWidth
        value={pkg.title || ""}
        onChange={(e) => onField("title", e.target.value)}
        sx={inputStyle}
      />
      <TextField
        label="Subtitle"
        fullWidth
        value={pkg.subtitle || ""}
        onChange={(e) => onField("subtitle", e.target.value)}
        sx={inputStyle}
      />
      <TextField
        label="Price"
        fullWidth
        value={pkg.price || ""}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          const formatted = raw ? Number(raw).toLocaleString("en-IN") : "";
          onField("price", formatted);
        }}
        placeholder="50000"
        sx={inputStyle}
      />
      <Typography fontWeight={700} color="#667eea">
        Features
      </Typography>
      {(pkg.items || []).map((item, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1 }}>
          <TextField
            size="small"
            fullWidth
            value={item}
            onChange={(e) => updateFeature(i, e.target.value)}
            onPaste={(e) => {
              const features = parsePastedFeatures(e);
              if (features) {
                e.preventDefault();
                const isGrid = !!pkg;
                if (isGrid) {
                  dispatch(addMultipleItemsToGridPackage({ pkgId: pkg.id, items: features }));
                } else {
                  dispatch(addMultipleItemsToStandalonePackage({ elementId: el.id, items: features }));
                }
                dispatch(showToast({ message: `${features.length} features detected and added!`, severity: "success" }));
              }
            }}
            sx={{ "& .MuiOutlinedInput-root": { bgcolor: "white" } }}
          />
          <IconButton
            color="error"
            onClick={() => deleteFeature(i)}
            sx={{ bgcolor: "rgba(244,67,54,0.1)" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addFeature}
        sx={{ alignSelf: "flex-start", borderRadius: 10 }}
      >
        Add Feature
      </Button>
    </Stack>
  );
};
const MemoGridPackage = React.memo(GridPackage);

export default PdfEditorPage;
