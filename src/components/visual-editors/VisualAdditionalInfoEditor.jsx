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
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight, ColorLens, HorizontalRule,
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

// ─── Smart Content Parser (No AI — fully client-side intelligent parsing) ────
const TYPE_META = {
  heading: { label: "Heading", color: "#a78bfa", bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.3)" },
  title:   { label: "Section Title", color: "#f3a833", bg: "rgba(243,168,51,0.15)", border: "rgba(243,168,51,0.3)" },
  bullets: { label: "Bullet List", color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)" },
  numbered:{ label: "Numbered List", color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.3)" },
  plain:   { label: "Plain Text", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" },
};

// ── 1. Heading keyword dictionary (proposal-specific + general) ──────────────
const HEADING_KEYWORDS = [
  // Proposal core sections
  "scope of work", "scope", "deliverables", "timeline", "pricing", "price",
  "quotation", "quote", "payment", "payment terms", "payment plan",
  "objectives", "goals", "overview", "summary", "executive summary",
  "introduction", "about us", "about", "company overview", "company profile",
  "proposal overview", "project overview", "project brief", "project summary",
  "why choose us", "why us", "our approach", "our process",
  "expected outcomes", "outcomes", "results", "kpis",
  "contact information", "contact us", "contact", "get in touch",
  "closing statement", "closing", "next steps",
  "team", "our team", "team structure",
  "terms & conditions", "terms and conditions", "terms",
  "revisions", "revision policy", "support", "maintenance",
  // Service headings
  "social media", "social media management", "content creation",
  "branding", "brand identity", "brand strategy", "branding optimization",
  "performance marketing", "digital marketing", "seo", "paid ads",
  "web development", "website development", "mobile app", "app development",
  "ui/ux design", "design", "graphic design", "motion graphics",
  "video production", "photography",
  // Phases
  "phase 1", "phase 2", "phase 3", "phase one", "phase two", "phase three",
  "initial setup", "setup phase", "execution", "monthly execution",
  "planning", "strategy", "research", "analysis",
  "implementation", "development", "launch", "deployment",
  "testing", "qa", "quality assurance", "review",
  // Common document sections
  "services", "service packages", "packages", "offerings",
  "features", "what's included", "what is included", "includes",
  "benefits", "advantages", "value proposition",
  "requirements", "prerequisites", "assumptions",
  "risks", "challenges", "limitations",
  "appendix", "glossary", "references",
];

// ── 2. Strip HTML tags and decode entities ───────────────────────────────────
const stripHtmlAndDecode = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
};

// ── 3. Check if a line looks like a HEADING ──────────────────────────────────
const scoreAsHeading = (line, prevLine = "") => {
  const text = line.trim();
  if (!text || text.length > 120) return 0;

  // 1. Lowercase start → never a heading
  const firstChar = text.charAt(0);
  const isLowerChar = firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase();
  if (isLowerChar) {
    return 0;
  }

  // 2. Markdown heading → always 100
  if (/^#{1,4}\s/.test(text)) return 100;

  let score = 0;
  const lower = text.toLowerCase().replace(/[^a-z0-9\s&/]/g, '').trim();

  // Check punctuation of previous line to see if this is a continuation
  let prevLineContinuation = false;
  if (prevLine) {
    const prevTrim = prevLine.trim();
    if (prevTrim) {
      const endsWithPunctuation = /[.!?\*:;]$/.test(prevTrim);
      const isPrevList = BULLET_PATTERN.test(prevTrim) || NUM_PATTERN.test(prevTrim);
      // Recursively score previous line as heading (no nesting prevLine to avoid infinite loop)
      const isPrevHeading = scoreAsHeading(prevTrim) >= 45;
      if (!endsWithPunctuation && !isPrevList && !isPrevHeading) {
        prevLineContinuation = true;
      }
    }
  }

  // ALL CAPS, short, no sentence-ending punctuation
  const isAllCaps = text === text.toUpperCase() && /[A-Z]/.test(text);
  if (isAllCaps && text.length >= 3 && text.length <= 80 && !/[.?!]$/.test(text)) score += 50;

  // Numbered heading: "1. Scope of Work", "3. Deliverables"
  const isNumbered = /^\d+[.):]\s+[A-Z]/.test(text);
  if (isNumbered && text.length < 80) score += 40;

  // Lettered heading: "A. Introduction"
  const isLettered = /^[A-Z][.):]\s+[A-Z]/.test(text);
  if (isLettered && text.length < 80) score += 35;

  // Roman numeral heading: "I. Overview"
  const isRoman = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)[.):]\s+[A-Z]/i.test(text);
  if (isRoman && text.length < 80) score += 35;

  // Keyword match
  const isExactKeyword = HEADING_KEYWORDS.some(kw => lower === kw);
  const isSuffixOrPrefixKeyword = HEADING_KEYWORDS.some(kw => lower.startsWith(kw + ' ') || lower.endsWith(' ' + kw));

  if (isExactKeyword) {
    score += 55;
  } else if (isSuffixOrPrefixKeyword) {
    if (text.split(/\s+/).length <= 4) {
      score += 35;
    }
  }

  // Apply previous line continuation penalty if it is not an exact keyword, markdown, or numbered heading
  if (prevLineContinuation && !isExactKeyword && !isNumbered && !isLettered && !isRoman) {
    score -= 45;
  }

  // Title Case
  const words = text.split(/\s+/);
  const capitalizedWords = words.filter(w => w.length > 2 && w[0] === w[0].toUpperCase());
  const titleCaseRatio = capitalizedWords.length / Math.max(words.length, 1);
  if (titleCaseRatio >= 0.7 && text.length < 70 && !/[.?!]$/.test(text) && words.length <= 8) {
    score += 25;
  }

  if (/:[\s]*$/.test(text) && text.length < 80) score += 30;

  if (/[.!?]$/.test(text)) score -= 30;

  if (text.length > 90) score -= 20;

  return Math.max(score, 0);
};

