// src/components/editors/PdfPageEditor2.jsx
import React, { useRef, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  ButtonGroup,
  Menu,
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
  TableChart,
  AddCircleOutline,
  ViewColumn,
  MoreVert,
} from "@mui/icons-material";
import {
  addSection,
  updateSection,
  deleteSection,
  resetPage2,
  addTable,
  addTableRow,
  updateTableRow,
  deleteTableRow,
  updateTableHeaders,
  deleteTable,
  addColumnToNumber,
  removeColumnToNumber,
} from "../src/utils/page2Slice";
import { showToast } from "../src/utils/toastSlice";

const PdfPageEditor2 = ({ mode }) => {
  const dispatch = useDispatch();

  const sections = useSelector((state) =>
    mode === "edit-doc"
      ? state.page2?.edit?.orderedSections || []
      : state.page2?.create?.orderedSections || []
  );
  const tables = useSelector((state) =>
    mode === "edit-doc"
      ? state.page2?.edit?.tables || []
      : state.page2?.create?.tables || []
  );

  const [tabValue, setTabValue] = useState(0);
  const [newSection, setNewSection] = useState({ type: "title", title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ type: "title", title: "", content: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const containerRef = useRef();

  // Table states
  const [editingRow, setEditingRow] = useState({ tableId: null, rowId: null });
  const [rowForm, setRowForm] = useState({ col1: "", col2: "", col3: "" });
  const [editingHeaders, setEditingHeaders] = useState({});
const formatNumberedContent = (content) => {
    if (!content) return "";

    const lines = content.split("\n");
    let formattedLines = [];
    let currentNumber = 1;

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Check if line starts with number (e.g., "1. ", "2. ", etc.)
      if (/^\d+\.\s/.test(trimmedLine)) {
        // Extract the number and text
        const match = trimmedLine.match(/^(\d+)\.\s*(.*)/);
        if (match) {
          formattedLines.push(`${currentNumber}. ${match[2]}`);
          currentNumber++;
        }
      }
      // Check if line is a bullet point
      else if (/^[•\-\*]\s/.test(trimmedLine)) {
        formattedLines.push(`  ${trimmedLine}`);
      }
      // Empty line
      else if (trimmedLine === "") {
        formattedLines.push("");
      }
      // Regular text
      else {
        formattedLines.push(trimmedLine);
      }
    });

    return formattedLines.join("\n");
  };


const getNextNumber = (content) => {
  if (!content || content.trim() === "") return 1;

  const lines = content.split("\n");
  const numbers = [];

  // Har line check karo for numbered items
  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Bullet points ya indented content ignore karo
    if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
      return;
    }
    
    // Match number at start of line: "7." or "7. text"
    const match = trimmed.match(/^(\d+)\.\s*/);
    if (match) {
      const num = parseInt(match[1], 10);
      numbers.push(num);
    }
  });

  // Highest number return karo
  const highest = numbers.length > 0 ? Math.max(...numbers) : 0;
  return highest + 1;
};
// Add Sub-bullet function (improved)
const addSubBullet = () => {
  const separator = editValues.content && !editValues.content.endsWith('\n') ? '\n' : '';
  
  setEditValues({
    ...editValues,
    content: editValues.content + separator + '• ',
  });
};
// ADD NEW NUMBER button handler
const handleAddNumber = () => {
  const nextNum = getNextNumber(content);
  
  // Check: last character dekho
  const trimmedContent = content.trimEnd();
  
  // Agar last me already ek number hai with no text, to usko replace karo
  const lastLineMatch = trimmedContent.match(/\n(\d+)\.\s*$/);
  
  if (lastLineMatch) {
    // Last empty number hai - replace karo
    const lastNum = parseInt(lastLineMatch[1], 10);
    if (lastNum === nextNum - 1) {
      // Duplicate prevent karo - sirf continue karo
      setContent(content + "\n" + nextNum + ". ");
      return;
    }
  }
  
  // Normal case: new number add karo
  const newContent = trimmedContent + "\n" + nextNum + ". ";
  setContent(newContent);
};


  // Add Section
  const handleAddSection = () => {
    const isPlain = newSection.type === "plain";
    if (!isPlain && !newSection.title.trim()) {
      dispatch(showToast({ message: "Title is required", severity: "warning" }));
      return;
    }
    if (!newSection.content.trim()) {
      dispatch(showToast({ message: "Content is required", severity: "warning" }));
      return;
    }

    dispatch(
      addSection({
        type: newSection.type,
        title: isPlain ? "" : newSection.title.trim(),
        content: newSection.content.trim(),
      })
    );

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
    const isPlain = editValues.type === "plain";
    if (!isPlain && !editValues.title.trim()) return;
    if (!editValues.content.trim()) return;

    dispatch(
      updateSection({
        id: editingId,
        type: editValues.type,
        title: isPlain ? "" : editValues.title.trim(),
        content: editValues.content.trim(),
      })
    );
    setEditingId(null);
    dispatch(showToast({ message: "Section updated!", severity: "success" }));
  };

  const handleReset = () => {
    dispatch(resetPage2());
    setResetOpen(false);
    dispatch(showToast({ message: "All data reset!", severity: "success" }));
  };

  const addBulletToEdit = () => {
    setEditValues({
      ...editValues,
      content: editValues.content + (editValues.content ? "\n" : "") + "• ",
    });
  };

