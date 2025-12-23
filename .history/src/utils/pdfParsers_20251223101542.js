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
    const rows = dataLines.map((line) => {
        const parts = line.split(delimiter).map((p) => p.trim());
        return {
            col1: parts[0] || "",
            col2: parts[1] || "",
            col3: parts[2] || "", // Supports up to 3 columns
        };
    });

    // Determine column count based on max columns found in any row
    const maxCols = Math.max(...rows.map(r => (r.col3 ? 3 : r.col2 ? 2 : 1)));
    const finalColumnCount = Math.min(Math.max(maxCols, 2), 3); // Stay within 2-3 for UI compatibility

    return {
        title: title || "Pasted Table",
        columnCount: finalColumnCount,
        rows: rows.map(r => {
            const row = { id: Date.now() + Math.random(), col1: r.col1, col2: r.col2 };
            if (finalColumnCount === 3) row.col3 = r.col3;
            return row;
        })
    };
};