// ── 4. Detect bullet list ────────────────────────────────────────────────────
const BULLET_PATTERN = /^[•\-\*–>○●▪▸►◆■]/;
const NUM_PATTERN    = /^(\d+[.):]|[a-z][.):]|[IVX]+[.):])\s/i;

const isBulletLine   = (line) => BULLET_PATTERN.test(line.trim());
const isNumberedLine = (line) => NUM_PATTERN.test(line.trim());

// ── 5. Convert plain-text list lines to HTML ─────────────────────────────────
const linesToHtml = (lines, listType = 'ul') => {
  const tag = listType === 'ol' ? 'ol' : 'ul';
  const items = lines.map(l => {
    const clean = l.trim()
      .replace(BULLET_PATTERN, '')
      .replace(/^\d+[.):]\s*/, '')
      .replace(/^[a-z][.):]\s*/i, '')
      .trim();
    return `<li>${clean}</li>`;
  });
  return `<${tag}>${items.join('')}</${tag}>`;
};

// ── 6. Convert mixed plain-text lines to HTML structure ──────────────────────
const formatLinesToHtml = (lines) => {
  const result = [];
  let currentList = [];
  let currentListType = null; // 'ul' or 'ol'
  let currentPara = [];

  const flushList = () => {
    if (currentList.length > 0) {
      result.push(linesToHtml(currentList, currentListType));
      currentList = [];
      currentListType = null;
    }
  };

  const flushPara = () => {
    if (currentPara.length > 0) {
      result.push(`<p>${currentPara.join(' ')}</p>`);
      currentPara = [];
    }
  };

  lines.forEach(line => {
    const trimmed = line.trim();
    if (isBulletLine(trimmed)) {
      flushPara();
      if (currentListType && currentListType !== 'ul') {
        flushList();
      }
      currentListType = 'ul';
      currentList.push(line);
    } else if (isNumberedLine(trimmed)) {
      flushPara();
      if (currentListType && currentListType !== 'ol') {
        flushList();
      }
      currentListType = 'ol';
      currentList.push(line);
    } else {
      flushList();
      if (trimmed) {
        currentPara.push(trimmed);
      }
    }
  });

  flushList();
  flushPara();
  return result.join('');
};

// ── 7. Smart split: breaks text into logical blocks ──────────────────────────
// KEY FIX: when ANY heading is detected, ALWAYS flush current block first.
// Also flushes when transitioning between list blocks and plain paragraphs.
const splitIntoBlocks = (text) => {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines   = normalized.split('\n');

  const blocks = [];
  let current  = [];

  const flush = () => {
    const joined = current.join('\n').trim();
    if (joined) {
      blocks.push(joined);
    }
    current = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Empty line → paragraph break
    if (!trimmed) {
      flush();
      continue;
    }

    const prevLine = rawLines[i - 1] || "";
    const hScore = scoreAsHeading(trimmed, prevLine);
    const isHeading = hScore >= 45;
    const isList = isBulletLine(trimmed) || isNumberedLine(trimmed);

    if (current.length === 0) {
      current.push(line);
      continue;
    }

    const firstLine = current[0].trim();
    const firstIsHeading = scoreAsHeading(firstLine) >= 45;
    const currentHasList = current.some(l => isBulletLine(l) || isNumberedLine(l));

    // When to flush and start a new block:
    if (isHeading) {
      // Always flush when hitting a new heading
      flush();
    } else if (isList && !firstIsHeading && !currentHasList) {
      // Transitioning from plain text (without heading) to a list -> flush plain text first
      flush();
    } else if (!isList && currentHasList) {
      // Transitioning from a list block to a non-list line -> flush the list first
      flush();
    }

    current.push(line);
  }
  flush();

  return blocks;
};

