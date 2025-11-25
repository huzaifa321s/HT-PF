// src/components/editors/PdfPageEditor2.jsx

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Divider,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Collapse,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add,
  Edit,
  Save,
  Delete,
  RefreshOutlined,
  WarningAmber,
  CheckCircle,
  FormatAlignLeft,
  Title,
  FormatListBulleted,
  FormatListNumbered,
  ArrowUpward,
  ArrowDownward,
  TableChart,
  AddCircleOutline,
} from "@mui/icons-material";

import {
  addSection,
  updateSection,
  deleteSection,
  moveSectionUp,
  moveSectionDown,
  resetPage2,
  addTable,
  addTableRow,
  updateTableRow,
  deleteTableRow,
  updateTableHeaders,
  deleteTable,
  updatePageHeader, // ← New action for header
} from "../src/utils/page2Slice"; // ← Apna correct path
import { showToast } from "../src/utils/toastSlice";

const PdfPageEditor2 = () => {
  const dispatch = useDispatch();

  // Redux State
  const sections = useSelector((state) => state.page2?.orderedSections || []);
  const tables = useSelector((state) => state.page2?.tables || []);
  const header = useSelector((state) => state.page2?.header || { pageTitle: "", heading: "", subheading: "" });

  // Local States
  const [tabValue, setTabValue] = useState(0);
  const [newSection, setNewSection] = useState({ type: "title", title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ type: "title", title: "", content: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  // Table editing
  const [editingRow, setEditingRow] = useState({ tableId: null, rowId: null });
  const [rowForm, setRowForm] = useState({ col1: "", col2: "" });
  const [editingHeaders, setEditingHeaders] = useState({});

  // === SECTION HANDLERS ===
  const handleAddSection = () => {
    const isPlainOrNumbered = ["plain", "numbered"].includes(newSection.type);
    if (!isPlainOrNumbered && !newSection.title.trim()) {
      dispatch(showToast({ message: "Title is required", severity: "warning" }));
      return;
    }
    if (!newSection.content.trim()) {
      dispatch(showToast({ message: "Content is required", severity: "warning" }));
      return;
    }

    dispatch(addSection({
      type: newSection.type,
      title: isPlainOrNumbered ? "" : newSection.title.trim(),
      content: newSection.content.trim(),
    }));

    setNewSection({ type: "title", title: "", content: "" });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    dispatch(showToast({ message: "Section added!", severity: "success" }));
  };

  const startEditSection = (sec) => {
    setEditingId(sec.id);
    setEditValues({ type: sec.type, title: sec.title || "", content: sec.content || "" });
  };

  const saveEditSection = () => {
    const isPlainOrNumbered = ["plain", "numbered"].includes(editValues.type);
    if (!isPlainOrNumbered && !editValues.title.trim()) return;
    if (!editValues.content.trim()) return;

    dispatch(updateSection({
      id: editingId,
      type: editValues.type,
      title: isPlainOrNumbered ? "" : editValues.title.trim(),
      content: editValues.content.trim(),
    }));
    setEditingId(null);
    dispatch(showToast({ message: "Section updated!", severity: "success" }));
  };

  const handleReset = () => {
    dispatch(resetPage2());
    setResetOpen(false);
    dispatch(showToast({ message: "All data reset!", severity: "success" }));
  };

  // === TABLE HANDLERS ===
  const handleAddTable = () => {
    dispatch(addTable());
    dispatch(showToast({ message: "New table added!", severity: "success" }));
  };

  const startEditRow = (tableId, row) => {
    setEditingRow({ tableId, rowId: row.id });
    setRowForm({ col1: row.col1, col2: row.col2 });
  };

  const saveEditRow = () => {
    if (!rowForm.col1.trim()) {
      dispatch(showToast({ message: "Item is required", severity: "warning" }));
      return;
    }
    dispatch(updateTableRow({
      tableId: editingRow.tableId,
      rowId: editingRow.rowId,
      col1: rowForm.col1.trim(),
      col2: rowForm.col2.trim(),
    }));
    setEditingRow({ tableId: null, rowId: null });
    setRowForm({ col1: "", col2: "" });
  };

  // === PREVIEW ===
  const renderLivePreview = (content, type) => {
    if (!content?.trim()) return <Typography color="text.secondary">Preview appears here...</Typography>;

    if (type === "numbered") {
      const blocks = content.split(/\n(?=\d+\.\s)/).filter(Boolean);
      return blocks.map((block, i) => {
        const lines = block.trim().split("\n");
        const main = lines[0].replace(/^\d+\.\s*/, "").trim();
        return (
          <Box key={i} sx={{ mb: 1.5 }}>
            <Typography fontWeight="bold">{i + 1}. {main}</Typography>
            {lines.slice(1).filter(Boolean).map((sub, j) => (
              <Typography key={j} sx={{ ml: 4, mt: 0.5 }}>• {sub.replace(/^[-•·]\s*/, "").trim()}</Typography>
            ))}
          </Box>
        );
      });
    }

    if (type === "bullets") {
      return content.split("\n").filter(Boolean).map((line, i) => (
        <Typography key={i}>• {line.trim()}</Typography>
      ));
    }

    return <Typography sx={{ whiteSpace: "pre-line" }}>{content}</Typography>;
  };

  const getTypeIcon = (type) => {
    const map = { plain: <FormatAlignLeft />, title: <Title />, bullets: <FormatListBulleted />, numbered: <FormatListNumbered /> };
    return map[type] || null;
  };

  const getTypeColor = (type) => {
    const colors = { plain: "#2196f3", title: "#9c27b0", bullets: "#4caf50", numbered: "#ff9800" };
    return colors[type] || "#666";
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: "1600px", mx: "auto" }}>
      {/* Premium Header */}
      <Paper elevation={12} sx={{ p: 5, mb: 5, borderRadius: 6, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
        <Typography variant="h3" fontWeight={900}>Page 3 Editor</Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
          Dynamic Sections + Unlimited Custom Tables (Item - Value)
        </Typography>
      </Paper>

      {/* Header Editor Card */}
      <Card elevation={10} sx={{ mb: 5, borderRadius: 5 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom color="#667eea">
            Page Header Settings
          </Typography>
          <Stack spacing={3}>
            <TextField
              label="Page Title"
              fullWidth
              value={header.pageTitle || ""}
              onChange={(e) => dispatch(updatePageHeader({ field: "pageTitle", value: e.target.value }))}
            />
            <TextField
              label="Main Heading"
              fullWidth
              value={header.heading || ""}
              onChange={(e) => dispatch(updatePageHeader({ field: "heading", value: e.target.value }))}
            />
            <TextField
              label="Subheading"
              fullWidth
              multiline
              rows={3}
              value={header.subheading || ""}
              onChange={(e) => dispatch(updatePageHeader({ field: "subheading", value: e.target.value }))}
            />
          </Stack>
        </CardContent>
      </Card>

      <Collapse in={showSuccess}>
        <Alert severity="success" sx={{ mb: 3 }}>Section added successfully!</Alert>
      </Collapse>

      {/* Tabs */}
      <Paper elevation={6} sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} centered>
          <Tab icon={<FormatAlignLeft />} label="Content Sections" />
          <Tab icon={<TableChart />} label={`Tables (${tables.length})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: Content Sections */}
      {tabValue === 0 && (
        <>
          <Card elevation={10} sx={{ mb: 5 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={800} gutterBottom>Add New Section</Typography>
              <Stack spacing={3} mt={3}>
                <FormControl fullWidth>
                  <InputLabel>Section Type</InputLabel>
                  <Select value={newSection.type} onChange={(e) => setNewSection({ ...newSection, type: e.target.value, title: "", content: "" })}>
                    <MenuItem value="title">Title + Paragraph</MenuItem>
                    <MenuItem value="bullets">Bullet Points</MenuItem>
                    <MenuItem value="numbered">Numbered List</MenuItem>
                    <MenuItem value="plain">Plain Text Only</MenuItem>
                  </Select>
                </FormControl>

                {newSection.type !== "plain" && newSection.type !== "numbered" && (
                  <TextField label="Section Title" value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} fullWidth />
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Content"
                      multiline
                      rows={12}
                      value={newSection.content}
                      onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                      fullWidth
                      placeholder={newSection.type === "numbered" ? "1. Design Phase\n• UI/UX\n• 5 Screens\n\n2. Development" : ""}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={4} sx={{ p: 3, bgcolor: "#f9f9f9", minHeight: 400 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">Live Preview</Typography>
                      {newSection.type === "title" && newSection.title && <Typography variant="h6" gutterBottom>{newSection.title}</Typography>}
                      {renderLivePreview(newSection.content, newSection.type)}
                    </Paper>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
            <CardActions sx={{ p: 4, bgcolor: "#f5f5ff", justifyContent: "space-between" }}>
              <Button variant="contained" size="large" startIcon={<Add />} onClick={handleAddSection}>
                Add Section
              </Button>
              <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={() => setResetOpen(true)}>
                Reset All
              </Button>
            </CardActions>
          </Card>

          <Divider sx={{ my: 6 }}>
            <Chip label={`${sections.length} Section(s)`} color="primary" />
          </Divider>

          <Stack spacing={4}>
            {sections.map((sec, idx) => (
              <Card key={sec.id} elevation={8}>
                <CardContent sx={{ p: 4 }}>
                  {editingId === sec.id ? (
                    <Stack spacing={3}>
                      <Select value={editValues.type} onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}>
                        <MenuItem value="title">Title + Text</MenuItem>
                        <MenuItem value="bullets">Bullets</MenuItem>
                        <MenuItem value="numbered">Numbered</MenuItem>
                        <MenuItem value="plain">Plain</MenuItem>
                      </Select>
                      {editValues.type !== "plain" && editValues.type !== "numbered" && (
                        <TextField label="Title" value={editValues.title} onChange={(e) => setEditValues({ ...editValues, title: e.target.value })} />
                      )}
                      <TextField multiline rows={8} label="Content" value={editValues.content} onChange={(e) => setEditValues({ ...editValues, content: e.target.value })} />
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button variant="contained" startIcon={<Save />} onClick={saveEditSection}>Save</Button>
                        <Button onClick={() => setEditingId(null)}>Cancel</Button>
                      </Box>
                    </Stack>
                  ) : (
                    <>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        {getTypeIcon(sec.type)}
                        <Chip label={sec.type.toUpperCase()} sx={{ bgcolor: getTypeColor(sec.type) + "22", color: getTypeColor(sec.type) }} />
                        {sec.title && <Typography variant="h6" fontWeight="bold">{sec.title}</Typography>}
                      </Box>
                      <Box sx={{ pl: 2, lineHeight: 1.8 }}>
                        {renderLivePreview(sec.content, sec.type)}
                      </Box>
                    </>
                  )}
                </CardContent>
                {editingId !== sec.id && (
                  <CardActions sx={{ justifyContent: "space-between", bgcolor: "#fafafa" }}>
                    <Box>
                      <IconButton disabled={idx === 0} onClick={() => dispatch(moveSectionUp(sec.id))}><ArrowUpward /></IconButton>
                      <IconButton disabled={idx === sections.length - 1} onClick={() => dispatch(moveSectionDown(sec.id))}><ArrowDownward /></IconButton>
                    </Box>
                    <Box>
                      <IconButton onClick={() => startEditSection(sec)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => dispatch(deleteSection(sec.id))}><Delete /></IconButton>
                    </Box>
                  </CardActions>
                )}
              </Card>
            ))}
          </Stack>
        </>
      )}

      {/* TAB 1: Unlimited Tables */}
      {tabValue === 1 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h5" fontWeight={800}>Custom Tables (Unlimited)</Typography>
            <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleAddTable}>
              Add New Table
            </Button>
          </Box>

          {tables.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: "center", border: "2px dashed #ccc", borderRadius: 5 }}>
              <TableChart sx={{ fontSize: 60, color: "#ccc", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No tables yet</Typography>
              <Typography color="text.secondary">Click "Add New Table" to start</Typography>
            </Paper>
          ) : (
            <Stack spacing={6}>
              {tables.map((table) => (
                <Card key={table.id} elevation={10} sx={{ borderRadius: 5 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Table: {table.headers.col1} - {table.headers.col2}
                      </Typography>
                      <Box>
                        <IconButton onClick={() => setEditingHeaders({ ...editingHeaders, [table.id]: true })}><Edit /></IconButton>
                        <IconButton color="error" onClick={() => dispatch(deleteTable(table.id))}><Delete /></IconButton>
                      </Box>
                    </Box>

                    {editingHeaders[table.id] && (
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={5}><TextField size="small" fullWidth label="Column 1" defaultValue={table.headers.col1} onChange={(e) => dispatch(updateTableHeaders({ tableId: table.id, col1: e.target.value }))} /></Grid>
                        <Grid item xs={5}><TextField size="small" fullWidth label="Column 2" defaultValue={table.headers.col2} onChange={(e) => dispatch(updateTableHeaders({ tableId: table.id, col2: e.target.value }))} /></Grid>
                        <Grid item xs={2}><Button size="small" variant="contained" onClick={() => setEditingHeaders({ ...editingHeaders, [table.id]: false })}>Done</Button></Grid>
                      </Grid>
                    )}

                    <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => dispatch(addTableRow(table.id))} sx={{ mb: 3 }}>
                      Add Row
                    </Button>

                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#000" }}>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>{table.headers.col1}</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>{table.headers.col2}</TableCell>
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {table.rows.map((row) => (
                            <TableRow key={row.id}>
                              {editingRow.tableId === table.id && editingRow.rowId === row.id ? (
                                <>
                                  <TableCell><TextField size="small" fullWidth value={rowForm.col1} onChange={(e) => setRowForm({ ...rowForm, col1: e.target.value })} /></TableCell>
                                  <TableCell><TextField size="small" fullWidth value={rowForm.col2} onChange={(e) => setRowForm({ ...rowForm, col2: e.target.value })} /></TableCell>
                                  <TableCell>
                                    <IconButton size="small" color="primary" onClick={saveEditRow}><Save /></IconButton>
                                    <IconButton size="small" onClick={() => setEditingRow({ tableId: null, rowId: null })}>Cancel</IconButton>
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell>{row.col1}</TableCell>
                                  <TableCell>{row.col2 || "-"}</TableCell>
                                  <TableCell>
                                    <IconButton size="small" onClick={() => startEditRow(table.id, row)}><Edit /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => dispatch(deleteTableRow({ tableId: table.id, rowId: row.id }))}><Delete /></IconButton>
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </>
      )}

      {/* Reset Dialog */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle sx={{ bgcolor: "#d32f2f", color: "white" }}>Reset All Data?</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning">This will delete all content permanently!</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReset}>Yes, Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPageEditor2;