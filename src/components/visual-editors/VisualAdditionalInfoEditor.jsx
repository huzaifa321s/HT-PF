"use client";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, IconButton, Tooltip, Button, Menu, MenuItem,
  ToggleButtonGroup, ToggleButton, TextField, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack,
} from "@mui/material";
import {
  Add, Delete, Edit, FormatListNumbered, FormatListBulleted,
  Title, TextFields, TableChart, AddCircleOutline, PlaylistAdd, ContentPaste,
  AutoFixHigh, Article, FormatBold, FormatUnderlined,
} from "@mui/icons-material";
import {
  updateSection, addSection, deleteSection, restoreSection,
  addTable, addTableRow, updateTableRow, deleteTableRow,
  deleteTable, restoreTable, restoreTableRow, updateTableHeaders, addTableTitle,
  addMultipleRowsWithData, addMultipleSections,
} from "../../utils/page2Slice";
import { showToast } from "../../utils/toastSlice";
import debounce from "lodash.debounce";
import EditableText from "../EditableText";
import { HEADER_IMG, FOOTER_IMG } from "../../utils/pdfImageAssets";

const PAGE_HEIGHT = 1131;
const TOP_PADDING = 100;   // 50px header + 50px breathing room
const BOTTOM_PADDING = 80; // 60px footer + 20px margin

// ─── Floating Format Toolbar ──────────────────────────────────────────────────
const FloatingToolbar = ({ containerRef }) => {
  const [state, setState] = useState({ visible: false, top: 0, left: 0, bold: false, underline: false });
  const toolbarRef = useRef(null);

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setState((s) => ({ ...s, visible: false }));
        return;
      }
      const range = sel.getRangeAt(0);
      const container = containerRef?.current;
      if (!container || !container.contains(range.commonAncestorContainer)) {
        setState((s) => ({ ...s, visible: false }));
        return;
      }
      // Only show inside formattable elements
      const node = range.commonAncestorContainer;
      const formattable = (node.nodeType === 3 ? node.parentElement : node)?.closest('[data-formattable]');
      if (!formattable) { setState((s) => ({ ...s, visible: false })); return; }

      const rect = range.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      setState({
        visible: true,
        top: rect.top - cRect.top - 44,
        left: Math.min(Math.max(0, rect.left - cRect.left + rect.width / 2 - 130), cRect.width - 270),
        bold: document.queryCommandState('bold'),
        underline: document.queryCommandState('underline'),
      });
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [containerRef]);

  const exec = (cmd) => {
    document.execCommand(cmd, false, null);
    // update active states
    setState((s) => ({
      ...s,
      bold: document.queryCommandState('bold'),
      underline: document.queryCommandState('underline'),
    }));
  };

  const toggleList = (listType) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const node = sel.getRangeAt(0).commonAncestorContainer;
    const el = (node.nodeType === 3 ? node.parentElement : node)?.closest('[data-formattable]');
    if (!el) return;

    const lines = el.innerText.split('\n');
    const isBullet = lines.some((l) => /^[•\-]\s/.test(l.trim()));
    const isNum = lines.some((l) => /^\d+\.\s/.test(l.trim()));

    if (listType === 'bullet') {
      el.innerText = isBullet
        ? lines.map((l) => l.replace(/^\s*[•\-]\s?/, '')).join('\n')
        : lines.map((l, i) => (l.trim() ? `• ${l.replace(/^\s*[•\-]\s?|^\d+\.\s?/, '')}` : l)).join('\n');
    } else {
      el.innerText = isNum
        ? lines.map((l) => l.replace(/^\s*\d+\.\s?/, '')).join('\n')
        : lines.map((l, i) => (l.trim() ? `${i + 1}. ${l.replace(/^\s*[•\-]\s?|^\d+\.\s?/, '')}` : l)).join('\n');
    }
    // Fire input to save to redux
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  if (!state.visible) return null;

  const BtnStyle = (active) => ({
    minWidth: 32, height: 28, px: 0.5, py: 0,
    color: active ? '#f3a833' : '#ccc',
    bgcolor: active ? 'rgba(243,168,51,0.15)' : 'transparent',
    border: `1px solid ${active ? 'rgba(243,168,51,0.4)' : 'transparent'}`,
    borderRadius: '10px',
    fontSize: 12, fontWeight: 700,
    transition: 'all 0.12s',
    '&:hover': { bgcolor: 'rgba(243,168,51,0.2)', color: '#f3a833' },
  });

  return (
    <Box
      ref={toolbarRef}
      onMouseDown={(e) => e.preventDefault()}
      sx={{
        position: 'absolute',
        top: state.top,
        left: state.left,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 0.3,
        bgcolor: '#1c1c1c',
        border: '1px solid rgba(243,168,51,0.25)',
        borderRadius: '10px',
        px: 0.8, py: 0.5,
        boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.1s ease',
        '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }}
    >
      <Tooltip title="Bold (Ctrl+B)">
        <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} sx={BtnStyle(state.bold)}>
          <FormatBold sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline (Ctrl+U)">
        <IconButton size="small" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')} sx={BtnStyle(state.underline)}>
          <FormatUnderlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// ─── Inline-editable table cell ────────────────────────────────────────────
const EditCell = ({ value, onChange, isHeader, isStudioMode }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value || "";
    }
  }, [value]);

  return (
    <Box
      ref={ref}
      contentEditable={isStudioMode}
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.innerText)}
      sx={{
        outline: "none",
        px: 1, py: 0.5,
        fontSize: isHeader ? 14 : 13,
        fontWeight: isHeader ? 700 : 400,
        color: isHeader ? "#fff" : "#1a1a1a",
        minWidth: 40,
        width: "100%",
        wordBreak: "break-word",
        borderBottom: isStudioMode ? "1px dashed transparent" : "none",
        "&:hover, &:focus": isStudioMode ? { borderBottom: "1px dashed rgba(243,168,51,0.5)", bgcolor: "rgba(243,168,51,0.06)", borderRadius: '10px' } : {},
      }}
    />
  );
};