// ── 8. Main type classifier for a single block ───────────────────────────────
const classifyBlock = (block, idx) => {
  if (!block.trim()) return null;

  const lines      = block.split('\n').map(l => l.trim()).filter(Boolean);
  const firstLine  = lines[0];
  const restLines  = lines.slice(1);
  const hScore     = scoreAsHeading(firstLine);

  // ── Markdown heading (#)
  if (/^#{1,4}\s/.test(firstLine)) {
    const title   = firstLine.replace(/^#+\s*/, '').replace(/:$/, '').trim();
    const content = restLines.length ? formatLinesToHtml(restLines) : '';
    // If it's a top heading (# or ##) with no content → heading type
    if (/^#{1,2}\s/.test(firstLine) && !restLines.length) {
      return { type: 'heading', title, content: '' };
    }
    return { type: restLines.length ? 'title' : 'heading', title, content };
  }

  // ── Solo line with high heading score → heading
  if (lines.length === 1 && hScore >= 50) {
    const cleanTitle = firstLine.replace(/^[\d]+[.):]\s*/, '').replace(/:$/, '').trim();
    return { type: 'heading', title: cleanTitle, content: '' };
  }

  // ── First line is a heading, rest is content
  if (hScore >= 45 && restLines.length > 0) {
    const cleanTitle = firstLine.replace(/^[\d]+[.):]\s*/, '').replace(/:$/, '').trim();
    const content = formatLinesToHtml(restLines);

    // Check if the rest is purely a list
    const allBullets  = restLines.every(isBulletLine);
    const allNumbered = restLines.every(isNumberedLine);

    let type = 'title';
    if (allBullets) type = 'bullets';
    else if (allNumbered) type = 'numbered';

    return { type, title: cleanTitle, content };
  }

  // ── All lines are bullets
  if (lines.every(isBulletLine)) {
    return { type: 'bullets', title: '', content: linesToHtml(lines, 'ul') };
  }

  // ── All lines are numbered
  if (lines.every(isNumberedLine)) {
    return { type: 'numbered', title: '', content: linesToHtml(lines, 'ol') };
  }

  // ── Mixed: first line short (could be implied title), rest = list or text
  if (restLines.length > 0 && firstLine.length < 80 && !/[.!?]$/.test(firstLine)) {
    const allBullets  = restLines.every(isBulletLine);
    const allNumbered = restLines.every(isNumberedLine);
    const content = formatLinesToHtml(restLines);

    if (allBullets) {
      return { type: 'bullets', title: firstLine.replace(/:$/, '').trim(), content };
    }
    if (allNumbered) {
      return { type: 'numbered', title: firstLine.replace(/:$/, '').trim(), content };
    }
    if (restLines.length >= 1 && hScore >= 20) {
      return { type: 'title', title: firstLine.replace(/:$/, '').trim(), content };
    }
  }

  // ── Default: plain paragraph
  return { type: 'plain', title: '', content: formatLinesToHtml(lines) };
};

// ── 9. Post-process: merge orphan headings with following title/plain ─────────
const postProcess = (raw) => {
  const out = [];
  let i = 0;
  while (i < raw.length) {
    const sec = raw[i];
    // If heading with no content, peek next — if next is plain, merge
    if (sec.type === 'heading' && !sec.content && i + 1 < raw.length) {
      const next = raw[i + 1];
      if (next.type === 'plain' && !next.title) {
        out.push({ ...sec, content: next.content });
        i += 2;
        continue;
      }
    }
    out.push(sec);
    i++;
  }
  return out;
};

