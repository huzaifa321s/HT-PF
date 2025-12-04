// src/components/editors/PdfEditorPage.jsx
import React, { useState, useCallback } from "react";
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
} from "../src/utils/pricingReducer";

const PdfEditorPage = ({ mode }) => {
  const dispatch = useDispatch();
  const data = mode === 'edit-doc' ? useSelector(
    (state) => state.pricing.edit || { elements: [], gridPackages: [] }
  ) : useSelector(
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
  const formatNumber = (value) => {
    if (!value) return "";
    // Remove all non-digit characters
    const number = value.replace(/\D/g, "");
    if (!number) return "";
    return Number(number).toLocaleString("en-US"); // US style: 1,000,000
    // Ya Indian style chahiye to: toLocaleString("en-IN") → 10,00,000
  };
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: "100%", boxSizing: "border-box" }}>
      <Stack spacing={4}>
        {/* Premium Gradient Header */}
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 5,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              background: "linear-gradient(90deg, #f093fb 0%, #f5576c 100%)",
            },
          }}
        >
          <Typography variant="h4" fontWeight={900} gutterBottom>
            Pricing Page Editor
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
            Design your pricing structure with full control — updates appear
            instantly in PDF preview
          </Typography>
        </Paper>

        {/* Top Action Bar */}
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 5,
            background:
              "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
            border: "1px solid rgba(102,126,234,0.2)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={() => setResetDialog(true)}
              sx={{
                borderRadius: 4,
                border: "2px solid #667eea",
                color: "#667eea",
                fontWeight: 600,
                px: 2,
                py: 2,
                fontWeight: 700,
                fontSize: "0.7rem",
                "&:hover": {
                  borderColor: "#764ba2",
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
                borderRadius: 4,
                px: 2,
                py: 2,
                fontWeight: 700,
                fontSize: "0.7rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 25px rgba(102,126,234,0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 32px rgba(102,126,234,0.5)",
                },
              }}
            >
              Add New Block
            </Button>
          </Stack>
        </Paper>

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
        <Card
          elevation={6}
          sx={{
            borderRadius: 5,
            border: "1px solid rgba(102,126,234,0.15)",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              fontWeight={800}
              mb={3}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Page Header Settings
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Page Title"
                fullWidth
                value={data.pageTitle || ""}
                onChange={(e) => dispatch(updatePageTitle(e.target.value))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    bgcolor: "white",
                  },
                }}
              />
              <TextField
                label="Main Heading"
                fullWidth
                value={data.heading || ""}
                onChange={(e) => dispatch(updateHeading(e.target.value))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    bgcolor: "white",
                  },
                }}
              />
              <TextField
                label="Subheading"
                fullWidth
                multiline
                rows={3}
                value={data.subheading || ""}
                onChange={(e) => dispatch(updateSubheading(e.target.value))}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    bgcolor: "white",
                  },
                }}
              />
            </Stack>
          </CardContent>
        </Card>

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
            <Paper
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
              <Typography variant="h5" color="text.secondary" fontWeight={600}>
                No content blocks yet
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Click "Add New Block" to start building your pricing page
              </Typography>
            </Paper>
          ) : (
            <>
              {data.elements?.map((el) => (
                <Card
                  key={el.id}
                  elevation={8}
                  sx={{
                    borderRadius: 5,
                    border: "1px solid rgba(102,126,234,0.15)",
                    transition: "0.3s",
                    "&:hover": {
                      boxShadow: "0 16px 40px rgba(102,126,234,0.22)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    {el.type === "package" ? (
                      <MemoStandalonePackage el={el} />
                    ) : (
                      <MemoSimpleTextBlock el={el} />
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
                  elevation={8}
                  sx={{
                    borderRadius: 5,
                    border: "1px solid rgba(102,126,234,0.15)",
                    bgcolor: "rgba(102,126,234,0.02)",
                    transition: "0.3s",
                    "&:hover": {
                      boxShadow: "0 16px 40px rgba(102,126,234,0.22)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <MemoGridPackage pkg={pkg} />
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

        {/* Auto-save Info */}
        <Alert
          icon={<CheckCircle sx={{ color: "#4caf50" }} />}
          severity="success"
          sx={{
            borderRadius: 4,
            bgcolor: "rgba(76,175,80,0.1)",
            border: "1px solid rgba(76,175,80,0.3)",
            fontWeight: 600,
            py: 2,
          }}
        >
          All changes are saved automatically and reflected instantly in your
          PDF preview.
        </Alert>
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
          sx={{ bgcolor: "#667eea", color: "white", py: 3, fontWeight: 700 }}
        >
          <WarningAmber sx={{ mr: 1, verticalAlign: "middle" }} />
          Reset Pricing Page?
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
          <Button onClick={() => setResetDialog(false)} size="large" sx={{ borderRadius: 5 }}>
            Cancel
          </Button>
          <Button
            onClick={handleResetConfirm}
            variant="contained"
            color="error"
            size="large"
            sx={{ px: 5, fontWeight: 700, borderRadius: 5 }}
          >
            Yes, Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* === Reusable Memoized Blocks === */
const SimpleTextBlock = ({ el }) => {
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
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 4,
          bgcolor: "white",
          fontSize: "1.05rem",
        },
      }}
    />
  );
};
const MemoSimpleTextBlock = React.memo(SimpleTextBlock);

const StandalonePackage = ({ el }) => {
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
    // ToggleButtonGroup with exclusive selection returns null when clicking selected button.
    // We keep selection (don't allow clearing) — if you want to allow clearing, remove this guard.
    console.log('newVal', newValue)
    if (newValue === null) return;

    else setValue(newValue);
    onField("currency", newValue)
  };
  return (
    <Stack spacing={3}>
      <TextField
        label="Package Title"
        fullWidth
        value={el.title || ""}
        onChange={(e) => onField("title", e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" },
        }}
      />
      <TextField
        label="Subtitle"
        fullWidth
        value={el.subtitle || ""}
        onChange={(e) => onField("subtitle", e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" },
        }}
      />
      {/* <TextField label="Price" fullWidth value={el.price || ""} onChange={(e) => onField("price", e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" } }} /> */}
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
        sx={{ fontSize: 6 }}
      // InputProps hata do ya sirf number dikhao
      />
      <ToggleButtonGroup
        value={el.currency}
        exclusive
        onChange={handleChange}
        aria-label="Select currency"
        size="small"
        sx={{
          // keep group compact
          "& .MuiToggleButtonGroup-grouped": {
            margin: 0.5,
            borderRadius: 1.5,
          },
          // remove extra border around the group
          padding: 0.5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tooltip title="Pakistani Rupee (PKR)">
          <ToggleButton value="PKR" aria-label="PKR" >
            PKR
          </ToggleButton>
        </Tooltip>

        <Tooltip title="US Dollar (USD)">
          <ToggleButton value="USD" aria-label="USD" >
            USD
          </ToggleButton>
        </Tooltip>

        <Tooltip title="British Pound (GBP)">
          <ToggleButton value="GBP" aria-label="GBP" >
            GBP
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Euro (EUR)">
          <ToggleButton value="EUR" aria-label="EUR" >
            EUR
          </ToggleButton>
        </Tooltip>

        <Tooltip title="United Arab Emirates Dirham (AED)">
          <ToggleButton value="AED" aria-label="AED" >
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
        sx={{ alignSelf: "flex-start", borderRadius: 3 }}
      >
        Add Feature
      </Button>
    </Stack>
  );
};
const MemoStandalonePackage = React.memo(StandalonePackage);

const GridPackage = ({ pkg }) => {
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
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" },
        }}
      />
      <TextField
        label="Subtitle"
        fullWidth
        value={pkg.subtitle || ""}
        onChange={(e) => onField("subtitle", e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" },
        }}
      />
      {/* <TextField label="Price" fullWidth value={pkg.price || ""} onChange={(e) => onField("price", e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "white" } }} /> */}
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
        sx={{ fontSize: 6 }}
      // InputProps hata do ya sirf number dikhao
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
        sx={{ alignSelf: "flex-start", borderRadius: 3 }}
      >
        Add Feature
      </Button>
    </Stack>
  );
};
const MemoGridPackage = React.memo(GridPackage);

export default PdfEditorPage;
