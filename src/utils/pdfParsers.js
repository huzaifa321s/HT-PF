/**
 * Parses a string into structured blocks (title, plain, bullets, numbered).
 * Useful for handling mixed content pasted into a single input.
 */
export const parseMixedContent = (text) => {
    if (!text || typeof text !== 'string') return [];

    // Split into Blocks
    const rawBlocks = text.split(/\n\s*\n/).filter(block => block.trim());
    const structuredBlocks = [];

    rawBlocks.forEach(block => {
        const lines = block.split('\n').filter(line => line.trim());
        if (lines.length === 0) return;

        const firstLine = lines[0].trim();

        if (firstLine.match(/^\d+\.\s/)) {
            structuredBlocks.push({
                type: 'numbered',
                title: "",
                content: lines.join('\n')
            });
        }
        else if (firstLine.match(/^[•·\*•\-\u2022>]\s/)) {
            structuredBlocks.push({
                type: 'bullets',
                title: "",
                content: lines.join('\n')
            });
        }
        else if (lines.length === 1) {
            if (firstLine.length < 80 && !firstLine.match(/[.?!]$/)) {
                structuredBlocks.push({ type: 'title', title: firstLine, content: '' });
            } else {
                structuredBlocks.push({ type: 'plain', content: firstLine });
            }
        } else {
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
 * Parses a string into a table structure.
 */
export const parseSmartTable = (text) => {
    if (!text || typeof text !== "string") return null;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    let title = "";
    let dataLines = [...lines];

    const delimiterRegex = /\t|,|=|:/;
    if (lines.length > 1 && !delimiterRegex.test(lines[0]) && delimiterRegex.test(lines[1])) {
        title = lines[0];
        dataLines = lines.slice(1);
    }

    let delimiter = "\t";
    const firstDataLine = dataLines[0];

    if (firstDataLine.includes("\t")) delimiter = "\t";
    else if (firstDataLine.includes(",")) delimiter = ",";
    else if (firstDataLine.includes("=")) delimiter = "=";
    else if (firstDataLine.includes(":")) delimiter = ":";
    else delimiter = /\s{2,}/;

    let headers = { col1: "Item", col2: "Value", col3: "Note" };
    let finalRowsData = [...dataLines];

    if (dataLines.length > 1) {
        const firstLineParts = dataLines[0].split(delimiter).map(p => p.trim());
        const secondLineParts = dataLines[1].split(delimiter).map(p => p.trim());

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

    const hasCol3 = (headers.col3 && headers.col3.trim().length > 0 && !["Column 3", "Note"].includes(headers.col3)) ||
        rows.some(r => r.col3 && r.col3.trim().length > 0);

    const finalColumnCount = hasCol3 ? 3 : 2;

    return {
        title: title || "Pasted Table",
        columnCount: finalColumnCount,
        headers: {
            col1: headers.col1 || "Item",
            col2: headers.col2 || "Value",
            ...(finalColumnCount === 3 && { col3: headers.col3 || "Note" })
        },
        rows: rows.map(r => {
            const row = { id: Date.now() + Math.random(), col1: r.col1, col2: r.col2 };
            if (finalColumnCount === 3) row.col3 = r.col3;
            else if (r.col3 && r.col3.trim()) {
                // Ignore extra col in 2 col mode
            }
            return row;
        })
    };
};

export const parseInlineBold = (text) => {
    if (!text) return [{ text: "", bold: false }];
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

/**
 * Advanced Parser: HTML -> Redux Section Objects
 * Splits a single HTML blob into multiple section objects (Title, Bullets, Numbered).
 */
export const parseMixedToReduxSections = (html) => {
    if (!html) return [];

    // Pre-clean: Replace nbsp with space, &amp; with & (plus space), remove newlines
    const cleanBox = html
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '& ')
        .replace(/\n/g, '');

    // Split block logic
    const portions = cleanBox.split(/(?=<h[1-6])|(?=<p)|(?=<ul)|(?=<ol)/).filter(p => p.trim());

    const sections = [];
    let currentSection = null;

    portions.forEach((part) => {
        const textContent = part.replace(/<[^>]+>/g, '').trim();
        if (!textContent) return;

        // --- Header Detection ---
        const isHTag = /^<h[1-6]/.test(part);
        const isBoldPara = /^<p[^>]*>.*<(?:b|strong)>.*<\/(?:b|strong)>.*<\/p>$/.test(part) &&
            textContent.length < 100;

        // Heuristic for unstyled titles
        const isPara = /^<p/.test(part);
        const isImplicitHeader = isPara &&
            textContent.length > 2 &&
            textContent.length < 85 &&
            !/[.?!]$/.test(textContent) &&
            !/^(?:note|nb|ps):/i.test(textContent);

        const isHeader = isHTag || isBoldPara || isImplicitHeader;

        const isListUl = /^<ul/.test(part);
        const isListOl = /^<ol/.test(part);

        if (isHeader) {
            // Check for "Double Title" scenario
            // If previous section is Title AND has NO content yet,
            // treat this new header as a SUBTITLE (content) of the previous one.
            if (currentSection && currentSection.type === 'title' && !currentSection.content) {
                // Merge as bold content
                currentSection.content = `<strong>${textContent}</strong>`;
            } else {
                // Standard new section
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    type: 'title',
                    title: textContent,
                    content: ''
                };
            }
        } else if (isListUl || isListOl) {
            // Merge title (absorb previous empty title)
            let listTitle = "";
            if (currentSection && currentSection.type === 'title' && !currentSection.content) {
                listTitle = currentSection.title;
                currentSection = null;
            } else if (currentSection) {
                sections.push(currentSection);
                currentSection = null;
            }

            // Extract List content
            const items = part.match(/<li[^>]*>(.*?)<\/li>/g);
            let formattedList = "";
            if (items) {
                items.forEach((item, idx) => {
                    const val = item.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '')
                        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '& ').trim();
                    if (isListOl) formattedList += `${idx + 1}. ${val}\n`;
                    else formattedList += `• ${val}\n`;
                });
            }

            sections.push({
                type: isListOl ? 'numbered' : 'bullets',
                title: listTitle,
                content: formattedList.trim()
            });

        } else if (isPara) {
            // Standard Paragraph
            if (currentSection && currentSection.type === 'title') {
                currentSection.content += (currentSection.content ? '\n\n' : '') + textContent;
            } else {
                // Orphan
                if (currentSection) sections.push(currentSection);

                currentSection = {
                    type: 'title',
                    title: '',
                    content: textContent
                };
            }
        }
    });

    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
};