// ── 10. Intelligent HTML DOM parser ──────────────────────────────────────────
const parseHtmlToSections = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const sections = [];
  let currentSection = null;

  const flushCurrent = () => {
    if (currentSection) {
      const cleanTitle = currentSection.title.trim();
      let cleanContent = currentSection.content.trim();

      if (currentSection.type === 'bullets' && !cleanContent.startsWith('<ul')) {
        cleanContent = `<ul>${cleanContent}</ul>`;
      } else if (currentSection.type === 'numbered' && !cleanContent.startsWith('<ol')) {
        cleanContent = `<ol>${cleanContent}</ol>`;
      }

      if (cleanTitle || cleanContent) {
        sections.push({
          type: currentSection.type,
          title: cleanTitle,
          content: cleanContent
        });
      }
      currentSection = null;
    }
  };

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        if (!currentSection) {
          currentSection = { type: 'plain', title: '', content: `<p>${text}</p>` };
        } else {
          currentSection.content += ` ${text}`;
        }
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tagName = node.tagName.toLowerCase();

    // Headings
    if (/^h[1-6]$/.test(tagName)) {
      flushCurrent();
      currentSection = {
        type: tagName === 'h1' || tagName === 'h2' ? 'heading' : 'title',
        title: node.textContent.trim(),
        content: ''
      };
      return;
    }

    // Paragraphs / Divs
    if (tagName === 'p' || tagName === 'div' || tagName === 'blockquote') {
      const hasHeading = node.querySelector('h1, h2, h3, h4, h5, h6');
      const hasList = node.querySelector('ul, ol, li');
      if (hasHeading || hasList) {
        Array.from(node.childNodes).forEach(processNode);
      } else {
        let cleanHtml = node.innerHTML
          .replace(/style="[^"]*"/gi, '')
          .replace(/class="[^"]*"/gi, '')
          .replace(/<span[^>]*>/gi, '')
          .replace(/<\/span>/gi, '')
          .trim();

        const text = node.textContent.trim();
        if (text) {
          if (isBulletLine(text)) {
            const bulletFree = cleanHtml.replace(BULLET_PATTERN, '').trim();
            if (!currentSection || currentSection.type !== 'bullets') {
              flushCurrent();
              currentSection = { type: 'bullets', title: '', content: `<li>${bulletFree}</li>` };
            } else {
              currentSection.content += `<li>${bulletFree}</li>`;
            }
          } else if (isNumberedLine(text)) {
            const numFree = cleanHtml.replace(NUM_PATTERN, '').trim();
            if (!currentSection || currentSection.type !== 'numbered') {
              flushCurrent();
              currentSection = { type: 'numbered', title: '', content: `<li>${numFree}</li>` };
            } else {
              currentSection.content += `<li>${numFree}</li>`;
            }
          } else {
            const hScore = scoreAsHeading(text);
            if (hScore >= 45) {
              flushCurrent();
              currentSection = { type: hScore >= 60 ? 'heading' : 'title', title: text, content: '' };
            } else {
              if (!currentSection) {
                currentSection = { type: 'plain', title: '', content: `<p>${cleanHtml}</p>` };
              } else {
                if ((currentSection.type === 'heading' || currentSection.type === 'title') && !currentSection.content) {
                  currentSection.content = `<p>${cleanHtml}</p>`;
                } else {
                  currentSection.content += `<p>${cleanHtml}</p>`;
                }
              }
            }
          }
        }
      }
      return;
    }

    // Lists
    if (tagName === 'ul' || tagName === 'ol') {
      const type = tagName === 'ul' ? 'bullets' : 'numbered';
      const cleanListItems = Array.from(node.querySelectorAll('li')).map(li => {
        let html = li.innerHTML
          .replace(/style="[^"]*"/gi, '')
          .replace(/class="[^"]*"/gi, '')
          .replace(/<span[^>]*>/gi, '')
          .replace(/<\/span>/gi, '')
          .trim();
        return `<li>${html}</li>`;
      }).filter(Boolean).join('');

      if (currentSection && (currentSection.type === 'heading' || currentSection.type === 'title') && !currentSection.content) {
        currentSection.type = type;
        currentSection.content = cleanListItems;
      } else {
        flushCurrent();
        currentSection = {
          type,
          title: '',
          content: cleanListItems
        };
      }
      return;
    }

    // Fallback: traverse children
    Array.from(node.childNodes).forEach(processNode);
  };

  Array.from(doc.body.childNodes).forEach(processNode);
  flushCurrent();

  return sections;
};

// ── 11. Master parse entry-point ──────────────────────────────────────────────
const parseContent = (raw) => {
  // 1. If it looks like HTML, try parsing as HTML structure first
  const isHtml = /<[a-z][\s\S]*>/i.test(raw);
  if (isHtml) {
    const htmlSections = parseHtmlToSections(raw);
    if (htmlSections.length > 0) {
      return htmlSections.map((s, i) => ({ ...s, _id: i }));
    }
  }

  // 2. Fallback to intelligent plain-text split & classification
  const text = isHtml ? stripHtmlAndDecode(raw) : raw;
  const blocks = splitIntoBlocks(text);
  const classified = blocks.map((b, i) => classifyBlock(b, i)).filter(Boolean);
  const processed = postProcess(classified);
  return processed.map((s, i) => ({ ...s, _id: i }));
};