// ─── Bulk Add Dialog ────────────────────────────────────────────────────────
const BulkAddDialog = ({ open, onClose, table, dispatch }) => {
  const [rawText, setRawText] = useState("");
  const is3 = table.columnCount === 3;
  const cols = is3 ? ["col1", "col2", "col3"] : ["col1", "col2"];

  const parseRows = (text) => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Support comma, tab, or semicolon as delimiter
        const parts = line.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)|;/).map((p) => p.replace(/^"|"$/g, "").trim());
        const row = {};
        cols.forEach((col, i) => { row[col] = parts[i] || ""; });
        return row;
      });
  };

  const preview = parseRows(rawText);

  const handleConfirm = () => {
    if (preview.length === 0) return;
    dispatch(addMultipleRowsWithData({ tableId: table.id, rows: preview }));
    dispatch(showToast({ message: `${preview.length} rows added successfully`, severity: "success" }));
    setRawText("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { bgcolor: "#0f0f0f", border: "1px solid rgba(243,168,51,0.2)", borderRadius: '10px' } }}>
      <DialogTitle sx={{ color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.08)", pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PlaylistAdd sx={{ color: "#f3a833", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1 }}>Bulk Add Rows</Typography>
            <Typography variant="caption" sx={{ color: "#888" }}>Paste data — one row per line, columns separated by comma, tab, or semicolon</Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Column Hint */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: "#888", alignSelf: "center" }}>Columns expected:</Typography>
          {cols.map((col, i) => (
            <Chip key={col} label={table.headers[col] || `Col ${i + 1}`}
              size="small"
              sx={{ bgcolor: "rgba(243,168,51,0.15)", color: "#f3a833", border: "1px solid rgba(243,168,51,0.3)", fontWeight: 600, fontSize: 11 }} />
          ))}
        </Stack>

        {/* Paste Area */}
        <TextField
          multiline
          minRows={6}
          maxRows={14}
          fullWidth
          placeholder={is3
            ? `Website Design, 85000, 2 weeks\nMobile App, 180000, 6 weeks\nLogo Design, 35000, 1 week`
            : `Website Design, 85000\nMobile App, 180000\nLogo Design, 35000`}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          InputProps={{ sx: { fontFamily: "monospace", fontSize: 13, color: "#e0e0e0", bgcolor: "#1a1a1a", borderRadius: '10px' } }}
          sx={{ mb: 3, "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(243,168,51,0.3)" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#f3a833" }, "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#f3a833" } }}
        />

        {/* Live Preview */}
        {preview.length > 0 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Preview</Typography>
              <Chip label={`${preview.length} rows`} size="small" sx={{ bgcolor: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", fontSize: 10 }} />
            </Box>
            <Box sx={{ border: "1px solid #2a2a2a", borderRadius: '10px', overflow: "hidden", maxHeight: 240, overflowY: "auto" }}>
              {/* Preview Header */}
              <Box sx={{ display: "flex", bgcolor: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}>
                {cols.map((col) => (
                  <Box key={col} sx={{ flex: 1, px: 1.5, py: 0.8, fontSize: 11, fontWeight: 700, color: "#f3a833", borderRight: "1px solid #2a2a2a" }}>
                    {table.headers[col] || col}
                  </Box>
                ))}
              </Box>
              {/* Preview Rows */}
              {preview.map((row, i) => (
                <Box key={i} sx={{ display: "flex", borderBottom: i < preview.length - 1 ? "1px solid #1e1e1e" : "none", bgcolor: i % 2 === 0 ? "#111" : "#141414" }}>
                  {cols.map((col) => (
                    <Box key={col} sx={{ flex: 1, px: 1.5, py: 0.7, fontSize: 11, color: row[col] ? "#e0e0e0" : "#555", borderRight: "1px solid #1e1e1e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row[col] || "—"}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Button onClick={() => { setRawText(""); onClose(); }}
          sx={{ color: "#888", "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={preview.length === 0}
          onClick={handleConfirm}
          startIcon={<PlaylistAdd />}
          sx={{ bgcolor: "#f3a833", color: "#000", fontWeight: 700, px: 3, "&:hover": { bgcolor: "#e09520" }, "&:disabled": { bgcolor: "rgba(243,168,51,0.2)", color: "rgba(0,0,0,0.3)" } }}>
          Add {preview.length > 0 ? `${preview.length} Rows` : "Rows"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Smart Content Parser ──────────────────────────────────────────────────
const TYPE_META = {
  heading:  { label: "Heading",       color: "#a78bfa", bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.3)" },
  title:    { label: "Section Title", color: "#f3a833", bg: "rgba(243,168,51,0.15)",  border: "rgba(243,168,51,0.3)" },
  bullets:  { label: "Bullet List",   color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)" },
  numbered: { label: "Numbered List", color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.3)" },
  plain:    { label: "Plain Text",    color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)" },
};

const detectSectionType = (block) => {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  const firstLine = lines[0];

  // Markdown heading
  if (/^#{1,3}\s/.test(firstLine)) {
    return { type: "heading", title: firstLine.replace(/^#+\s*/, ""), content: lines.slice(1).join("\n") };
  }

  // ALL CAPS short line = heading
  if (firstLine === firstLine.toUpperCase() && firstLine.length < 80 && firstLine.length > 3 && !/[.?!,]$/.test(firstLine) && lines.length === 1) {
    return { type: "heading", title: firstLine, content: "" };
  }

  // All lines are bullets (•, -, *, –)
  const bulletPattern = /^[•\-\*–>]/;
  const isBullets = lines.every((l) => bulletPattern.test(l));
  if (isBullets) {
    return { type: "bullets", title: "Bullet List", content: lines.join("\n") };
  }

  // All lines are numbered (1. 2. a. etc)
  const numPattern = /^(\d+[.):]|[a-z][.):])/i;
  const isNumbered = lines.every((l) => numPattern.test(l));
  if (isNumbered) {
    return { type: "numbered", title: "Numbered List", content: lines.join("\n") };
  }

  // Mixed: first line short non-sentence = title, rest = content
  if (lines.length > 1 && firstLine.length < 70 && !/[.!?]$/.test(firstLine) && !bulletPattern.test(firstLine)) {
    const rest = lines.slice(1);
    const restIsBullets = rest.every((l) => bulletPattern.test(l));
    const restIsNumbered = rest.every((l) => numPattern.test(l));
    if (restIsBullets) return { type: "bullets",  title: firstLine, content: rest.join("\n") };
    if (restIsNumbered) return { type: "numbered", title: firstLine, content: rest.join("\n") };
    return { type: "title", title: firstLine, content: rest.join("\n") };
  }

  // Default — plain paragraph
  return { type: "plain", title: "", content: lines.join("\n") };
};

const parseContent = (raw) => {
  // Split on 2+ newlines (paragraph break) or lines that look like headings
  const blocks = raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const sections = blocks.map((block) => detectSectionType(block)).filter(Boolean);
  return sections.map((s, i) => ({ ...s, _id: i }));
};

// ─── Smart Paste Dialog ────────────────────────────────────────────────────
const SmartPasteDialog = ({ open, onClose, dispatch }) => {
  const [rawText, setRawText] = useState("");
  const [sections, setSections] = useState([]);
  const [parsed, setParsed] = useState(false);

  const handleParse = () => {
    const result = parseContent(rawText);
    setSections(result);
    setParsed(true);
  };

  const handleTypeChange = (_id, newType) => {
    setSections((prev) => prev.map((s) => s._id === _id ? { ...s, type: newType } : s));
  };

  const handleDelete = (_id) => {
    setSections((prev) => prev.filter((s) => s._id !== _id));
  };

  const handleConfirm = () => {
    if (!sections.length) return;
    dispatch(addMultipleSections(sections.map(({ type, title, content }) => ({ type, title, content }))));
    dispatch(showToast({ message: `${sections.length} sections added successfully`, severity: "success" }));
    setRawText("");
    setSections([]);
    setParsed(false);
    onClose();
  };

  const handleClose = () => {
    setRawText(""); setSections([]); setParsed(false); onClose();
  };

  const TYPES = Object.keys(TYPE_META);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { bgcolor: "#0d0d0d", border: "1px solid rgba(167,139,250,0.25)", borderRadius: '10px', minHeight: "80vh" } }}>
      <DialogTitle sx={{ borderBottom: "1px solid rgba(255,255,255,0.07)", pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AutoFixHigh sx={{ color: "#a78bfa", fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1 }}>Smart Paste & Auto-Structure</Typography>
            <Typography variant="caption" sx={{ color: "#888" }}>Paste any content — headings, lists, paragraphs — and it will be parsed and structured automatically</Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
        {/* LEFT: Paste Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", mb: 1 }}>Paste Content Here</Typography>
          <TextField
            multiline
            minRows={14}
            maxRows={28}
            fullWidth
            placeholder={`Paste any content here. Examples:\n\n# Scope of Work\n\nProject Brief\nWe will deliver a complete website...\n\n• Item 1\n• Item 2\n• Item 3\n\n1. Step one\n2. Step two\n3. Step three`}
            value={rawText}
            onChange={(e) => { setRawText(e.target.value); setParsed(false); }}
            InputProps={{ sx: { fontFamily: "monospace", fontSize: 12.5, color: "#e0e0e0", bgcolor: "#141414", borderRadius: '10px', alignItems: "flex-start" } }}
            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(167,139,250,0.3)" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" }, "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" } }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleParse}
            disabled={!rawText.trim()}
            startIcon={<AutoFixHigh />}
            sx={{ mt: 1.5, bgcolor: "#a78bfa", color: "#000", fontWeight: 700, "&:hover": { bgcolor: "#9061ea" }, "&:disabled": { bgcolor: "rgba(167,139,250,0.2)", color: "rgba(0,0,0,0.3)" } }}
          >
            Auto-Parse Content
          </Button>
        </Box>

        {/* DIVIDER */}
        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* RIGHT: Parsed Preview */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Detected Sections</Typography>
            {parsed && sections.length > 0 && (
              <Chip label={`${sections.length} sections`} size="small" sx={{ bgcolor: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", fontSize: 10 }} />
            )}
          </Box>

          {!parsed && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 2, opacity: 0.4 }}>
              <AutoFixHigh sx={{ fontSize: 56, color: "#a78bfa" }} />
              <Typography sx={{ color: "#888", fontSize: 13 }}>Paste content and click Auto-Parse to see detected sections</Typography>
            </Box>
          )}

          {parsed && sections.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography sx={{ color: "#f44336", fontSize: 13 }}>No sections detected. Try adding paragraph breaks (blank lines) between sections.</Typography>
            </Box>
          )}

          {sections.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 420, overflowY: "auto", pr: 0.5 }}>
              {sections.map((sec) => {
                const meta = TYPE_META[sec.type] || TYPE_META.plain;
                return (
                  <Box key={sec._id}
                    sx={{ bgcolor: "#141414", border: `1px solid ${meta.border}`, borderRadius: '10px', p: 1.5, position: "relative", "&:hover .sp-del": { opacity: 1 } }}>
                    {/* Type Selector Row */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1, flexWrap: "wrap" }}>
                      {TYPES.map((t) => {
                        const tm = TYPE_META[t];
                        const active = sec.type === t;
                        return (
                          <Box key={t}
                            onClick={() => handleTypeChange(sec._id, t)}
                            sx={{
                              px: 1, py: 0.3, borderRadius: '10px', fontSize: 10, fontWeight: 700, cursor: "pointer",
                              border: `1px solid ${active ? tm.border : "rgba(255,255,255,0.08)"}`,
                              bgcolor: active ? tm.bg : "transparent",
                              color: active ? tm.color : "#555",
                              transition: "all 0.15s",
                              "&:hover": { bgcolor: tm.bg, color: tm.color, border: `1px solid ${tm.border}` },
                            }}
                          >
                            {tm.label}
                          </Box>
                        );
                      })}
                      <Box sx={{ flex: 1 }} />
                      <IconButton className="sp-del" size="small"
                        onClick={() => handleDelete(sec._id)}
                        sx={{ opacity: 0, transition: "opacity 0.2s", color: "#f44336", p: 0.3, "&:hover": { bgcolor: "rgba(244,67,54,0.1)" } }}>
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>

                    {/* Content Preview */}
                    {sec.title && (
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: meta.color, mb: 0.5, lineHeight: 1.3 }}>
                        {sec.title}
                      </Typography>
                    )}
                    {sec.content && (
                      <Typography sx={{ fontSize: 11, color: "#888", whiteSpace: "pre-wrap", lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {sec.content}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Button onClick={handleClose} sx={{ color: "#888", "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}>Cancel</Button>
        <Button
          variant="contained"
          disabled={sections.length === 0}
          onClick={handleConfirm}
          startIcon={<Article />}
          sx={{ bgcolor: "#a78bfa", color: "#000", fontWeight: 700, px: 3, "&:hover": { bgcolor: "#9061ea" }, "&:disabled": { bgcolor: "rgba(167,139,250,0.2)", color: "rgba(0,0,0,0.3)" } }}
        >
          Add {sections.length > 0 ? `${sections.length} Sections` : "Sections"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


const TableBlock = React.memo(({ table, isStudioMode, isThumbnail, dispatch, onHeightChange, calculatedMargin }) => {
  const blockRef = useRef(null);
  useEffect(() => {
    if (!blockRef.current || !onHeightChange) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        onHeightChange(table.id, entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height);
      }
    });
    observer.observe(blockRef.current);
    return () => observer.disconnect();
  }, [table.id, onHeightChange]);
  const is3 = table.columnCount === 3;
  const [bulkOpen, setBulkOpen] = useState(false);

  const updateHeader = (col, val) =>
    dispatch(updateTableHeaders({ tableId: table.id, [col]: val }));

  const updateCell = (rowId, col, val) =>
    dispatch(updateTableRow({ tableId: table.id, rowId, [col]: val }));

  const handleDeleteRow = (rowId, rowIndex) => {
    const row = table.rows.find((r) => r.id === rowId);
    dispatch(deleteTableRow({ tableId: table.id, rowId }));
    dispatch(showToast({
      message: "Row deleted",
      severity: "info",
      undoAction: restoreTableRow({ tableId: table.id, row, index: rowIndex }),
    }));
  };

  const handleDeleteTable = () => {
    const idx = 0; // Undo by index not critical here
    dispatch(deleteTable(table.id));
    dispatch(showToast({
      message: "Table deleted",
      severity: "info",
      undoAction: restoreTable({ table, index: idx }),
    }));
  };

  const colFlex = is3 ? [2, 2, 1] : [1, 1];

  return (
    <Box ref={blockRef} sx={{ position: "absolute", top: `${calculatedMargin !== undefined ? calculatedMargin : 24}px`, left: "60px", right: "60px", "&:hover .tbl-del": { opacity: 1 } }}>
      {/* Table Title */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Box
          contentEditable={isStudioMode}
          suppressContentEditableWarning
          onBlur={(e) => dispatch(addTableTitle({ id: table.id, title: e.currentTarget.innerText }))}
          sx={{
            fontSize: 17, fontWeight: 700, color: "#1a1a1a", outline: "none", flex: 1,
            borderBottom: isStudioMode ? "1px dashed transparent" : "none",
            "&:hover, &:focus": isStudioMode ? { borderBottom: "1px dashed #f3a833", bgcolor: "rgba(243,168,51,0.05)", borderRadius: '10px' } : {},
          }}
        >
          {table.title || "Table Title"}
        </Box>
        {isStudioMode && table.isAiGenerated && (
          <Chip
            icon={<AutoFixHigh fontSize="small" sx={{ color: "#a78bfa !important" }} />}
            label="AI Generated"
            size="small"
            sx={{ bgcolor: "rgba(167,139,250,0.1)", color: "#a78bfa", fontWeight: 600, border: "1px solid rgba(167,139,250,0.2)", height: 24 }}
          />
        )}
        {isStudioMode && !isThumbnail && (
          <Tooltip title="Delete Table">
            <IconButton
              className="tbl-del"
              onClick={handleDeleteTable}
              size="small"
              sx={{ opacity: 0, transition: "opacity 0.2s", bgcolor: "rgba(244,67,54,0.1)", color: "#f44336", "&:hover": { bgcolor: "rgba(244,67,54,0.2)" } }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Table Grid */}
      <Box sx={{ border: "1px solid #ddd", borderRadius: '10px', overflow: "hidden" }}>
        {/* Header Row */}
        <Box sx={{ display: "flex", bgcolor: "#000" }}>
          {["col1", "col2", ...(is3 ? ["col3"] : [])].map((col, ci) => (
            <Box key={col} sx={{ flex: colFlex[ci], borderRight: ci < (is3 ? 2 : 1) ? "1px solid #333" : "none", py: 1, px: 1 }}>
              <EditCell
                value={table.headers[col]}
                onChange={(v) => updateHeader(col, v)}
                isHeader
                isStudioMode={isStudioMode}
              />
            </Box>
          ))}
          {isStudioMode && !isThumbnail && <Box sx={{ width: 32, bgcolor: "#111" }} />}
        </Box>

        {/* Data Rows */}
        {table.rows.map((row, ri) => (
          <Box
            key={row.id}
            sx={{ display: "flex", borderBottom: ri < table.rows.length - 1 ? "1px solid #e0e0e0" : "none", bgcolor: ri % 2 === 0 ? "#fff" : "#f9f9f9", "&:hover .row-del": { opacity: 1 } }}
          >
            {["col1", "col2", ...(is3 ? ["col3"] : [])].map((col, ci) => (
              <Box key={col} sx={{ flex: colFlex[ci], borderRight: ci < (is3 ? 2 : 1) ? "1px solid #eee" : "none", py: 0.5, px: 1 }}>
                <EditCell
                  value={row[col]}
                  onChange={(v) => updateCell(row.id, col, v)}
                  isHeader={false}
                  isStudioMode={isStudioMode}
                />
              </Box>
            ))}
            {isStudioMode && !isThumbnail && (
              <Box sx={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconButton
                  className="row-del"
                  size="small"
                  onClick={() => handleDeleteRow(row.id, ri)}
                  sx={{ opacity: 0, transition: "opacity 0.2s", color: "#f44336", p: 0.25, "&:hover": { bgcolor: "rgba(244,67,54,0.1)" } }}
                >
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Add Row + Bulk Add Buttons */}
      {isStudioMode && !isThumbnail && (
        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
          <Button
            size="small"
            startIcon={<AddCircleOutline sx={{ fontSize: 14 }} />}
            onClick={() => dispatch(addTableRow(table.id))}
            sx={{ color: "#f3a833", borderColor: "#f3a833", borderStyle: "dashed", fontSize: 11, textTransform: "none", py: 0.3 }}
            variant="outlined"
          >
            Add Row
          </Button>
          <Button
            size="small"
            startIcon={<PlaylistAdd sx={{ fontSize: 16 }} />}
            onClick={() => setBulkOpen(true)}
            sx={{ color: "#a78bfa", borderColor: "#a78bfa", borderStyle: "dashed", fontSize: 11, textTransform: "none", py: 0.3, "&:hover": { bgcolor: "rgba(167,139,250,0.08)" } }}
            variant="outlined"
          >
            Bulk Add Rows
          </Button>
        </Box>
      )}
      <BulkAddDialog open={bulkOpen} onClose={() => setBulkOpen(false)} table={table} dispatch={dispatch} />
    </Box>
  );
}, (prev, next) =>
  prev.table === next.table &&
  prev.calculatedMargin === next.calculatedMargin &&
  prev.isStudioMode === next.isStudioMode
);

// ─── Per-Section Format Toolbar ───────────────────────────────────────────────
const SectionToolbar = ({ contentRef }) => {
  const [active, setActive] = useState({ bold: false, underline: false });

  // Detect active formats — queryCommandState matches execCommand output
  const updateActive = () => {
    setActive({
      bold:      document.queryCommandState('bold'),
      underline: document.queryCommandState('underline'),
    });
  };

  // Apply or remove inline format using the Selection Range API (replaces deprecated execCommand)
  // Bold = 'bold', Underline = 'underline'
  const applyFormat = (cmd) => {
    const el = contentRef.current;
    if (!el) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;

    // 1. Clone the range BEFORE focus (focus can collapse it)
    const savedRange = range.cloneRange();

    // 2. Focus the element so execCommand runs in the right context
    el.focus();

    // 3. Restore the saved selection
    const restoredSel = window.getSelection();
    restoredSel.removeAllRanges();
    restoredSel.addRange(savedRange);

    // 4. Execute the command (bold / underline)
    document.execCommand(cmd, false, null);

    // 5. Save new innerHTML to Redux
    el.dispatchEvent(new Event('input', { bubbles: true }));
    setTimeout(updateActive, 0);
  };

  const toggleList = (listType) => {
    const el = contentRef.current;
    if (!el) return;
    const lines = el.innerText.split('\n');
    const isBullet = lines.some((l) => /^[•\-]\s/.test(l.trim()));
    const isNum   = lines.some((l) => /^\d+\.\s/.test(l.trim()));
    if (listType === 'bullet') {
      el.innerText = isBullet
        ? lines.map((l) => l.replace(/^\s*[•\-]\s?/, '')).join('\n')
        : lines.map((l) => l.trim() ? `• ${l.replace(/^\s*[•\-]\s?|^\d+\.\s?/, '')}` : l).join('\n');
    } else {
      el.innerText = isNum
        ? lines.map((l) => l.replace(/^\s*\d+\.\s?/, '')).join('\n')
        : lines.map((l, i) => l.trim() ? `${i + 1}. ${l.replace(/^\s*[•\-]\s?|^\d+\.\s?/, '')}` : l).join('\n');
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const Btn = ({ title, onClick, icon, isActive }) => (

    <Tooltip title={title} placement="top">
      <IconButton
        size="small"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        sx={{
          width: 26, height: 26, p: 0,
          color: isActive ? '#f3a833' : '#555',
          bgcolor: isActive ? 'rgba(243,168,51,0.12)' : 'transparent',
          borderRadius: '10px',
          border: `1px solid ${isActive ? 'rgba(243,168,51,0.3)' : 'transparent'}`,
          '&:hover': { bgcolor: 'rgba(243,168,51,0.15)', color: '#f3a833', border: '1px solid rgba(243,168,51,0.3)' },
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      className="section-toolbar"
      onFocus={updateActive}
      sx={{
        position: 'absolute', top: 0, right: 0,
        display: 'flex', alignItems: 'center', gap: 0.4,
        bgcolor: '#f7f7f7',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        px: 0.6, py: 0.3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        opacity: 0,
        transition: 'opacity 0.15s ease',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      <Btn title="Bold"      onClick={() => applyFormat('bold')}      icon={<FormatBold sx={{ fontSize: 14 }} />}       isActive={active.bold} />
      <Btn title="Underline" onClick={() => applyFormat('underline')} icon={<FormatUnderlined sx={{ fontSize: 14 }} />} isActive={active.underline} />
      <Box sx={{ width: '1px', height: 16, bgcolor: '#ddd', mx: 0.3 }} />
      <Btn title="Toggle Bullet List"   onClick={() => toggleList('bullet')}   icon={<FormatListBulleted sx={{ fontSize: 14 }} />}  isActive={false} />
      <Btn title="Toggle Numbered List" onClick={() => toggleList('numbered')} icon={<FormatListNumbered sx={{ fontSize: 14 }} />} isActive={false} />
    </Box>
  );
};

// ─── Section Item ─────────────────────────────────────────────────────────────
const SectionItem = React.memo(({ section, index, isLast, isStudioMode, isThumbnail, absoluteTop, onHeightChange, handleInput, dispatch }) => {
  const ref = useRef(null);
  const contentRef = useRef(null);
  const [typeAnchor, setTypeAnchor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        onHeightChange(section.id, entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height);
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [section.id, onHeightChange]);

  const isHeading = section.type === "heading";
  const isTitle = section.type === "title";

  return (
    <Box
      ref={ref}
      sx={{
        position: "absolute",
        top: `${absoluteTop}px`,
        left: 0,
        right: 0,
        paddingX: "60px",
        "&:hover .action-btns": { opacity: 1 },
        "& .action-btns.menu-open": { opacity: 1 },
        "&:hover .section-toolbar": { opacity: 1 },
      }}
    >
      {isStudioMode && !isThumbnail && (
        <>
          {section.isAiGenerated && (
            <Chip
              icon={<AutoFixHigh fontSize="small" sx={{ color: "#a78bfa !important" }} />}
              label="AI Generated"
              size="small"
              sx={{ position: "absolute", right: 20, top: isHeading ? -10 : -15, bgcolor: "rgba(167,139,250,0.1)", color: "#a78bfa", fontWeight: 600, border: "1px solid rgba(167,139,250,0.2)", zIndex: 2 }}
            />
          )}

          {/* Action Buttons Container */}
          <Box 
            className={`action-btns ${Boolean(typeAnchor) ? 'menu-open' : ''}`}
            sx={{
              position: "absolute", left: 6, top: isHeading ? 4 : 0,
              display: "flex", flexDirection: "row", gap: "6px",
              opacity: 0,
              transition: "opacity 0.2s",
              zIndex: 30,
            }}
          >
            <Tooltip title="Delete Section">
              <IconButton
                onClick={() => {
                  dispatch(deleteSection(section.id));
                  dispatch(showToast({ message: "Section deleted", severity: "info", undoAction: restoreSection({ section, index }) }));
                }}
                sx={{ width: 26, height: 26, p: 0, bgcolor: "rgba(244,67,54,0.1)", color: "#f44336", borderRadius: '6px', "&:hover": { bgcolor: "rgba(244,67,54,0.2)" } }}
              >
                <Delete sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Change Section Type">
              <IconButton
                onClick={(e) => setTypeAnchor(e.currentTarget)}
                sx={{ width: 26, height: 26, p: 0, bgcolor: "rgba(243,168,51,0.1)", color: "#f3a833", borderRadius: '6px', "&:hover": { bgcolor: "rgba(243,168,51,0.2)" } }}
              >
                <Edit sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={typeAnchor}
            open={Boolean(typeAnchor)}
            onClose={() => setTypeAnchor(null)}
            PaperProps={{ sx: { bgcolor: "#1a1a1a", border: "1px solid rgba(243,168,51,0.2)", color: "#fff", borderRadius: '8px' } }}
          >
            {Object.entries(TYPE_META).map(([typeKey, meta]) => (
              <MenuItem
                key={typeKey}
                onClick={() => {
                  dispatch(updateSection({ id: section.id, type: typeKey }));
                  setTypeAnchor(null);
                }}
                sx={{
                  fontSize: 13,
                  bgcolor: section.type === typeKey ? "rgba(243,168,51,0.15)" : "transparent",
                  color: meta.color,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                {meta.label}
              </MenuItem>
            ))}
          </Menu>
          {!isHeading && <SectionToolbar contentRef={contentRef} />}
        </>
      )}

      {/* ── Heading type: large title + thick bottom border (like "Deliverables", "Timeline", "Pricing") ── */}
      {isHeading && (
        <Box sx={{
          borderBottom: "2px solid #1a1a1a",
          mb: "16px",
          pb: "6px",
        }}>
          <EditableText
            value={section.title}
            isStudioMode={isStudioMode}
            onInput={(e) => handleInput(section.id, "title", e)}
            sx={{
              fontSize: 28, fontWeight: "bold", color: "#1a1a1a",
              textAlign: "left", outline: "none", wordBreak: "break-word",
              border: isStudioMode ? "1px dashed transparent" : "none",
              "&:hover, &:focus": isStudioMode ? { border: "1px dashed #f3a833", bgcolor: "rgba(243,168,51,0.05)", borderRadius: '10px' } : {},
            }}
          />
        </Box>
      )}

      {/* ── Title type: medium sub-heading (like "Monthly Deliverables", "Initial Setup Phase") ── */}
      {isTitle && (
        <EditableText
          value={section.title}
          isStudioMode={isStudioMode}
          onInput={(e) => handleInput(section.id, "title", e)}
          sx={{
            fontSize: 20, fontWeight: "bold", color: "#1a1a1a",
            textAlign: section.titleAlign || "left", outline: "none", wordBreak: "break-word", mb: "8px",
            border: isStudioMode ? "1px dashed transparent" : "none",
            "&:hover, &:focus": isStudioMode ? { border: "1px dashed #f3a833", bgcolor: "rgba(243,168,51,0.05)", borderRadius: '10px' } : {},
          }}
        />
      )}

      {/* ── Plain type: no title ── */}
      {section.type === "plain" && section.title && (
        <EditableText
          value={section.title}
          isStudioMode={isStudioMode}
          onInput={(e) => handleInput(section.id, "title", e)}
          sx={{
            fontSize: 16, fontWeight: 600, color: "#555",
            textAlign: "left", outline: "none", wordBreak: "break-word", mb: "6px",
            border: isStudioMode ? "1px dashed transparent" : "none",
            "&:hover, &:focus": isStudioMode ? { border: "1px dashed #f3a833", bgcolor: "rgba(243,168,51,0.05)", borderRadius: '10px' } : {},
          }}
        />
      )}

      {/* ── Content: render HTML properly (bullet lists, bold, sub-headings) ── */}
      {!isHeading && (
        <EditableText
          ref={contentRef}
          value={section.content}
          useHtml
          isStudioMode={isStudioMode}
          data-formattable="true"
          onInput={(e) => handleInput(section.id, "content", e)}
          sx={{
            fontSize: 15, lineHeight: 1.8, color: "#4a4a4a", textAlign: section.contentAlign || "left",
            outline: "none", minHeight: "20px", wordBreak: "break-word",
            border: isStudioMode ? "1px dashed transparent" : "none",
            "&:hover, &:focus": isStudioMode ? { border: "1px dashed #f3a833", bgcolor: "rgba(243,168,51,0.05)", borderRadius: '10px' } : {},
            // Proper HTML rendering for bullet lists, headings inside content
            "& ul": { paddingLeft: "20px", margin: "4px 0" },
            "& ol": { paddingLeft: "20px", margin: "4px 0" },
            "& li": { marginBottom: "4px", lineHeight: 1.7 },
            "& h2": { fontSize: "18px", fontWeight: "bold", color: "#1a1a1a", margin: "10px 0 6px" },
            "& h3": { fontSize: "16px", fontWeight: "bold", color: "#1a1a1a", margin: "8px 0 4px" },
            "& h4": { fontSize: "15px", fontWeight: "bold", color: "#333", margin: "6px 0 3px" },
            "& p": { margin: "0 0 8px" },
            "& strong": { fontWeight: "bold" },
          }}
        />
      )}

      {!isLast && !isHeading && <Box sx={{ width: "100%", height: "1px", backgroundColor: "#eee", mt: "28px" }} />}
    </Box>
  );
}, (prev, next) =>
  prev.section === next.section &&
  prev.absoluteTop === next.absoluteTop &&
  prev.isStudioMode === next.isStudioMode &&
  prev.isLast === next.isLast
);


// ─── Main Editor ───────────────────────────────────────────────────────────
const VisualAdditionalInfoEditor = ({ isStudioMode = true, isThumbnail = false, onPageCountChange, pageIdPrefix = "Additional Info" }) => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state) => state.page2.currentMode || "create");
  const page2 = useSelector((state) => state.page2[currentMode] || state.page2);
  const orderedSections = page2.orderedSections || [];
  const tables = page2.tables || [];

  const GAP = isStudioMode ? 40 : 0;
  const CYCLE = PAGE_HEIGHT + GAP;

  const [addAnchor, setAddAnchor] = useState(null);
  const [sectionHeights, setSectionHeights] = useState({});
  const [tableHeights, setTableHeights] = useState({});
  const [smartPasteOpen, setSmartPasteOpen] = useState(false);

  const handleTableHeightChange = useCallback((id, height) => {
    setTableHeights((prev) => {
      if (Math.abs((prev[id] || 0) - height) < 2) return prev;
      return { ...prev, [id]: height };
    });
  }, []);

  const debouncedUpdateSection = useCallback(
    debounce((id, field, value) => dispatch(updateSection({ id, [field]: value })), 500),
    [dispatch]
  );

  // handleInput: save innerHTML for content (preserves bold/italic), innerText for title
  const handleInput = (id, field, e) => {
    const val = field === 'content' ? e.currentTarget.innerHTML : e.currentTarget.innerText;
    debouncedUpdateSection(id, field, val);
  };

  const handleHeightChange = useCallback((id, height) => {
    setSectionHeights((prev) => {
      if (Math.abs((prev[id] || 0) - height) < 2) return prev;
      return { ...prev, [id]: height };
    });
  }, []);

  const handleAddSection = (type) => {
    const defaults = {
      heading:  { title: "Section Heading",    content: "" },
      title:    { title: "Sub-Section Title",  content: "<p>Start typing your content here...</p>" },
      bullets:  { title: "Bullet List",        content: "<ul><li>First point</li><li>Second point</li><li>Third point</li></ul>" },
      numbered: { title: "Numbered List",      content: "<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>" },
      plain:    { title: "",                   content: "<p>Plain text paragraph without a title...</p>" },
    };
    const d = defaults[type] || defaults.title;
    dispatch(addSection({ type, ...d }));
    setAddAnchor(null);
  };

  const handleAddTable = (columnCount) => {
    dispatch(addTable({ columnCount }));
    setAddAnchor(null);
  };

  // Helper: if currentY is in the gap between pages, snap it to the start of the next page
  const snapToPageStart = (y) => {
    const pg = Math.floor(y / CYCLE);
    const pageBottom = pg * CYCLE + PAGE_HEIGHT; // where the white page ends
    if (y >= pageBottom) {
      // We're in the inter-page gap — snap forward
      return (pg + 1) * CYCLE + TOP_PADDING;
    }
    return y;
  };

  let maxPageIndex = 0;
  // Compute absolute Y positions (not cumulative margins) to avoid drift on cloned pages
  let currentY = TOP_PADDING;
  const absoluteTops = {}; // absolute top for each section
  orderedSections.forEach((sec, idx) => {
    const h = sectionHeights[sec.id] || 60;

    // Snap out of inter-page gap before calculations
    currentY = snapToPageStart(currentY);

    const pageIndex = Math.floor(currentY / CYCLE);
    const pageContentBottom = pageIndex * CYCLE + PAGE_HEIGHT - BOTTOM_PADDING;
    const spaceLeft = pageContentBottom - currentY;

    if (idx === 0) {
      absoluteTops[sec.id] = TOP_PADDING;
      currentY = TOP_PADDING + h + 28;
    } else {
      if (spaceLeft < h) {
        // Push to next page
        const nextY = (pageIndex + 1) * CYCLE + TOP_PADDING;
        absoluteTops[sec.id] = nextY;
        currentY = nextY + h + 28;
        maxPageIndex = Math.max(maxPageIndex, pageIndex + 1);
      } else {
        absoluteTops[sec.id] = currentY;
        currentY = currentY + h + 28;
      }
    }
    maxPageIndex = Math.max(maxPageIndex, Math.floor(currentY / CYCLE));
  });

  // ── Table absolute top positions (continues from where sections left off) ──
  const tableAbsoluteTops = {};
  tables.forEach((table) => {
    const h = tableHeights[table.id] || 250;

    // Snap out of inter-page gap before calculations
    currentY = snapToPageStart(currentY);

    const pageIndex = Math.floor(currentY / CYCLE);
    const pageContentBottom = pageIndex * CYCLE + PAGE_HEIGHT - BOTTOM_PADDING;
    const spaceLeft = pageContentBottom - currentY;

    if (spaceLeft < h) {
      const nextY = (pageIndex + 1) * CYCLE + TOP_PADDING;
      tableAbsoluteTops[table.id] = nextY;
      currentY = nextY + h + 24;
      maxPageIndex = Math.max(maxPageIndex, pageIndex + 1);
    } else {
      tableAbsoluteTops[table.id] = currentY + 24;
      currentY = currentY + h + 24;
      maxPageIndex = Math.max(maxPageIndex, pageIndex);
    }
  });

  // Derive totalPages strictly from where content actually ends — no extra blank pages
  let lastContentY = Math.max(currentY - 28, TOP_PADDING);
  const derivedPages = Math.floor(lastContentY / CYCLE) + 1;
  const totalPages = Math.max(1, Math.min(derivedPages, maxPageIndex + 1));
  
  // Extend container height in studio mode so the buttons are visible, without generating phantom pages
  const exactContainerHeight = totalPages * PAGE_HEIGHT + (totalPages - 1) * GAP + (isStudioMode ? 120 : 0);



  useEffect(() => {
    if (onPageCountChange) onPageCountChange(totalPages);
  }, [totalPages, onPageCountChange]);

  const foregroundRef = useRef(null);

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: "800px", height: exactContainerHeight, margin: "0 auto", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {isStudioMode && (
        <Box sx={{ position: "absolute", top: 10, right: -120, zIndex: 50 }}>
          <Typography variant="caption" sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "white", px: 1, py: 0.5, borderRadius: '10px' }}>
            <Edit sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />Editing Info
          </Typography>
        </Box>
      )}

      {/* Background Pages */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: "none" }}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <Box key={i} id={isStudioMode && !isThumbnail ? `page-${pageIdPrefix}-${i}` : undefined}
            sx={{ position: "absolute", top: i * CYCLE, left: 0, right: 0, height: PAGE_HEIGHT, backgroundColor: "#ffffff", boxShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "50px", zIndex: 1 }}>
              <img src={HEADER_IMG} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            <Box sx={{ position: "absolute", top: 1071, left: 0, right: 0, height: "60px", zIndex: 1 }}>
              <img src={FOOTER_IMG} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Foreground Content — position:relative so absolute children use this as origin */}
      <Box ref={foregroundRef} sx={{ position: "relative", zIndex: 2 }}>
        {/* Floating Format Toolbar */}
        {isStudioMode && <FloatingToolbar containerRef={foregroundRef} />}
        {/* Sections — each absolutely positioned at its exact Y */}
        {orderedSections.map((section, index) => (
          <SectionItem
            key={section.id}
            section={section}
            index={index}
            isLast={index === orderedSections.length - 1}
            isStudioMode={isStudioMode}
            isThumbnail={isThumbnail}
            absoluteTop={absoluteTops[section.id] ?? TOP_PADDING}
            onHeightChange={handleHeightChange}
            handleInput={handleInput}
            dispatch={dispatch}
          />
        ))}

        {/* Tables — each absolutely positioned at its exact Y */}
        {tables.map((table) => (
          <TableBlock key={table.id} table={table} isStudioMode={isStudioMode} isThumbnail={isThumbnail} dispatch={dispatch} onHeightChange={handleTableHeightChange} calculatedMargin={tableAbsoluteTops[table.id]} />
        ))}

        {/* Add Button */}
        {isStudioMode && !isThumbnail && (
          <Box sx={{ textAlign: "center", mt: 6, mb: 2 }}>
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap", mb: 1.5 }}>
              <Button variant="outlined" startIcon={<Add />} onClick={(e) => setAddAnchor(e.currentTarget)}
                sx={{ color: "#f3a833", borderColor: "#f3a833", borderStyle: "dashed", bgcolor: "#141414" }}>
                Add Section or Table
              </Button>
              <Button variant="outlined" startIcon={<AutoFixHigh />} onClick={() => setSmartPasteOpen(true)}
                sx={{ color: "#a78bfa", borderColor: "#a78bfa", borderStyle: "dashed", bgcolor: "#141414", "&:hover": { bgcolor: "rgba(167,139,250,0.08)" } }}>
                Smart Paste
              </Button>
            </Box>

            <Menu anchorEl={addAnchor} open={Boolean(addAnchor)} onClose={() => setAddAnchor(null)}
              PaperProps={{ sx: { borderRadius: '10px', mt: 1, boxShadow: "0 12px 32px rgba(0,0,0,0.3)", minWidth: 420, bgcolor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", p: 1.5 } }}>

              <Typography sx={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, px: 1, mb: 1.5 }}>Section Types</Typography>

              {/* Visual Section Type Cards */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, px: 0.5, mb: 1.5 }}>

                {/* Heading */}
                <Box onClick={() => handleAddSection("heading")}
                  sx={{ cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" } }}>
                  <Box sx={{ borderBottom: "2px solid #1a1a1a", pb: 0.3, mb: 0.8, bgcolor: "#fff", px: 0.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.3 }}>Heading</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Large section divider with bottom border<br/>(e.g. Deliverables, Timeline, Pricing)</Typography>
                </Box>

                {/* Title */}
                <Box onClick={() => handleAddSection("title")}
                  sx={{ cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" } }}>
                  <Box sx={{ bgcolor: "#fff", px: 0.5, mb: 0.5 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4 }}>Sub-Heading</Typography>
                    <Typography sx={{ fontSize: 9.5, color: "#666", lineHeight: 1.5 }}>Description text here...</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Sub-section with title + content<br/>(e.g. Monthly Deliverables)</Typography>
                </Box>

                {/* Bullet List */}
                <Box onClick={() => handleAddSection("bullets")}
                  sx={{ cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" } }}>
                  <Box sx={{ bgcolor: "#fff", px: 0.5, mb: 0.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4 }}>Bullet List</Typography>
                    {["• First point", "• Second point", "• Third point"].map((t, i) => (
                      <Typography key={i} sx={{ fontSize: 9, color: "#555", lineHeight: 1.6 }}>{t}</Typography>
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Title + bulleted HTML list</Typography>
                </Box>

                {/* Numbered List */}
                <Box onClick={() => handleAddSection("numbered")}
                  sx={{ cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" } }}>
                  <Box sx={{ bgcolor: "#fff", px: 0.5, mb: 0.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4 }}>Numbered List</Typography>
                    {["1. First item", "2. Second item", "3. Third item"].map((t, i) => (
                      <Typography key={i} sx={{ fontSize: 9, color: "#555", lineHeight: 1.6 }}>{t}</Typography>
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Title + numbered HTML list</Typography>
                </Box>

                {/* Plain text */}
                <Box onClick={() => handleAddSection("plain")}
                  sx={{ cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    gridColumn: "1 / -1",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" } }}>
                  <Box sx={{ bgcolor: "#fff", px: 0.5, mb: 0.5 }}>
                    <Typography sx={{ fontSize: 9.5, color: "#555", lineHeight: 1.7 }}>Plain paragraph text without a heading, good for introductions or notes.</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Plain text — no title</Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.5 }} />
              <Typography sx={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, px: 1, mb: 1 }}>Tables</Typography>
              <Box sx={{ display: "flex", gap: 1, px: 0.5 }}>
                <Box onClick={() => handleAddTable(2)}
                  sx={{ cursor: "pointer", flex: 1, p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" } }}>
                  <TableChart sx={{ fontSize: 20, color: "#f3a833", mb: 0.5 }} />
                  <Typography sx={{ fontSize: 11, color: "#ccc", fontWeight: 600 }}>2-Column Table</Typography>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Service / Price</Typography>
                </Box>
                <Box onClick={() => handleAddTable(3)}
                  sx={{ cursor: "pointer", flex: 1, p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" } }}>
                  <TableChart sx={{ fontSize: 20, color: "#f3a833", mb: 0.5 }} />
                  <Typography sx={{ fontSize: 11, color: "#ccc", fontWeight: 600 }}>3-Column Table</Typography>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Phase / Deliverable / Timeline</Typography>
                </Box>
              </Box>
            </Menu>
          </Box>
        )}
        <SmartPasteDialog open={smartPasteOpen} onClose={() => setSmartPasteOpen(false)} dispatch={dispatch} />
      </Box>
    </Box>
  );
};

export default VisualAdditionalInfoEditor;
