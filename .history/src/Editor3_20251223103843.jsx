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
  AutoFixHigh,
  DeleteSweep,
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
  deleteTableColumn, // Added deleteTableColumn
  addColumnToNumber,
  removeColumnToNumber,
  addTableTitle,
} from "../src/utils/page2Slice";
import { generateId } from "../src/utils/page2Slice";
import { showToast } from "../src/utils/toastSlice";
import { parseMixedContent, parseSmartTable } from "../src/utils/pdfParsers";

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

  // Table states
  const [editingRow, setEditingRow] = useState({ tableId: null, rowId: null });
  const [rowForm, setRowForm] = useState({ col1: "", col2: "", col3: "" });
  const [editingHeaders, setEditingHeaders] = useState({});
  const [smartPasteText, setSmartPasteText] = useState("");

  // Color scheme matching ProposalFormWithStepper
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
    p: { xs: 2, sm: 3, md: 4 },
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
          sx: { fontSize: 24, color: "#fff" },
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
      if (
        trimmed.startsWith("•") ||
        trimmed.startsWith("-") ||
        trimmed.startsWith("*")
      ) {
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
    const separator =
      editValues.content && !editValues.content.endsWith("\n") ? "\n" : "";

    setEditValues({
      ...editValues,
      content: editValues.content + separator + "• ",
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
    const isPlain = newSection.type === "plain" || newSection.type === "mixed";
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
    const isPlain = editValues.type === "plain" || editValues.type === "mixed";
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
      if (!content.endsWith("\n")) {
        separator = "\n\n";
      } else if (!content.endsWith("\n\n")) {
        separator = "\n";
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
    dispatch(
      showToast({
        message: `New ${columnCount}-column table added!`,
        severity: "success",
      })
    );
  };

  const handleSmartTablePaste = () => {
    if (!smartPasteText.trim()) {
      dispatch(showToast({ message: "Please paste some data first", severity: "warning" }));
      return;
    }

    const result = parseSmartTable(smartPasteText);
    if (!result || result.rows.length === 0) {
      dispatch(showToast({ message: "Could not parse table data", severity: "error" }));
      return;
    }

    // Add the table to Redux
    dispatch(addTable({
      columnCount: result.columnCount,
      rows: result.rows,
      title: result.title,
      headers: result.headers
    }));

    setSmartPasteText("");
    dispatch(showToast({ message: "Table structured successfully!", severity: "success" }));
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
      dispatch(
        showToast({ message: "First column is required", severity: "warning" })
      );
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
      dispatch(
        showToast({ message: "Headers cannot be empty", severity: "warning" })
      );
      return;
    }
    const payload = { tableId, col1: h.col1.trim(), col2: h.col2.trim() };
    if (columnCount === 3) {
      if (!h.col3?.trim()) {
        dispatch(
          showToast({
            message: "Header 3 cannot be empty",
            severity: "warning",
          })
        );
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

    // EXACT SAME BLOCK SPLITTING AS RN
    const blocks = content.split(/\n(?=\d+\.\s)/).filter(Boolean);

    let formattedBlocks = [];

    blocks.forEach((block, i) => {
      const lines = block.trim().split("\n");
      const mainRaw = lines[0];

      // MAIN TEXT (remove "1. ")
      const mainText = mainRaw.replace(/^\d+\.\s*/, "").trim();

      const bullets = [];

      // SUB-LINES (same bullet detection logic as RN)
      const subLines = lines.slice(1);

      subLines.forEach((sub) => {
        const trimmed = sub.trim();
        if (!trimmed) return;

        let bullet = "• ";
        let cleanText = trimmed;

        // SAME BULLET REGEX AS RN
        const bulletMatch =
          trimmed.match(/^([•·\*•\-\u2022>]+|\-\s|\*\s|•\s)/);

        if (bulletMatch) {
          bullet = bulletMatch[0];
          cleanText = trimmed.slice(bullet.length).trim();
        } else {
          cleanText = trimmed;
          bullet = "• ";
        }

        bullets.push({
          bullet,
          text: cleanText,
        });
      });

      formattedBlocks.push({
        number: i + 1,
        text: mainText,
        bullets,
      });
    });

    return (
      <Box>
        {title && (
          <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
            {title}
          </Typography>
        )}

        {formattedBlocks.map((block, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            {/* MAIN NUMBERED ITEM */}
            <Typography fontWeight="bold" gutterBottom>
              {block.number}. {block.text}
            </Typography>

            {/* BULLETS */}
            {block.bullets.length > 0 && (
              <Box sx={{ ml: 4 }}>
                {block.bullets.map((b, j) => (
                  <Box
                    key={j}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        mr: 1,
                        fontSize: "0.9rem",
                        color: "text.secondary",
                        mt: 0.2,
                      }}
                    >
                      {b.bullet}
                    </Typography>

                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {b.text}
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

  const renderNumberedToString = (content) => {
    if (!content?.trim()) return "";

    // Split into numbered blocks just like React Native
    const blocks = content.split(/\n(?=\d+\.\s)/).filter(Boolean);

    let finalOutput = "";

    blocks.forEach((block, i) => {
      const lines = block.trim().split("\n");

      // MAIN numbered line
      const mainRaw = lines[0];
      const mainText = mainRaw.replace(/^\d+\.\s*/, "").trim();

      finalOutput += `${i + 1}. ${mainText}\n`;

      // SUB-LINES (exactly same logic as RN)
      const subLines = lines.slice(1);

      subLines.forEach((sub) => {
        const trimmed = sub.trim();
        if (!trimmed) return;

        let bullet = "• ";
        let cleanText = trimmed;

        // Detect bullet symbols exactly like RN
        const bulletMatch = trimmed.match(/^([•·\*•\-\u2022>]+|\-\s|\*\s|•\s)/);

        if (bulletMatch) {
          bullet = bulletMatch[0]; // preserve exact bullet
          cleanText = trimmed.slice(bullet.length).trim();
        } else {
          cleanText = trimmed; // normal text → default bullet
          bullet = "• ";
        }

        finalOutput += `${bullet.trim()} ${cleanText}\n`;
      });

      finalOutput += "\n"; // space after each block (same effect as RN)
    });

    return finalOutput.trim();
  };



  const [editingTableTitle, setEditingTableTitle] = useState({});

  const startEditTableTitle = (tableId, currentTitle) => {
    setEditingTableTitle({
      ...editingTableTitle,
      [tableId]: currentTitle || "",
    });
  };

  const saveTableTitle = (tableId) => {
    // dispatch(addTableTitle({ id: tableId, title: editingTableTitle[tableId] }));
    const newState = { ...editingTableTitle };
    delete newState[tableId];
    dispatch(addTableTitle({ id: tableId, title: editingTableTitle[tableId] }));
    setEditingTableTitle(newState); // Exit edit mode
  };

  const [formatMenuAnchor, setFormatMenuAnchor] = useState({});
  const handleFormatMenuOpen = (event, tableId) => {
    setFormatMenuAnchor({
      ...formatMenuAnchor,
      [tableId]: event.currentTarget,
    });
  };

  const handleFormatMenuClose = (tableId) => {
    setFormatMenuAnchor({ ...formatMenuAnchor, [tableId]: null });
  };

  const toggleNumberFormat = (tableId, col) => {
    const table = tables.find((t) => t.id === tableId);
    if (table?.columnNo?.includes(col)) {
      dispatch(removeColumnToNumber({ id: tableId, col }));
    } else {
      dispatch(addColumnToNumber({ id: tableId, col }));
    }
    handleFormatMenuClose(tableId);
  };
  const renderLivePreview = (content, type, title = "") => {
    if (!content?.trim())
      return (
        <Typography color="text.secondary">Preview appears here...</Typography>
      );

    if (type === "numbered") return renderNumberedList(content, title);

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
              const clean = line.replace(/^[•·\-]\s*/, "").trim();
              return (
                <Typography
                  key={i}
                  sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}

                >
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

  const renderMixedPreview = (content) => {
    if (!content?.trim()) return <Typography color="text.secondary">Preview appears here...</Typography>;
    const blocks = parseMixedContent(content);
    return (
      <Box>
        {blocks.map((block, i) => (
          <Box key={i} sx={{ mb: block.type === 'title' ? 1 : 2 }}>
            {renderLivePreview(block.content, block.type, block.title)}
          </Box>
        ))}
      </Box>
    );
  };

  // Render section display with proper numbered list technique
  // Render section display with proper numbered list technique
  const renderSectionDisplay = (sec) => {
    if (sec.type === "numbered") {
      const blocks = sec.content.split(/\n(?=\d+\.\s)/).filter(Boolean);

      const cleanLine = (line) => line.replace(/^[-•·]\s*/, "").trim();

      return (
        <Box>
          {sec.title && (
            <Typography variant="h6" gutterBottom fontWeight="bold" mb={2}>
              {sec.title}
            </Typography>
          )}
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
                        <Box
                          key={j}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              mr: 1,
                              fontSize: "0.9rem",
                              color: "text.secondary",
                              mt: 0.2,
                            }}
                          >
                            •
                          </Typography>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {cleanSub}
                          </Typography>
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
    if (sec.type === "mixed") {
      return renderMixedPreview(sec.content);
    }
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
    <Box
      sx={{
        maxWidth: 1800,
        margin: "0 auto",
        p: { xs: 0, sm: 2, md: 3 },
      }}
    >
      <Collapse in={showSuccess}>
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
          Section added successfully!
        </Alert>
      </Collapse>

      {/* Header with gradient matching ProposalFormWithStepper */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: colorScheme.gradient,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
        }}
      >
        <Typography variant="h4" color="white" gutterBottom fontWeight={700}>
          PDF Page 2 Editor
        </Typography>
        <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
          Manage sections, content blocks, and dynamic tables
        </Typography>
      </Paper>

      {/* Tabs with improved styling */}
      <Paper sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: "1rem",
              "&.Mui-selected": {
                color: colorScheme.primary,
              },
            },
            "& .MuiTabs-indicator": {
              background: colorScheme.gradient,
              height: 3,
            },
          }}
        >
          <Tab label="Content Sections" />
          <Tab label="Tables" />
        </Tabs>
      </Paper>

      {/* === CONTENT SECTIONS TAB === */}
      {tabValue === 0 && (
        <>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {sectionHeader(<Add />, "Add New Section")}
              <Stack spacing={2}>
                <FormControl fullWidth sx={inputStyle}>
                  <InputLabel>Section Type</InputLabel>
                  <Select
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
                    <MenuItem value="mixed">Mixed Content (Auto Detect)</MenuItem>
                  </Select>
                </FormControl>

                {newSection.type !== "plain" && newSection.type !== "mixed" && (
                  <TextField
                    label="Section Title"
                    fullWidth
                    value={newSection.title}
                    onChange={(e) =>
                      setNewSection({ ...newSection, title: e.target.value })
                    }
                    sx={inputStyle}
                  />
                )}

                <TextField
                  label="Content"
                  fullWidth
                  multiline
                  rows={6}
                  value={newSection.content}
                  onChange={(e) =>
                    setNewSection({ ...newSection, content: e.target.value })
                  }
                  placeholder={
                    newSection.type === "numbered"
                      ? "1. Main point\n• Sub point\n2. Next point"
                      : newSection.type === "mixed"
                        ? "Project Title\n\nThis is a paragraph.\n\n- Bullet 1\n- Bullet 2\n\n1. Numbered 1\n2. Numbered 2"
                        : "Enter content..."
                  }
                  sx={inputStyle}
                />

                <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Live Preview
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {newSection.type === "mixed" ? (
                    renderMixedPreview(newSection.content)
                  ) : (
                    renderLivePreview(
                      newSection.content,
                      newSection.type,
                      newSection.title
                    )
                  )}
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddSection}
                  size="large"
                  fullWidth
                  sx={{
                    background: colorScheme.gradient,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 700,
                    "&:hover": {
                      background: colorScheme.hoverGradient,
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                    },
                  }}
                >
                  Add Section
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {sectionHeader(<FormatListBulleted />, `All Sections (${sections.length})`)}
          {sections.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No sections yet. Add one above!
            </Alert>
          ) : (
            sections.map((sec, idx) => (
              <Card key={sec.id} sx={{ ...cardStyle, mb: 2 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Chip
                      icon={getTypeIcon(sec.type)}
                      label={sec.type}
                      size="small"
                      sx={{
                        background: colorScheme.gradient,
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Position: {idx + 1}
                    </Typography>
                  </Stack>

                  {editingId === sec.id ? (
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small" sx={inputStyle}>
                        <InputLabel>Type</InputLabel>
                        <Select
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
                          <MenuItem value="mixed">Mixed Content (Auto)</MenuItem>
                        </Select>
                      </FormControl>

                      {editValues.type !== "plain" && editValues.type !== "mixed" && (
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
                          sx={inputStyle}
                        />
                      )}

                      <TextField
                        label="Content"
                        fullWidth
                        multiline
                        rows={5}
                        size="small"
                        sx={{ ...inputStyle, textAlign: 'start' }}
                        value={
                          editValues.type === "numbered"
                            ? renderNumberedToString(editValues.content)
                            : editValues.content
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
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FormatListBulleted />}
                          onClick={addBulletToEdit}
                          sx={{
                            borderColor: colorScheme.primary,
                            color: colorScheme.primary,
                            "&:hover": {
                              borderColor: colorScheme.secondary,
                              background: `${colorScheme.primary}10`,
                            },
                          }}
                        >
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
                            sx={{
                              borderColor: colorScheme.primary,
                              color: colorScheme.primary,
                              "&:hover": {
                                borderColor: colorScheme.secondary,
                                background: `${colorScheme.primary}10`,
                              },
                            }}
                          >
                            Add New Number
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FormatListBulleted />}
                            onClick={addSubBullet}
                            sx={{
                              borderColor: colorScheme.primary,
                              color: colorScheme.primary,
                              "&:hover": {
                                borderColor: colorScheme.secondary,
                                background: `${colorScheme.primary}10`,
                              },
                            }}
                          >
                            Add Sub-bullet
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  ) : (
                    <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
                      {renderSectionDisplay(sec)}
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  {editingId === sec.id ? (
                    <>
                      <Button
                        size="small"
                        startIcon={<Save />}
                        onClick={saveEditSection}
                        variant="contained"
                        sx={{
                          background: colorScheme.gradient,
                          "&:hover": {
                            background: colorScheme.hoverGradient,
                          },
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setEditingId(null)}
                        variant="outlined"
                        sx={{
                          borderColor: colorScheme.primary,
                          color: colorScheme.primary,
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => startEditSection(sec)}
                        sx={{
                          color: colorScheme.primary,
                          "&:hover": {
                            background: `${colorScheme.primary}15`,
                          },
                        }}
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

      {/* === TABLES TAB === */}
      {tabValue === 1 && (
        <>
          <Card sx={cardStyle}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {sectionHeader(<TableChart />, "Add New Table")}

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">
                  Option 1: Smart Paste (Excel, CSV, dot-env style)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder={`Paste your data here...\nExample:\nProject Title\nItem 1\tValue 1\nItem 2\tValue 2`}
                  value={smartPasteText}
                  onChange={(e) => setSmartPasteText(e.target.value)}
                  sx={{ mb: 2, ...inputStyle }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AutoFixHigh />}
                  onClick={handleSmartTablePaste}
                  sx={{
                    background: colorScheme.gradient,
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  Structure Table Automatically
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" sx={{ color: "#999", fontWeight: 700 }}>OR</Typography>
              </Divider>

              <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">
                Option 2: Create Manual Table
              </Typography>
              <ButtonGroup variant="contained" fullWidth>
                <Button
                  startIcon={<TableChart />}
                  onClick={() => handleAddTable(2)}
                  sx={{
                    background: colorScheme.gradient,
                    "&:hover": {
                      background: colorScheme.hoverGradient,
                    },
                  }}
                >
                  Add 2-Column Table
                </Button>
                <Button
                  startIcon={<ViewColumn />}
                  onClick={() => handleAddTable(3)}
                  sx={{
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #6a3f8f 0%, #5568d3 100%)",
                    },
                  }}
                >
                  Add 3-Column Table
                </Button>
              </ButtonGroup>
            </CardContent>
          </Card>

          {sectionHeader(<TableChart />, `All Tables (${tables.length})`)}
          {tables.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No tables yet. Add one above!
            </Alert>
          ) : (
            tables.map((table) => (
              <Card key={table.id} sx={{ ...cardStyle, mb: 3 }}>
                <CardContent>
                  {/* Table Title Section */}
                  <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    {editingTableTitle[table.id] !== undefined ? (
                      <>
                        <TextField
                          size="small"
                          fullWidth
                          label="Table Title"
                          value={editingTableTitle[table.id]}
                          onChange={(e) =>
                            setEditingTableTitle({
                              ...editingTableTitle,
                              [table.id]: e.target.value,
                            })
                          }
                          sx={inputStyle}
                        />
                        <IconButton
                          color="primary"
                          onClick={() => saveTableTitle(table.id)}
                        >
                          <Save />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            setEditingTableTitle({
                              ...editingTableTitle,
                              [table.id]: undefined,
                            })
                          }
                        >
                          <Delete />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                          {table.title || "No Title"}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            startEditTableTitle(table.id, table.title)
                          }
                          sx={{
                            color: colorScheme.primary,
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {/* Header Section */}
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
                      sx={{
                        background: table.columnCount === 3
                          ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                          : colorScheme.gradient,
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Add a new row to this table">
                        <IconButton
                          size="small"
                          onClick={() => dispatch(addTableRow(table.id))}
                          sx={{
                            color: colorScheme.primary,
                            "&:hover": {
                              background: `${colorScheme.primary}15`,
                            },
                          }}
                        >
                          <AddCircleOutline />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete this entire table">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            window.confirm("Delete table?") &&
                            dispatch(deleteTable(table.id))
                          }
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {/* Table */}
                  <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow
                          sx={{
                            background: colorScheme.gradient,
                          }}
                        >
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
                                  sx={{
                                    "& .MuiInputBase-root": {
                                      background: "#fff",
                                    },
                                  }}
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
                                  sx={{
                                    "& .MuiInputBase-root": {
                                      background: "#fff",
                                    },
                                  }}
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
                                    sx={{
                                      "& .MuiInputBase-root": {
                                        background: "#fff",
                                      },
                                    }}
                                  />
                                </TableCell>
                              )}
                              <TableCell sx={{ width: "120px" }} align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  <Tooltip title="Save changes">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        saveEditHeaders(
                                          table.id,
                                          table.columnCount
                                        )
                                      }
                                      sx={{ color: "#fff" }}
                                    >
                                      <Save fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {table.columnCount > 2 && (
                                    <Tooltip title="Delete Column 3">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          dispatch(deleteTableColumn({ tableId: table.id, colIndex: 3 }))
                                        }
                                        sx={{ color: "#fff" }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Stack>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell sx={{ fontWeight: 600, color: "#fff" }}>
                                {table.headers.col1}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: "#fff" }}>
                                {table.headers.col2}
                              </TableCell>
                              {table.columnCount === 3 && (
                                <TableCell sx={{ fontWeight: 600, color: "#fff" }}>
                                  {table.headers.col3}
                                </TableCell>
                              )}
                              <TableCell sx={{ width: "80px" }} align="center">
                                {/* Column format menu button */}
                                <Tooltip title="Format columns">
                                  <IconButton
                                    size="small"
                                    onClick={(e) =>
                                      handleFormatMenuOpen(e, table.id)
                                    }
                                    sx={{ color: "#fff" }}
                                  >
                                    <MoreVert fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {/* Format menu */}
                                <Menu
                                  anchorEl={formatMenuAnchor[table.id]}
                                  open={Boolean(formatMenuAnchor[table.id])}
                                  onClose={() =>
                                    handleFormatMenuClose(table.id)
                                  }
                                >
                                  <MenuItem
                                    disabled
                                    sx={{ fontSize: "0.85rem" }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{ fontWeight: 600 }}
                                    >
                                      Column 2: {table.headers.col2}
                                    </Typography>
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() =>
                                      toggleNumberFormat(table.id, 2)
                                    }
                                  >
                                    {table.columnNo?.includes(2)
                                      ? "✓ Format as Number"
                                      : "Format as Number"}
                                  </MenuItem>

                                  {table.columnCount === 3 && (
                                    <>
                                      <MenuItem
                                        disabled
                                        sx={{ fontSize: "0.85rem", mt: 1 }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          Column 3: {table.headers.col3}
                                        </Typography>
                                      </MenuItem>
                                      <MenuItem
                                        onClick={() =>
                                          toggleNumberFormat(table.id, 3)
                                        }
                                      >
                                        {table.columnNo?.includes(3)
                                          ? "✓ Format as Number"
                                          : "Format as Number"}
                                      </MenuItem>
                                    </>
                                  )}
                                </Menu>
                              </TableCell>
                              <TableCell sx={{ width: "100px" }} align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  <Tooltip title="Edit column names">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        startEditHeaders(
                                          table.id,
                                          table.headers,
                                          table.columnCount
                                        )
                                      }
                                      sx={{ color: "#fff" }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  {table.columnCount > 2 && (
                                    <Tooltip title="Delete Column 3">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          dispatch(deleteTableColumn({ tableId: table.id, colIndex: 3 }))
                                        }
                                        sx={{ color: "#fff" }}
                                      >
                                        <DeleteSweep fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Stack>
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
                                      table.columnNo?.includes(2)
                                        ? formatNumber(rowForm.col2)
                                        : rowForm.col2
                                    }
                                    onChange={(e) =>
                                      setRowForm({
                                        ...rowForm,
                                        col2: e.target.value,
                                      })
                                    }
                                  />
                                </TableCell>
                                {table.columnCount === 3 && (
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      fullWidth
                                      value={
                                        table.columnNo?.includes(3)
                                          ? formatNumber(rowForm.col3)
                                          : rowForm.col3
                                      }
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
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    justifyContent="center"
                                  >
                                    <Tooltip title="Save changes">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={saveEditRow}
                                      >
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
                                          });
                                          setRowForm({
                                            col1: "",
                                            col2: "",
                                            col3: "",
                                          });
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
                                <TableCell>
                                  {table.columnNo?.includes(2)
                                    ? formatNumber(row.col2)
                                    : row.col2}
                                </TableCell>
                                {table.columnCount === 3 && (
                                  <TableCell>
                                    {table.columnNo?.includes(3)
                                      ? formatNumber(row.col3)
                                      : row.col3}
                                  </TableCell>
                                )}
                                <TableCell colSpan={2} align="center">
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    justifyContent="center"
                                  >
                                    <Tooltip title="Edit this row">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          startEditRow(
                                            table.id,
                                            row,
                                            table.columnCount
                                          )
                                        }
                                        sx={{
                                          color: colorScheme.primary,
                                        }}
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
                                            })
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
        <Button
          variant="outlined"
          color="error"
          startIcon={<RefreshOutlined />}
          onClick={() => setResetOpen(true)}
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontWeight: 600,
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
            },
          }}
        >
          Reset All Data
        </Button>
      </Box>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmber color="error" /> Confirm Reset
        </DialogTitle>
        <DialogContent>
          <Typography>
            This will delete all sections and tables. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button onClick={handleReset} color="error" variant="contained">
            Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PdfPageEditor2;