const addNumberToEdit = () => {
  const content = editValues.content || "";
  const nextNumber = getNextNumber(content);
  
  // Add separator
  let separator = "";
  if (content) {
    if (!content.endsWith('\n')) {
      separator = '\n\n';
    } else if (!content.endsWith('\n\n')) {
      separator = '\n';
    }
  }
  
  setEditValues({
    ...editValues,
    content: content + separator + `${nextNumber}. `,
  });
};

  // === TABLE HANDLERS ===
  const handleAddTable = (columnCount = 2) => {
    dispatch(addTable({ columnCount }));
    dispatch(showToast({ message: `New ${columnCount}-column table added!`, severity: "success" }));
  };

  const startEditRow = (tableId, row, columnCount) => {
    setEditingRow({ tableId, rowId: row.id });
    setRowForm({
      col1: row.col1 || "",
      col2: row.col2 || "",
      col3: columnCount === 3 ? row.col3 || "" : "",
    });
  };

  const saveEditRow = () => {
    if (!rowForm.col1.trim()) {
      dispatch(showToast({ message: "First column is required", severity: "warning" }));
      return;
    }
    const table = tables.find((t) => t.id === editingRow.tableId);
    const payload = {
      tableId: editingRow.tableId,
      rowId: editingRow.rowId,
      col1: rowForm.col1.trim(),
      col2: rowForm.col2,
    };
    if (table.columnCount === 3) payload.col3 = rowForm.col3.trim();

    dispatch(updateTableRow(payload));
    setEditingRow({ tableId: null, rowId: null });
    setRowForm({ col1: "", col2: "", col3: "" });
  };

  const formatNumber = (value) => {
    if (!value) return "";
    const num = value.replace(/\D/g, "");
    return Number(num).toLocaleString("en-US");
  };

  const startEditHeaders = (tableId, headers, columnCount) => {
    setEditingHeaders({
      [tableId]: {
        col1: headers.col1,
        col2: headers.col2,
        col3: columnCount === 3 ? headers.col3 || "" : "",
      },
    });
  };

  const saveEditHeaders = (tableId, columnCount) => {
    const h = editingHeaders[tableId];
    if (!h?.col1?.trim() || !h?.col2?.trim()) {
      dispatch(showToast({ message: "Headers cannot be empty", severity: "warning" }));
      return;
    }
    const payload = { tableId, col1: h.col1.trim(), col2: h.col2.trim() };
    if (columnCount === 3) {
      if (!h.col3?.trim()) {
        dispatch(showToast({ message: "Header 3 cannot be empty", severity: "warning" }));
        return;
      }
      payload.col3 = h.col3.trim();
    }
    dispatch(updateTableHeaders(payload));
    setEditingHeaders({});
    dispatch(showToast({ message: "Headers updated!", severity: "success" }));
  };

  // === PERFECT NUMBERED LIST RENDERING (Add + Edit dono jagah) ===
