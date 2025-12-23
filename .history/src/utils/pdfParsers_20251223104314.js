/**
 * Parses a string into structured blocks (title, plain, bullets, numbered).
 * Useful for handling mixed content pasted into a single input.
 */
export const parseMixedContent = (text) => {
    if (!text || typeof text !== 'string') return [];

    // Split into blocks separated by one or more empty lines
    const rawBlocks = text.split(/\n\s*\n/).filter(block => block.trim());
    const structuredBlocks = [];

    rawBlocks.forEach(block => {
        const lines = block.split('\n').filter(line => line.trim());
        if (lines.length === 0) return;

        const firstLine = lines[0].trim();

        // Check if it's a list (Numbered: "1. ", "2. ")
        if (firstLine.match(/^\d+\.\s/)) {
            structuredBlocks.push({
                type: 'numbered',
                title: "",
                content: lines.join('\n')
            });
        }
        // Check if it's a list (Bullets: "• ", "- ", "* ", "> ")
        else if (firstLine.match(/^[•·\*•\-\u2022>]\s/)) {
            structuredBlocks.push({
                type: 'bullets',
                title: "",
                content: lines.join('\n')
            });
        }
        // Title + Content or Just Plain Text
        else if (lines.length === 1) {
            // Heuristic: short single line is likely a Title
            if (firstLine.length < 80 && !firstLine.match(/[.?!]$/)) {
                structuredBlocks.push({ type: 'title', title: firstLine, content: '' });
            } else {
                structuredBlocks.push({ type: 'plain', content: firstLine });
            }
        } else {
            // Block with multiple lines. If the first line is short and looks like a header, treat as Title + Content.
            if (lines[0].length < 100 && !lines[0].match(/[.?!]$/)) {
                structuredBlocks.push({
                    type: 'title',
                    title: lines[0].trim(),
                    content: lines.slice(1).join('\n')
                });
            } else {
                structuredBlocks.push({ type: 'plain', content: lines.join('\n') });
            }
        }
    });

    return structuredBlocks;
};

/**
 * Parses a string into a table structure (title, headers, rows).
 * Detects delimiters like Tabs (Excel), Commas (CSV), or Equals (.env).
 */
export const parseSmartTable = (text) => {
    if (!text || typeof text !== "string") return null;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    let title = "";
    let dataLines = [...lines];

    // Heuristic: If first line has no obvious delimiter but second line does, first is title
    const delimiterRegex = /\t|,|=|:/;
    if (lines.length > 1 && !delimiterRegex.test(lines[0]) && delimiterRegex.test(lines[1])) {
        title = lines[0];
        dataLines = lines.slice(1);
    }

    // Detect delimiter
    let delimiter = "\t"; // Default for Excel/Sheets
    const firstDataLine = dataLines[0];

    if (firstDataLine.includes("\t")) delimiter = "\t";
    else if (firstDataLine.includes(",")) delimiter = ",";
    else if (firstDataLine.includes("=")) delimiter = "=";
    else if (firstDataLine.includes(":")) delimiter = ":";
    else delimiter = /\s{2,}/; // Multiple spaces

    // Map rows
    let headers = { col1: "Item", col2: "Value", col3: "Note" };
    let finalRowsData = [...dataLines];

    if (dataLines.length > 1) {
        const firstLineParts = dataLines[0].split(delimiter).map(p => p.trim());
        const secondLineParts = dataLines[1].split(delimiter).map(p => p.trim());

        // Heuristic: If first line parts look like headers (e.g., words like Service, Cost, Item)
        const headerKeywords = /service|cost|price|item|desc|title|timeline|date|qty|quantity/i;
        const isHeader = firstLineParts.some(p => headerKeywords.test(p)) ||
            (firstLineParts.length === secondLineParts.length);

        if (isHeader) {
            headers = {
                col1: firstLineParts[0] || "Column 1",
                col2: firstLineParts[1] || "Column 2",
                col3: firstLineParts[2] || "Column 3",
            };
            finalRowsData = dataLines.slice(1);
        }
    }

    const rows = finalRowsData.map((line) => {
        const parts = line.split(delimiter).map((p) => p.trim());
        return {
            col1: parts[0] || "",
            col2: parts[1] || "",
            col3: parts[2] || "",
        };
    });

    // Determine column count based on max columns found in any row or headers
    // CRITICAL: Only count a column if it actually has data in at least one row or header
    const hasCol3 = headers.col3?.trim() || rows.some(r => r.col3?.trim());
    const hasCol2 = headers.col2?.trim() || rows.some(r => r.col2?.trim()) || hasCol3;

    const finalColumnCount = hasCol3 ? 3 : 2;

    return {
        title: title || "Pasted Table",
        columnCount: finalColumnCount,
        headers: {
            col1: headers.col1,
            col2: headers.col2,
            ...(finalColumnCount === 3 && { col3: headers.col3 })
        },
        rows: rows.map(r => {
            const row = { id: Date.now() + Math.random(), col1: r.col1, col2: r.col2 };
            if (finalColumnCount === 3) row.col3 = r.col3;
            return row;
        })
    };
};

/**
 * Splits text into segments for bold rendering.
 * Supports: 
 * 1. **bold text** 
 * 2. Label: (Auto-bolds text ending in colon at start or after newline)
 */
export const parseInlineBold = (text) => {
    if (!text) return [{ text: "", bold: false }];

    // Step 1: Handle explicit Markdown bold **text**
    const mdRegex = /\*\*(.*?)\*\*/g;
    let segments = [];
    let lastIndex = 0;
    let match;

    while ((match = mdRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ text: text.substring(lastIndex, match.index), bold: false });
        }
        segments.push({ text: match[1], bold: true });
        lastIndex = mdRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        segments.push({ text: text.substring(lastIndex), bold: false });
    }

    // Step 2: Handle "Label:" auto-bolding (if not already bold and at start/newline)
    let finalSegments = [];
    segments.forEach(seg => {
        if (seg.bold) {
            finalSegments.push(seg);
        } else {
            const lines = seg.text.split(/(\n)/);
            lines.forEach(line => {
                if (line === "\n") {
                    finalSegments.push({ text: line, bold: false });
                } else if (line) {
                    const labelMatch = line.match(/^([^:]+:)\s*(.*)/);
                    if (labelMatch) {
                        finalSegments.push({ text: labelMatch[1], bold: true });
                        if (labelMatch[2]) {
                            finalSegments.push({ text: " " + labelMatch[2], bold: false });
                        }
                    } else {
                        finalSegments.push({ text: line, bold: false });
                    }
                }
            });
        }
    });

    return finalSegments;
};