// ─── Smart Paste Dialog ────────────────────────────────────────────────────
const SmartPasteDialog = ({ open, onClose, dispatch }) => {
  const [rawText, setRawText] = useState("");
  const [sections, setSections] = useState([]);
  const [parsed, setParsed] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState("");
  const pastedRef = useRef(false);

  const handleParse = () => {
    let result = [];
    if (copiedHtml) {
      result = parseHtmlToSections(copiedHtml);
    }
    if (result.length === 0) {
      result = parseContent(rawText);
    }
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
    dispatch(showToast({ message: `✅ ${sections.length} sections added successfully`, severity: "success" }));
    setRawText("");
    setSections([]);
    setCopiedHtml("");
    setParsed(false);
    onClose();
  };

  const handleClose = () => {
    setRawText(""); setSections([]); setCopiedHtml(""); setParsed(false); onClose();
  };

  const TYPES = Object.keys(TYPE_META);

  // Count by type for the summary bar
  const typeCounts = sections.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { bgcolor: "#0d0d0d", border: "1px solid rgba(167,139,250,0.25)", borderRadius: '10px', minHeight: "80vh" } }}>
      <DialogTitle sx={{ borderBottom: "1px solid rgba(255,255,255,0.07)", pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AutoFixHigh sx={{ color: "#a78bfa", fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1 }}>Smart Paste &amp; Auto-Structure</Typography>
            <Typography variant="caption" sx={{ color: "#888" }}>Paste any content (plain text, HTML, Word, AI output) — sections will be intelligently detected</Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
        {/* LEFT: Paste Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Paste Content Here</Typography>
            {copiedHtml && (
              <Chip
                label="✨ Rich Text / Word Captured"
                size="small"
                sx={{
                  ml: 1.5,
                  bgcolor: "rgba(167,139,250,0.15)",
                  color: "#a78bfa",
                  border: "1px solid rgba(167,139,250,0.3)",
                  fontSize: 10,
                  height: 18,
                  fontWeight: 600
                }}
              />
            )}
          </Box>
          <TextField
            multiline
            minRows={14}
            maxRows={28}
            fullWidth
            placeholder={`Paste any content here. Works with:\n\n# Scope of Work\n\n1. Social Media Management\nWe will handle all platforms...\n\n• Increase brand awareness\n• Boost engagement\n• Drive conversions\n\nTimeline:\nPhase 1 – Setup (Week 1-2)\nPhase 2 – Execution (Week 3+)`}
            value={rawText}
            onPaste={(e) => {
              const html = e.clipboardData.getData("text/html");
              if (html) {
                setCopiedHtml(html);
                pastedRef.current = true;
              }
            }}
            onChange={(e) => {
              setRawText(e.target.value);
              setParsed(false);
              if (!pastedRef.current) {
                setCopiedHtml("");
              }
              pastedRef.current = false;
            }}
            InputProps={{ sx: { fontFamily: "monospace", fontSize: 12.5, color: "#e0e0e0", bgcolor: "#141414", borderRadius: '10px', alignItems: "flex-start" } }}
            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(167,139,250,0.3)" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" }, "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#a78bfa" } }}
          />
          {/* Supported format hints */}
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
            {[
              { label: '# Markdown', color: '#a78bfa' },
              { label: 'ALL CAPS', color: '#f3a833' },
              { label: '1. Numbered', color: '#38bdf8' },
              { label: '• Bullets', color: '#22c55e' },
              { label: 'HTML', color: '#f87171' },
              { label: 'Keywords', color: '#fb923c' },
            ].map(h => (
              <Box key={h.label} sx={{ px: 0.9, py: 0.2, borderRadius: '6px', fontSize: 10, fontWeight: 600,
                border: `1px solid ${h.color}44`, color: h.color, bgcolor: `${h.color}11` }}>
                {h.label}
              </Box>
            ))}
          </Box>
          <Button
            fullWidth
            variant="contained"
            onClick={handleParse}
            disabled={!rawText.trim()}
            startIcon={<AutoFixHigh />}
            sx={{ mt: 1.5, bgcolor: "#a78bfa", color: "#000", fontWeight: 700, "&:hover": { bgcolor: "#9061ea" }, "&:disabled": { bgcolor: "rgba(167,139,250,0.2)", color: "rgba(0,0,0,0.3)" } }}
          >
            Smart Parse Content
          </Button>
        </Box>

        {/* DIVIDER */}
        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* RIGHT: Parsed Preview */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Detected Sections</Typography>
            {parsed && sections.length > 0 && Object.entries(typeCounts).map(([type, count]) => (
              <Chip key={type} label={`${count} ${TYPE_META[type]?.label || type}`} size="small"
                sx={{ bgcolor: TYPE_META[type]?.bg, color: TYPE_META[type]?.color,
                  border: `1px solid ${TYPE_META[type]?.border}`, fontSize: 10, height: 20 }} />
            ))}
          </Box>

          {!parsed && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 2, opacity: 0.4 }}>
              <AutoFixHigh sx={{ fontSize: 56, color: "#a78bfa" }} />
              <Typography sx={{ color: "#888", fontSize: 13 }}>Paste content and click Smart Parse to see detected sections</Typography>
            </Box>
          )}

          {parsed && sections.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography sx={{ color: "#f44336", fontSize: 13 }}>No sections detected. Try adding blank lines between sections or using headings.</Typography>
            </Box>
          )}

          {sections.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 420, overflowY: "auto", pr: 0.5 }}>
              {sections.map((sec) => {
                const meta = TYPE_META[sec.type] || TYPE_META.plain;
                // Strip HTML for preview text
                const previewContent = sec.content ? sec.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
                return (
                  <Box key={sec._id}
                    sx={{ bgcolor: "#141414", border: `1px solid ${meta.border}`, borderRadius: '10px',
                      p: 1.5, position: "relative", "&:hover .sp-del": { opacity: 1 },
                      borderLeft: `3px solid ${meta.color}` }}>
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
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: meta.color, mb: 0.4, lineHeight: 1.3 }}>
                        {sec.title}
                      </Typography>
                    )}
                    {previewContent && (
                      <Typography sx={{
                        fontSize: 11, color: "#888", whiteSpace: "pre-wrap", lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
                      }}>
                        {previewContent}
                      </Typography>
                    )}
                    {!sec.title && !previewContent && (
                      <Typography sx={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>Empty section</Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)", justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: "#555", fontSize: 10 }}>
          {parsed && sections.length > 0 ? `${sections.length} section${sections.length !== 1 ? 's' : ''} ready to add` : 'You can adjust types before adding'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
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
        </Box>
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
          <Box className="tbl-actions" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="Add Row">
              <IconButton
                onClick={() => dispatch(addTableRow(table.id))}
                size="small"
                sx={{ color: "#f3a833", p: 0.5, "&:hover": { bgcolor: "rgba(243,168,51,0.1)" } }}
              >
                <AddCircleOutline sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bulk Add Rows">
              <IconButton
                onClick={() => setBulkOpen(true)}
                size="small"
                sx={{ color: "#a78bfa", p: 0.5, "&:hover": { bgcolor: "rgba(167,139,250,0.1)" } }}
              >
                <PlaylistAdd sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
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
          </Box>
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
      bold: document.queryCommandState('bold'),
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
    const isNum = lines.some((l) => /^\d+\.\s/.test(l.trim()));
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
        position: 'absolute', top: 0, right: '28px',
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
      <Btn title="Bold" onClick={() => applyFormat('bold')} icon={<FormatBold sx={{ fontSize: 14 }} />} isActive={active.bold} />
      <Btn title="Underline" onClick={() => applyFormat('underline')} icon={<FormatUnderlined sx={{ fontSize: 14 }} />} isActive={active.underline} />
      <Box sx={{ width: '1px', height: 16, bgcolor: '#ddd', mx: 0.3 }} />
      <Btn title="Toggle Bullet List" onClick={() => toggleList('bullet')} icon={<FormatListBulleted sx={{ fontSize: 14 }} />} isActive={false} />
      <Btn title="Toggle Numbered List" onClick={() => toggleList('numbered')} icon={<FormatListNumbered sx={{ fontSize: 14 }} />} isActive={false} />
    </Box>
  );
};

// ─── Section Item ─────────────────────────────────────────────────────────────
const SectionItem = React.memo(({ section, index, isLast, isStudioMode, isThumbnail, absoluteTop, onHeightChange, handleInput, dispatch }) => {
  const ref = useRef(null);
  const contentRef = useRef(null);
  const [typeAnchor, setTypeAnchor] = useState(null);
  const [alignAnchor, setAlignAnchor] = useState(null);
  const [colorAnchor, setColorAnchor] = useState(null);
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
            className={`action-btns ${Boolean(typeAnchor) || Boolean(alignAnchor) || Boolean(colorAnchor) ? 'menu-open' : ''}`}
            sx={{
              position: "absolute",
              left: "28px",
              top: isHeading ? "-38px" : "4px",
              display: "flex",
              flexDirection: isHeading ? "row" : "column",
              gap: "6px",
              bgcolor: "#1a1a1a",
              borderRadius: isHeading ? "20px" : "8px",
              p: "4px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid rgba(243,168,51,0.15)",
              opacity: 0,
              transition: "opacity 0.2s",
              zIndex: 30,
            }}
          >
            <Tooltip title="Delete Section" placement={isHeading ? "top" : "right"}>
              <IconButton
                onClick={() => {
                  dispatch(deleteSection(section.id));
                  dispatch(showToast({ message: "Section deleted", severity: "info", undoAction: restoreSection({ section, index }) }));
                }}
                sx={{ width: 26, height: 26, p: 0, color: "#ef4444", borderRadius: '6px', "&:hover": { bgcolor: "rgba(239,68,68,0.15)" } }}
              >
                <Delete sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Change Section Type" placement={isHeading ? "top" : "right"}>
              <IconButton
                onClick={(e) => setTypeAnchor(e.currentTarget)}
                sx={{ width: 26, height: 26, p: 0, color: "#f3a833", borderRadius: '6px', "&:hover": { bgcolor: "rgba(243,168,51,0.15)" } }}
              >
                <Edit sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>

            {isHeading && (
              <>
                <Tooltip title="Align Heading" placement={isHeading ? "top" : "right"}>
                  <IconButton
                    onClick={(e) => setAlignAnchor(e.currentTarget)}
                    sx={{ width: 26, height: 26, p: 0, color: "#f3a833", borderRadius: '6px', "&:hover": { bgcolor: "rgba(243,168,51,0.15)" } }}
                  >
                    {section.titleAlign === "center" ? (
                      <FormatAlignCenter sx={{ fontSize: 15 }} />
                    ) : section.titleAlign === "right" ? (
                      <FormatAlignRight sx={{ fontSize: 15 }} />
                    ) : (
                      <FormatAlignLeft sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Heading Color" placement={isHeading ? "top" : "right"}>
                  <IconButton
                    onClick={(e) => setColorAnchor(e.currentTarget)}
                    sx={{ width: 26, height: 26, p: 0, color: "#f3a833", borderRadius: '6px', "&:hover": { bgcolor: "rgba(243,168,51,0.15)" } }}
                  >
                    <ColorLens sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={section.hideBorder ? "Show Horizontal Bar" : "Hide Horizontal Bar"} placement={isHeading ? "top" : "right"}>
                  <IconButton
                    onClick={() => {
                      dispatch(updateSection({ id: section.id, hideBorder: !section.hideBorder }));
                    }}
                    sx={{
                      width: 26, height: 26, p: 0,
                      color: section.hideBorder ? "#888" : "#f3a833",
                      borderRadius: '6px',
                      bgcolor: section.hideBorder ? "transparent" : "rgba(243,168,51,0.12)",
                      "&:hover": { bgcolor: "rgba(243,168,51,0.15)" }
                    }}
                  >
                    <HorizontalRule sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
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

          {/* Alignment Menu */}
          <Menu
            anchorEl={alignAnchor}
            open={Boolean(alignAnchor)}
            onClose={() => setAlignAnchor(null)}
            PaperProps={{ sx: { bgcolor: "#1a1a1a", border: "1px solid rgba(243,168,51,0.2)", color: "#fff", borderRadius: '8px' } }}
          >
            <MenuItem
              onClick={() => {
                dispatch(updateSection({ id: section.id, titleAlign: "left" }));
                setAlignAnchor(null);
              }}
              sx={{ fontSize: 13, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <FormatAlignLeft sx={{ mr: 1, fontSize: 16 }} /> Left
            </MenuItem>
            <MenuItem
              onClick={() => {
                dispatch(updateSection({ id: section.id, titleAlign: "center" }));
                setAlignAnchor(null);
              }}
              sx={{ fontSize: 13, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <FormatAlignCenter sx={{ mr: 1, fontSize: 16 }} /> Center
            </MenuItem>
            <MenuItem
              onClick={() => {
                dispatch(updateSection({ id: section.id, titleAlign: "right" }));
                setAlignAnchor(null);
              }}
              sx={{ fontSize: 13, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <FormatAlignRight sx={{ mr: 1, fontSize: 16 }} /> Right
            </MenuItem>
          </Menu>

          {/* Color Menu */}
          <Menu
            anchorEl={colorAnchor}
            open={Boolean(colorAnchor)}
            onClose={() => setColorAnchor(null)}
            PaperProps={{ sx: { bgcolor: "#1a1a1a", border: "1px solid rgba(243,168,51,0.2)", color: "#fff", borderRadius: '8px', p: 1, minWidth: 150 } }}
          >
            <Typography variant="caption" sx={{ color: "#888", display: "block", mb: 1, px: 0.5, fontWeight: 700, textTransform: "uppercase" }}>
              Select Color
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
              {[
                "#000000", // Black
                "#f3a833", // Gold/Orange
                "#2563eb", // Royal Blue
                "#7c3aed", // Purple
                "#db2777", // Pink
                "#16a34a", // Green
                "#dc2626", // Red
                "#4b5563"  // Grey
              ].map((c) => (
                <Box
                  key={c}
                  onClick={() => {
                    dispatch(updateSection({ id: section.id, color: c }));
                    setColorAnchor(null);
                  }}
                  sx={{
                    width: 24, height: 24, bgcolor: c, borderRadius: "50%", cursor: "pointer",
                    border: (section.color || "#000000") === c ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    transition: "transform 0.1s",
                    "&:hover": { transform: "scale(1.15)" }
                  }}
                />
              ))}
            </Box>
          </Menu>

          {!isHeading && <SectionToolbar contentRef={contentRef} />}
        </>
      )}

      {/* ── Heading type: large title + thick bottom border (like "Deliverables", "Timeline", "Pricing") ── */}
      {isHeading && (
        <Box sx={{
          borderBottom: section.hideBorder ? "none" : `2px solid ${section.color || "#1a1a1a"}`,
          mb: "16px",
          pb: "6px",
        }}>
          <EditableText
            value={section.title}
            isStudioMode={isStudioMode}
            onInput={(e) => handleInput(section.id, "title", e)}
            sx={{
              fontSize: 28, fontWeight: "bold", color: section.color || "#1a1a1a",
              textAlign: section.titleAlign || "left", outline: "none", wordBreak: "break-word",
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
      heading: { title: "Section Heading", content: "" },
      title: { title: "Sub-Section Title", content: "<p>Start typing your content here...</p>" },
      bullets: { title: "Bullet List", content: "<ul><li>First point</li><li>Second point</li><li>Third point</li></ul>" },
      numbered: { title: "Numbered List", content: "<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>" },
      plain: { title: "", content: "<p>Plain text paragraph without a title...</p>" },
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

    const isHeading = sec.type === "heading";

    if (idx === 0) {
      absoluteTops[sec.id] = TOP_PADDING;
      currentY = TOP_PADDING + h + 28;
    } else {
      const isAtPageStart = (currentY === pageIndex * CYCLE + TOP_PADDING);
      let shouldPush = false;
      if (spaceLeft < h) {
        shouldPush = true;
      } else if (isHeading && idx < orderedSections.length - 1) {
        // Lookahead: check if the next section fits on this page
        const nextSec = orderedSections[idx + 1];
        const nextH = sectionHeights[nextSec.id] || 100;
        const cappedNextH = Math.min(270, nextH); // cap at 200pt (270px)
        const requiredSpaceForBoth = h + 28 + cappedNextH;
        if (spaceLeft < requiredSpaceForBoth) {
          shouldPush = true;
        }
      }

      if (shouldPush && !isAtPageStart) {
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
  // If there are both sections and tables, tables start on a new page, matching the PDF
  if (orderedSections.length > 0 && tables.length > 0) {
    const lastSecY = Math.max(currentY - 28, TOP_PADDING);
    const currentSectionPageIndex = Math.floor(lastSecY / CYCLE);
    currentY = (currentSectionPageIndex + 1) * CYCLE + TOP_PADDING;
  }

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
          <Box sx={{ position: "absolute", top: `${(totalPages - 1) * CYCLE + PAGE_HEIGHT - 180}px`, left: "100%", ml: "20px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 100 }}>
            <Button variant="outlined" startIcon={<Add />} onClick={(e) => setAddAnchor(e.currentTarget)}
              sx={{ color: "#f3a833", borderColor: "#f3a833", borderStyle: "dashed", bgcolor: "#141414", whiteSpace: "nowrap" }}>
              Add Section or Table
            </Button>
            <Button variant="outlined" startIcon={<AutoFixHigh />} onClick={() => setSmartPasteOpen(true)}
              sx={{ color: "#a78bfa", borderColor: "#a78bfa", borderStyle: "dashed", bgcolor: "#141414", whiteSpace: "nowrap", "&:hover": { bgcolor: "rgba(167,139,250,0.08)" } }}>
              Smart Paste
            </Button>

            <Menu anchorEl={addAnchor} open={Boolean(addAnchor)} onClose={() => setAddAnchor(null)}
              PaperProps={{ sx: { borderRadius: '10px', mt: 1, boxShadow: "0 12px 32px rgba(0,0,0,0.3)", minWidth: 420, bgcolor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", p: 1.5 } }}>

              <Typography sx={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, px: 1, mb: 1.5 }}>Section Types</Typography>

              {/* Visual Section Type Cards */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, px: 0.5, mb: 1.5 }}>

                {/* Heading */}
                <Box onClick={() => handleAddSection("heading")}
                  sx={{
                    cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" }
                  }}>
                  <Box sx={{ borderBottom: "2px solid #1a1a1a", pb: 0.3, mb: 0.8, bgcolor: "#fff", px: 0.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.3 }}>Heading</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Large section divider with bottom border<br />(e.g. Deliverables, Timeline, Pricing)</Typography>
                </Box>

                {/* Title */}
                <Box onClick={() => handleAddSection("title")}
                  sx={{
                    cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" }
                  }}>
                  <Box sx={{ bgcolor: "#fff", px: 0.5, mb: 0.5 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4 }}>Sub-Heading</Typography>
                    <Typography sx={{ fontSize: 9.5, color: "#666", lineHeight: 1.5 }}>Description text here...</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Sub-section with title + content<br />(e.g. Monthly Deliverables)</Typography>
                </Box>

                {/* Bullet List */}
                <Box onClick={() => handleAddSection("bullets")}
                  sx={{
                    cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" }
                  }}>
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
                  sx={{
                    cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" }
                  }}>
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
                  sx={{
                    cursor: "pointer", p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    gridColumn: "1 / -1",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" }
                  }}>
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
                  sx={{
                    cursor: "pointer", flex: 1, p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" }
                  }}>
                  <TableChart sx={{ fontSize: 20, color: "#f3a833", mb: 0.5 }} />
                  <Typography sx={{ fontSize: 11, color: "#ccc", fontWeight: 600 }}>2-Column Table</Typography>
                  <Typography sx={{ fontSize: 9, color: "#666" }}>Service / Price</Typography>
                </Box>
                <Box onClick={() => handleAddTable(3)}
                  sx={{
                    cursor: "pointer", flex: 1, p: 1.5, borderRadius: '10px', bgcolor: "#111", border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { border: "1px solid #f3a833", bgcolor: "rgba(243,168,51,0.06)" }
                  }}>
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