const renderNumberedList = (content, title = "") => {
  if (!content?.trim()) return null;

  // SAME formatting logic as formatNumberedContent
  const lines = content.split("\n");
  let formattedBlocks = [];
  let currentBlock = null;
  let currentNumber = 1;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Main numbered item
    if (/^\d+\.\s/.test(trimmedLine)) {
      // Previous block save karo
      if (currentBlock) {
        formattedBlocks.push(currentBlock);
      }

      // New block start karo
      const match = trimmedLine.match(/^(\d+)\.\s*(.*)/);
      currentBlock = {
        number: currentNumber,
        text: match ? match[2] : "",
        bullets: []
      };
      currentNumber++;
    }
    // Bullet point
    else if (/^[•\-\*]\s/.test(trimmedLine)) {
      if (currentBlock) {
        const bulletText = trimmedLine.replace(/^[•\-\*]\s*/, "").trim();
        if (bulletText) {
          currentBlock.bullets.push(bulletText);
        }
      }
    }
    // Empty line ya regular text (ignore empty, include text)
    else if (trimmedLine && currentBlock) {
      // Agar numbered item ke baad direct text hai (no bullet)
      currentBlock.bullets.push(trimmedLine);
    }
  });

  // Last block add karo
  if (currentBlock) {
    formattedBlocks.push(currentBlock);
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
          {title}
        </Typography>
      )}
      {formattedBlocks.map((block, i) => (
        <Box key={i} sx={{ mb: 2 }}>
          {/* Main numbered item */}
          <Typography fontWeight="bold" gutterBottom>
            {block.number}. {block.text || "(No text)"}
          </Typography>

          {/* Bullets */}
          {block.bullets.length > 0 && (
            <Box sx={{ ml: 4 }}>
              {block.bullets.map((bullet, j) => (
                <Box
                  key={j}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    mt: 0.5
                  }}
                >
                  <Typography
                    sx={{
                      mr: 1,
                      fontSize: "0.9rem",
                      color: "text.secondary",
                      mt: 0.2
                    }}
                  >
                    •
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {bullet}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

  const [formatMenuAnchor, setFormatMenuAnchor] = useState({})
    const handleFormatMenuOpen = (event, tableId) => {
    setFormatMenuAnchor({ ...formatMenuAnchor, [tableId]: event.currentTarget })
  }

  const handleFormatMenuClose = (tableId) => {
    setFormatMenuAnchor({ ...formatMenuAnchor, [tableId]: null })
  }

    const toggleNumberFormat = (tableId, col) => {
    const table = tables.find((t) => t.id === tableId)
    if (table?.columnNo?.includes(col)) {
      dispatch(removeColumnToNumber({ id: tableId, col }))
    } else {
      dispatch(addColumnToNumber({ id: tableId, col }))
    }
    handleFormatMenuClose(tableId)
  }
  const renderLivePreview = (content, type, title = "") => {
    if (!content?.trim())
      return <Typography color="text.secondary">Preview appears here...</Typography>;

    if (type === "numbered") return renderNumberedList(content, title);

    if (type === "bullets") {
      return (
        <>
          {title && <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>{title}</Typography>}
          {content.split("\n").filter(Boolean).map((line, i) => {
            const clean = line.replace(/^[•·\-]\s*/, "").trim();
            return (
              <Typography key={i} sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <span style={{ marginRight: 8 }}>•</span>
                {clean}
              </Typography>
            );
          })}
        </>
      );
    }

    if (type === "title") {
      return (
        <>
          {title && <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>{title}</Typography>}
          <Typography>{content}</Typography>
        </>
      );
    }

    return <Typography>{content}</Typography>;
  };

  // Render section display with proper numbered list technique
 // Render section display with proper numbered list technique
  const renderSectionDisplay = (sec) => {
    if (sec.type === "numbered") {
      const blocks = sec.content.split(/\n(?=\d+\.\s)/).filter(Boolean);
      
      const cleanLine = (line) => line.replace(/^[-•·]\s*/, "").trim();

      return (
        <Box>
          {sec.title && <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>{sec.title}</Typography>}
          {blocks.map((block, i) => {
            const lines = block.trim().split("\n");
            const mainText = lines[0].replace(/^\d+\.\s*/, "").trim();
            const subLines = lines.slice(1);

            return (
              <Box key={i} sx={{ mb: 2 }}>
                <Typography fontWeight="bold" gutterBottom>
                  {i + 1}. {mainText || "(No text)"}
                </Typography>
                {subLines.length > 0 && (
                  <Box sx={{ ml: 4 }}>
                    {subLines.map((sub, j) => {
                      const cleanSub = cleanLine(sub);
                      if (!cleanSub) return null;
                      return (
                        <Box key={j} sx={{ display: "flex", alignItems: "flex-start", mt: 0.5 }}>
                          <Typography sx={{ mr: 1, fontSize: "0.9rem", color: "text.secondary", mt: 0.2 }}>•</Typography>
                          <Typography variant="body2" sx={{ flex: 1 }}>{cleanSub}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      );
    }

    // For other types, use the existing renderLivePreview
    return renderLivePreview(sec.content, sec.type, sec.title);
  };

  const getTypeIcon = (type) => {
    const map = {
      plain: <FormatAlignLeft />,
      title: <Title />,
      bullets: <FormatListBulleted />,
      numbered: <FormatListNumbered />,
    };
    return map[type] || <FormatAlignLeft />;
  };

  return (
    <Box p={3}>
      <Collapse in={showSuccess}>
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
          Section added successfully!
        </Alert>
      </Collapse>

      <Paper elevation={3} sx={{ p: 3, mb: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 5 }}>
        <Typography variant="h4" color="white" gutterBottom>PDF Page 2 Editor</Typography>
        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>Manage sections, content blocks, and dynamic tables</Typography>
      </Paper>

      <Paper sx={{ mb: 3, borderRadius: 5 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Content Sections" />
          <Tab label="Tables" />
        </Tabs>
      </Paper>

      {/* === CONTENT SECTIONS TAB === */}
      {tabValue === 0 && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 5 }}>
            <Typography variant="h6" gutterBottom>Add New Section</Typography>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Section Type</InputLabel>
                <Select value={newSection.type} label="Section Type" onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}>
                  <MenuItem value="plain">Plain Text</MenuItem>
                  <MenuItem value="title">Title with Content</MenuItem>
                  <MenuItem value="bullets">Bullet Points</MenuItem>
                  <MenuItem value="numbered">Numbered List</MenuItem>
                </Select>
              </FormControl>

              {newSection.type !== "plain" && (
                <TextField label="Section Title" fullWidth value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} />
              )}

              <TextField
                label="Content"
                fullWidth
                multiline
                rows={6}
                value={newSection.content}
                onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                placeholder={newSection.type === "numbered" ? "1. Main point\n• Sub point\n2. Next point" : "Enter content..."}
              />

              <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Live Preview</Typography>
                <Divider sx={{ mb: 1 }} />
                {renderLivePreview(newSection.content, newSection.type, newSection.title)}
              </Box>

              <Button variant="contained" startIcon={<Add />} onClick={handleAddSection} size="large" fullWidth>
                Add Section
              </Button>
            </Stack>
          </Paper>

          <Typography variant="h6" gutterBottom>All Sections ({sections.length})</Typography>
          {sections.length === 0 ? (
            <Alert severity="info">No sections yet. Add one above!</Alert>
          ) : (
            sections.map((sec, idx) => (
              <Card key={sec.id} sx={{ mb: 2, borderRadius: 5 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Chip icon={getTypeIcon(sec.type)} label={sec.type} size="small" color="primary" />
                    <Typography variant="caption" color="text.secondary">Position: {idx + 1}</Typography>
                  </Stack>

                  {editingId === sec.id ? (
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select value={editValues.type} label="Type" onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}>
                          <MenuItem value="plain">Plain Text</MenuItem>
                          <MenuItem value="title">Title with Content</MenuItem>
                          <MenuItem value="bullets">Bullet Points</MenuItem>
                          <MenuItem value="numbered">Numbered List</MenuItem>
                        </Select>
                      </FormControl>

                      {editValues.type !== "plain" && (
                        <TextField label="Title" fullWidth size="small" value={editValues.title} onChange={(e) => setEditValues({ ...editValues, title: e.target.value })} />
                      )}

                     <TextField
                        label="Content"
                        fullWidth
                        multiline
                        rows={5}
                        size="small"
                        value={
                          
                            
                            editValues.content
                        }
                        onChange={(e) => {
                     
                            setEditValues({
                              ...editValues,
                              content: e.target.value,
                            });
                          
                        }}
                        InputProps={{
                          style: {
                            whiteSpace: "pre-wrap",
                          },
                        }}
                      />
                      {editValues.type === "bullets" && (
                        <Button size="small" variant="outlined" startIcon={<FormatListBulleted />} onClick={addBulletToEdit}>
                          Add New Bullet
                        </Button>
                      )}

                       {editValues.type === "numbered" && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FormatListNumbered />}
                            onClick={addNumberToEdit}
                          >
                            Add New Number
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FormatListBulleted />}
                            onClick={addSubBullet}
                          >
                            Add Sub-bullet
                          </Button>
                        </Stack>
                      )}
                      {/* Live Preview in Edit Mode */}
                      {/* <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1, mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Live Preview</Typography>
                        <Divider sx={{ mb: 1 }} />
                        {renderLivePreview(editValues.content, editValues.type, editValues.title)}
                      </Box> */}
                    </Stack>
                  ) : (
                    <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
                      {renderSectionDisplay(sec)}
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  {editingId === sec.id ? (
                    <>
                      <Button size="small" startIcon={<Save />} onClick={saveEditSection}>Save</Button>
                      <Button size="small" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <IconButton size="small" onClick={() => startEditSection(sec)}><Edit /></IconButton>
                      <IconButton size="small" onClick={() => dispatch(deleteSection(sec.id))} color="error"><Delete /></IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            ))
          )}
        </>
      )}

      {/* === TABLES TAB === */}
      {tabValue === 1 && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 5 }}>
            <Typography variant="h6" gutterBottom>Add New Table</Typography>
            <ButtonGroup variant="contained" fullWidth>
              <Button startIcon={<TableChart />} onClick={() => handleAddTable(2)}>Add 2-Column Table</Button>
              <Button startIcon={<ViewColumn />} onClick={() => handleAddTable(3)} color="secondary">Add 3-Column Table</Button>
            </ButtonGroup>
          </Paper>

          <Typography variant="h6" gutterBottom>All Tables ({tables.length})</Typography>
          {tables.length === 0 ? (
            <Alert severity="info">No tables yet. Add one above!</Alert>
          ) : (
          tables.map((table) => (
          <Card key={table.id} sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              {/* Header Section */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Chip
                  icon={table.columnCount === 3 ? <ViewColumn /> : <TableChart />}
                  label={`${table.columnCount}-Column Table`}
                  color={table.columnCount === 3 ? "secondary" : "primary"}
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Add a new row to this table">
                    <IconButton size="small" color="primary" onClick={() => dispatch(addTableRow(table.id))}>
                      <AddCircleOutline />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete this entire table">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => window.confirm("Delete table?") && dispatch(deleteTable(table.id))}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Table */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                      {editingHeaders[table.id] ? (
                        <>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={editingHeaders[table.id].col1}
                              onChange={(e) =>
                                setEditingHeaders({
                                  ...editingHeaders,
                                  [table.id]: {
                                    ...editingHeaders[table.id],
                                    col1: e.target.value,
                                  },
                                })
                              }
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={editingHeaders[table.id].col2}
                              onChange={(e) =>
                                setEditingHeaders({
                                  ...editingHeaders,
                                  [table.id]: {
                                    ...editingHeaders[table.id],
                                    col2: e.target.value,
                                  },
                                })
                              }
                            />
                          </TableCell>
                          {table.columnCount === 3 && (
                            <TableCell sx={{ fontWeight: 600 }}>
                              <TextField
                                size="small"
                                fullWidth
                                value={editingHeaders[table.id].col3}
                                onChange={(e) =>
                                  setEditingHeaders({
                                    ...editingHeaders,
                                    [table.id]: {
                                      ...editingHeaders[table.id],
                                      col3: e.target.value,
                                    },
                                  })
                                }
                              />
                            </TableCell>
                          )}
                          <TableCell sx={{ width: "80px" }} align="center">
                            <Tooltip title="Save changes">
                              <IconButton size="small" onClick={() => saveEditHeaders(table.id, table.columnCount)}>
                                <Save fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: 600 }}>{table.headers.col1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{table.headers.col2}</TableCell>
                          {table.columnCount === 3 && (
                            <TableCell sx={{ fontWeight: 600 }}>{table.headers.col3}</TableCell>
                          )}
                          <TableCell sx={{ width: "80px" }} align="center">
                            {/* Column format menu button */}
                            <Tooltip title="Format columns">
                              <IconButton size="small" onClick={(e) => handleFormatMenuOpen(e, table.id)}>
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {/* Format menu */}
                            <Menu
                              anchorEl={formatMenuAnchor[table.id]}
                              open={Boolean(formatMenuAnchor[table.id])}
                              onClose={() => handleFormatMenuClose(table.id)}
                            >
                              <MenuItem disabled sx={{ fontSize: "0.85rem" }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  Column 2: {table.headers.col2}
                                </Typography>
                              </MenuItem>
                              <MenuItem onClick={() => toggleNumberFormat(table.id, 2)}>
                                {table.columnNo?.includes(2) ? "✓ Format as Number" : "Format as Number"}
                              </MenuItem>

                              {table.columnCount === 3 && (
                                <>
                                  <MenuItem disabled sx={{ fontSize: "0.85rem", mt: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      Column 3: {table.headers.col3}
                                    </Typography>
                                  </MenuItem>
                                  <MenuItem onClick={() => toggleNumberFormat(table.id, 3)}>
                                    {table.columnNo?.includes(3) ? "✓ Format as Number" : "Format as Number"}
                                  </MenuItem>
                                </>
                              )}
                            </Menu>
                          </TableCell>
                          <TableCell sx={{ width: "50px" }} align="center">
                            <Tooltip title="Edit column names">
                              <IconButton
                                size="small"
                                onClick={() => startEditHeaders(table.id, table.headers, table.columnCount)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {table.rows.map((row) => (
                      <TableRow key={row.id}>
                        {editingRow.tableId === table.id && editingRow.rowId === row.id ? (
                          <>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                value={rowForm.col1}
                                onChange={(e) => setRowForm({ ...rowForm, col1: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                value={table.columnNo?.includes(2) ? formatNumber(rowForm.col2) : rowForm.col2}
                                onChange={(e) => setRowForm({ ...rowForm, col2: e.target.value })}
                              />
                            </TableCell>
                            {table.columnCount === 3 && (
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  value={table.columnNo?.includes(3) ? formatNumber(rowForm.col3) : rowForm.col3}
                                  onChange={(e) =>
                                    setRowForm({
                                      ...rowForm,
                                      col3: e.target.value,
                                    })
                                  }
                                />
                              </TableCell>
                            )}
                            <TableCell colSpan={2} align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Tooltip title="Save changes">
                                  <IconButton size="small" color="success" onClick={saveEditRow}>
                                    <Save fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setEditingRow({
                                        tableId: null,
                                        rowId: null,
                                      })
                                      setRowForm({
                                        col1: "",
                                        col2: "",
                                        col3: "",
                                      })
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{row.col1}</TableCell>
                            <TableCell>{table.columnNo?.includes(2) ? formatNumber(row.col2) : row.col2}</TableCell>
                            {table.columnCount === 3 && (
                              <TableCell>{table.columnNo?.includes(3) ? formatNumber(row.col3) : row.col3}</TableCell>
                            )}
                            <TableCell colSpan={2} align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Tooltip title="Edit this row">
                                  <IconButton
                                    size="small"
                                    onClick={() => startEditRow(table.id, row, table.columnCount)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete this row">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      dispatch(
                                        deleteTableRow({
                                          tableId: table.id,
                                          rowId: row.id,
                                        }),
                                      )
                                    }
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
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
        ))
          )}
        </>
      )}

      {/* Reset Button */}
      <Box mt={4}>
        <Button variant="outlined" color="error" startIcon={<RefreshOutlined />} onClick={() => setResetOpen(true)} fullWidth>
          Reset All Data
        </Button>
      </Box>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle><WarningAmber color="error" /> Confirm Reset</DialogTitle>
        <DialogContent><Typography>This will delete all sections and tables. Continue?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button onClick={handleReset} color="error" variant="contained">Reset Everything</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPageEditor2;