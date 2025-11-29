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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  ButtonGroup,
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
  ViewColumn,
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
  updatePageHeader,
} from "../src/utils/page2Slice";
import { showToast } from "../src/utils/toastSlice";

const PdfPageEditor2 = ({ mode }) => {
  const dispatch = useDispatch();
  console.log("mode 2222222222", mode);

  // Redux State
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
  const header = useSelector(
    (state) =>
      state.page2?.header || {
        pageTitle: "",
        heading: "",
        subheading: "",
      }
  );
  console.log("section", sections);
  // Local States
  const [tabValue, setTabValue] = useState(0);
  const [newSection, setNewSection] = useState({
    type: "title",
    title: "",
    content: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    type: "title",
    title: "",
    content: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const containerRef = useRef();
  // Table editing
  const [editingRow, setEditingRow] = useState({ tableId: null, rowId: null });
  const [rowForm, setRowForm] = useState({ col1: "", col2: "", col3: "" });
  const [editingHeaders, setEditingHeaders] = useState({});

  const handleAddSection = () => {
    const isPlain = newSection.type === "plain";
    const isNumbered = newSection.type === "numbered";

    // Plain ke liye title check nahi chahiye
    if (!isPlain && !newSection.title.trim()) {
      dispatch(
        showToast({ message: "Title is required", severity: "warning" })
      );
      return;
    }
    if (!newSection.content.trim()) {
      dispatch(
        showToast({ message: "Content is required", severity: "warning" })
      );
      return;
    }

    // ✅ Plain me title empty, baqi sab me title bhejenge
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
    setEditValues({
      type: sec.type,
      title: sec.title || "",
      content: sec.content || "",
    });
  };

  const saveEditSection = () => {
    const isPlain = editValues.type === "plain";

    if (!isPlain && !editValues.title.trim()) return;
    if (!editValues.content.trim()) return;

    // ✅ Plain me title empty, baqi sab me title bhejenge
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

  // Add bullet/number helpers for editing
  const addBulletToEdit = () => {
    setEditValues({
      ...editValues,
      content: editValues.content + (editValues.content ? "\n" : "") + "• ",
    });
  };

  const addNumberToEdit = () => {
    const content = editValues.content.trim();
    const lines = content.split("\n");

    let highestNumber = 0;
    lines.forEach((line) => {
      const match = line.trim().match(/^(\d+)\.\s/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > highestNumber) highestNumber = num;
      }
    });

    const nextNumber = highestNumber + 1;

    setEditValues((prev) => ({
      ...prev,
      content:
        prev.content +
        (prev.content && !prev.content.endsWith("\n") ? "\n" : "") +
        `${nextNumber}. `,
    }));
  };

  // === TABLE HANDLERS ===
  const handleAddTable = (columnCount = 2) => {
    dispatch(addTable({ columnCount }));
    dispatch(
      showToast({
        message: `New ${columnCount}-column table added!`,
        severity: "success",
      })
    );
  };

  const startEditRow = (tableId, row, columnCount) => {
    setEditingRow({ tableId, rowId: row.id });
    setRowForm({
      col1: row.col1,
      col2: row.col2,
      col3: columnCount === 3 ? row.col3 || "" : "",
    });
  };

  const saveEditRow = () => {
    if (!rowForm.col1.trim()) {
      dispatch(
        showToast({ message: "First column is required", severity: "warning" })
      );
      return;
    }
    console.log("rowForm", rowForm);
    const table = tables.find((t) => t.id === editingRow.tableId);
    const updatePayload = {
      tableId: editingRow.tableId,
      rowId: editingRow.rowId,
      col1: rowForm?.col1?.trim(),
      col2: rowForm?.col2,
    };

    if (table?.columnCount === 3) {
      updatePayload.col3 = rowForm.col3.trim();
    }

    dispatch(updateTableRow(updatePayload));
    setEditingRow({ tableId: null, rowId: null });
    setRowForm({ col1: "", col2: "", col3: "" });
  };

const formatNumber = (value) => {
  if (!value) return "";
  const numeric = value.replace(/\D/g, ""); 
  return Number(numeric).toLocaleString("en-US");
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
    const headers = editingHeaders[tableId];
    if (!headers?.col1?.trim() || !headers?.col2?.trim()) {
      dispatch(
        showToast({ message: "Headers cannot be empty", severity: "warning" })
      );
      return;
    }

    const updatePayload = {
      tableId,
      col1: headers.col1.trim(),
      col2: headers.col2.trim(),
    };

    if (columnCount === 3) {
      if (!headers?.col3?.trim()) {
        dispatch(
          showToast({ message: "Headers cannot be empty", severity: "warning" })
        );
        return;
      }
      updatePayload.col3 = headers.col3.trim();
    }

    dispatch(updateTableHeaders(updatePayload));
    setEditingHeaders({});
    dispatch(showToast({ message: "Headers updated!", severity: "success" }));
  };

  // === PREVIEW ===
  const renderLivePreview = (content, type, title = "") => {
    if (!content?.trim())
      return (
        <Typography color="text.secondary">Preview appears here...</Typography>
      );

    if (type === "numbered") {
      const lines = content.split("\n");
      let currentBlock = null;
      const blocks = [];

      lines.forEach((line) => {
        const trimmed = line.trim();
        const numberMatch = trimmed.match(/^(\d+)\.\s*(.*)/);

        if (numberMatch) {
          // New numbered item
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = {
            number: numberMatch[1],
            main: numberMatch[2].trim(),
            subitems: [],
          };
        } else if (
          trimmed.startsWith("•") ||
          trimmed.startsWith("-") ||
          trimmed.startsWith("·")
        ) {
          // Sub-bullet under current numbered item
          if (currentBlock) {
            currentBlock.subitems.push(trimmed.replace(/^[-•·]\s*/, "").trim());
          }
        } else if (trimmed && currentBlock) {
          // If someone writes without •, still treat as subitem
          currentBlock.subitems.push(trimmed);
        }
      });

      if (currentBlock) blocks.push(currentBlock);

      return (
        <>
          {title && (
            <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
              {title}
            </Typography>
          )}
          {blocks.map((block, i) => (
            <Box key={i} mb={2}>
              <Typography fontWeight="bold">
                {block.number}. {block.main || "(No text)"}
              </Typography>
              {block.subitems.length > 0 && (
                <Box ml={4} mt={0.5}>
                  {block.subitems.map((sub, j) => (
                    <Typography
                      key={j}
                      variant="body2"
                      sx={{
                        display: "list-item",
                        listStyleType: "disc",
                        ml: 2,
                      }}
                    >
                      {sub}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </>
      );
    }

    if (type === "bullets") {
      return (
        <>
          {title && (
            <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
              {title}
            </Typography>
          )}
          {content
            .split("\n")
            .filter(Boolean)
            .map((line, i) => {
              const cleanLine = line.replace(/^[•·\-]\s*/, "").trim();
              return <Typography key={i}>• {cleanLine}</Typography>;
            })}
        </>
      );
    }

    if (type === "title") {
      return (
        <>
          {title && (
            <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
              {title}
            </Typography>
          )}
          <Typography>{content}</Typography>
        </>
      );
    }

    return <Typography>{content}</Typography>;
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
      {/* Success Alert */}
      <Collapse in={showSuccess}>
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
          Section added successfully!
        </Alert>
      </Collapse>

      {/* Header Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 5,
        }}
      >
        <Typography variant="h4" color="white" gutterBottom>
          📄 PDF Page 2 Editor
        </Typography>
        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
          Manage sections, content blocks, and dynamic tables
        </Typography>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 5 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderRadius: 5 }}
        >
          <Tab label="Content Sections" />
          <Tab label="Tables" />
        </Tabs>
      </Paper>

      {/* Tab 1: Content Sections */}
      {tabValue === 0 && (
        <>
          {/* Add New Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 5 }}>
            <Typography variant="h6" gutterBottom>
              ➕ Add New Section
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="section-type-label">Section Type</InputLabel>
                <Select
                  labelId="section-type-label"
                  value={newSection.type}
                  label="Section Type"
                  onChange={(e) =>
                    setNewSection({ ...newSection, type: e.target.value })
                  }
                >
                  <MenuItem value="plain">Plain Text</MenuItem>
                  <MenuItem value="title">Title with Content</MenuItem>
                  <MenuItem value="bullets">Bullet Points</MenuItem>
                  <MenuItem value="numbered">Numbered List</MenuItem>
                </Select>
              </FormControl>

              {/* ✅ Title field sirf plain ke liye hide hoga */}
              {newSection.type !== "plain" && (
                <TextField
                  label="Section Title"
                  fullWidth
                  value={newSection.title}
                  onChange={(e) =>
                    setNewSection({ ...newSection, title: e.target.value })
                  }
                />
              )}

              <TextField
                label="Content"
                fullWidth
                multiline
                rows={5}
                value={newSection.content}
                onChange={(e) =>
                  setNewSection({ ...newSection, content: e.target.value })
                }
                placeholder={
                  newSection.type === "numbered"
                    ? "1. Item one\n• Sub-point\n2. Item two"
                    : "Enter content..."
                }
              />

              {/* Live Preview */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  📋 Live Preview
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {renderLivePreview(
                  newSection.content,
                  newSection.type,
                  newSection.title
                )}
              </Box>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddSection}
                size="large"
                fullWidth
              >
                Add Section
              </Button>
            </Stack>
          </Paper>

          {/* Existing Sections */}
          <Typography variant="h6" gutterBottom>
            📚 All Sections ({sections.length})
          </Typography>
          {sections.length === 0 ? (
            <Alert severity="info">No sections yet. Add one above!</Alert>
          ) : (
            sections.map((sec, idx) => (
              <Card key={sec.id} sx={{ mb: 2, borderRadius: 5 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Chip
                      icon={getTypeIcon(sec.type)}
                      label={sec.type}
                      size="small"
                      color="primary"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Position: {idx + 1}
                    </Typography>
                  </Stack>

                  {editingId === sec.id ? (
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel id={`edit-type-label-${sec.id}`}>
                          Type
                        </InputLabel>
                        <Select
                          labelId={`edit-type-label-${sec.id}`}
                          value={editValues.type}
                          label="Type"
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              type: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="plain">Plain Text</MenuItem>
                          <MenuItem value="title">Title with Content</MenuItem>
                          <MenuItem value="bullets">Bullet Points</MenuItem>
                          <MenuItem value="numbered">Numbered List</MenuItem>
                        </Select>
                      </FormControl>

                      {/* ✅ Title field sirf plain ke liye hide hoga */}
                      {editValues.type !== "plain" && (
                        <TextField
                          label="Title"
                          fullWidth
                          size="small"
                          value={editValues.title}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              title: e.target.value,
                            })
                          }
                        />
                      )}

                      <TextField
                        label="Content"
                        fullWidth
                        multiline
                        rows={4}
                        size="small"
                        value={editValues.content}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            content: e.target.value,
                          })
                        }
                      />

                      {/* Quick Add Buttons */}
                      {editValues.type === "bullets" && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FormatListBulleted />}
                          onClick={addBulletToEdit}
                        >
                          Add New Bullet
                        </Button>
                      )}

                      {editValues.type === "numbered" && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FormatListNumbered />}
                            onClick={addNumberToEdit}
                          >
                            Add New Number (1.)
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FormatListBulleted />}
                            onClick={() => {
                              setEditValues({
                                ...editValues,
                                content:
                                  editValues.content +
                                  (editValues.content &&
                                  !editValues.content.endsWith("\n")
                                    ? "\n"
                                    : "") +
                                  "• ",
                              });
                            }}
                          >
                            Add Sub-bullet (•)
                          </Button>
                        </Stack>
                      )}

                      {/* Live Preview in Edit Mode */}
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.100",
                          borderRadius: 1,
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          📋 Live Preview
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        {renderLivePreview(
                          editValues.content,
                          editValues.type,
                          editValues.title
                        )}
                      </Box>
                    </Stack>
                  ) : (
                    <>
                      <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
                        {renderLivePreview(sec.content, sec.type, sec.title)}
                      </Box>
                    </>
                  )}
                </CardContent>

                <CardActions>
                  {editingId === sec.id ? (
                    <>
                      <Button
                        size="small"
                        startIcon={<Save />}
                        onClick={saveEditSection}
                      >
                        Save
                      </Button>
                      <Button size="small" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => startEditSection(sec)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => dispatch(deleteSection(sec.id))}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </CardActions>
              </Card>
            ))
          )}
        </>
      )}

      {/* Tab 2: Tables */}
      {tabValue === 1 && (
        <>
          {/* Add Table Buttons */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 5 }}>
            <Typography variant="h6" gutterBottom>
              ➕ Add New Table
            </Typography>
            <ButtonGroup variant="contained" fullWidth sx={{ borderRadius: 5 }}>
              <Button
                sx={{ borderRadius: 5 }}
                startIcon={<TableChart />}
                onClick={() => handleAddTable(2)}
              >
                Add 2-Column Table
              </Button>
              <Button
                sx={{ borderRadius: 5 }}
                startIcon={<ViewColumn />}
                onClick={() => handleAddTable(3)}
                color="secondary"
              >
                Add 3-Column Table
              </Button>
            </ButtonGroup>
          </Paper>

          {/* Existing Tables */}
          <Typography variant="h6" gutterBottom>
            📊 All Tables ({tables.length})
          </Typography>
          {tables.length === 0 ? (
            <Alert severity="info">No tables yet. Add one above!</Alert>
          ) : (
            tables.map((table) => (
              <Card key={table.id} sx={{ mb: 3, borderRadius: 5 }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Chip
                      icon={
                        table.columnCount === 3 ? (
                          <ViewColumn />
                        ) : (
                          <TableChart />
                        )
                      }
                      label={`${table.columnCount}-Column Table`}
                      color={table.columnCount === 3 ? "secondary" : "primary"}
                    />
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Add Row">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => dispatch(addTableRow(table.id))}
                        >
                          <AddCircleOutline />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Table">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm("Delete this entire table?")) {
                              dispatch(deleteTable(table.id));
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                          {table.id === 1 && "In this table, the second column must always contain numeric values."}

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {editingHeaders[table.id] ? (
                            <>
                              <TableCell>
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
                              <TableCell>
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
                                <TableCell>
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
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    saveEditHeaders(table.id, table.columnCount)
                                  }
                                >
                                  <Save />
                                </IconButton>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>
                                <strong>{table.headers.col1}</strong>
                              </TableCell>
                              <TableCell>
                                <strong>{table.headers.col2}</strong>
                              </TableCell>
                              {table.columnCount === 3 && (
                                <TableCell>
                                  <strong>{table.headers.col3}</strong>
                                </TableCell>
                              )}
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    startEditHeaders(
                                      table.id,
                                      table.headers,
                                      table.columnCount
                                    )
                                  }
                                >
                                  <Edit />
                                </IconButton>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {table.rows.map((row) => (
                          <TableRow key={row.id}>
                            {editingRow.tableId === table.id &&
                            editingRow.rowId === row.id ? (
                              <>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={rowForm.col1}
                                    onChange={(e) =>
                                      setRowForm({
                                        ...rowForm,
                                        col1: e.target.value,
                                      })
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={
                                      table.id === 1
                                        ? formatNumber(rowForm.col2)
                                        : rowForm.col2
                                    }
                                    onChange={(e) => {
                                      const formatted = formatNumber(
                                        e.target.value
                                      );

                                      if (table.id === 1) {
                                        setRowForm({
                                          ...rowForm,
                                          col2: formatted, // <-- store formatted value like "12,000"
                                        });
                                      }

                                      setRowForm({
                                        ...rowForm,
                                        col2: e.target.value,
                                      });
                                    }}
                                  />
                                </TableCell>
                                {table.columnCount === 3 && (
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      fullWidth
                                      value={rowForm.col3}
                                      onChange={(e) =>
                                        setRowForm({
                                          ...rowForm,
                                          col3: e.target.value,
                                        })
                                      }
                                    />
                                  </TableCell>
                                )}
                                <TableCell>
                                  <Stack direction="row">
                                    <IconButton
                                      size="small"
                                      onClick={saveEditRow}
                                    >
                                      <Save />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setEditingRow({
                                          tableId: null,
                                          rowId: null,
                                        });
                                        setRowForm({
                                          col1: "",
                                          col2: "",
                                          col3: "",
                                        });
                                      }}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Stack>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>{row.col1}</TableCell>
                                <TableCell>{row.col2}</TableCell>
                                {table.columnCount === 3 && (
                                  <TableCell>{row.col3}</TableCell>
                                )}
                                <TableCell>
                                  <Stack direction="row">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        startEditRow(
                                          table.id,
                                          row,
                                          table.columnCount
                                        )
                                      }
                                    >
                                      <Edit />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        dispatch(
                                          deleteTableRow({
                                            tableId: table.id,
                                            rowId: row.id,
                                          })
                                        )
                                      }
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Stack>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div ref={containerRef}></div>
                  </TableContainer>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}

      {/* Reset Button */}
      <Box mt={4}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<RefreshOutlined />}
          sx={{ borderRadius: 5 }}
          onClick={() => setResetOpen(true)}
          fullWidth
        >
          Reset All Data
        </Button>
      </Box>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        sx={{ borderRadius: 5 }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningAmber color="error" />
            <span>Confirm Reset</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            This will delete all sections and tables. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReset}
            color="error"
            variant="contained"
            sx={{ borderRadius: 5 }}
          >
            Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPageEditor2;
