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
        else if (firstLine.match(/^[•·\*•\-\u2022>ÏË]\s/)) {
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
// Helper to strip HTML tags
const stripHtml = (html) => html.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim();

/**
 * Advanced Parser: HTML/Text -> Redux Section Objects
 * Splits content into multiple section objects (Title, Bullets, Numbered).
 */
export const parseMixedToReduxSections = (contentInput) => {
    if (!contentInput) return [];

    let content = contentInput;

    // Pre-clean: normalize inputs
    let cleanBox = content
        .replace(/&nbsp;/g, ' ')
        // Remove empty paragraphs
        .replace(/<p[^>]*>\s*<\/p>/gi, '')
        .replace(/<br\s*\/?>/gi, '</p><p>') // Handle <br> as paragraph breaks
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');

    // 1. Detect plain text bullets in <p> tags and convert to <ul>
    // Includes Ï and Ë as bullets
    const bulletRegex = /<p[^>]*>\s*(?:•|○|●|·|\-|\*||Ï|Ë)\s*(.*?)<\/p>/gi;
    cleanBox = cleanBox.replace(bulletRegex, (match, attrs, content) => {
        return `<ul><li${attrs}>${content}</li></ul>`;
    });

    // 2. Merge adjacent <ul> or <ol> tags
    cleanBox = cleanBox.replace(/<\/ul>\s*<ul>/gi, '');
    cleanBox = cleanBox.replace(/<\/ol>\s*<ol>/gi, '');

    // 3. New Strategy: Iterate through blocks and intelligently classify them
    // We split by closing tags of block elements to get chunks
    // But a cleaner way is to use a regex to match complete blocks
    const blockRegex = /<(p|h[1-6]|ul|ol|blockquote|pre|div)[^>]*>.*?<\/\1>/gis;

    // Fallback: if no blocks found (e.g. plain text), wrap in <p>
    if (!cleanBox.match(blockRegex) && cleanBox.length > 0) {
        cleanBox = `<p>${cleanBox}</p>`;
    }

    const matches = [...cleanBox.matchAll(blockRegex)];
    const sections = [];

    // Accumulators for current section
    let currentSection = null;

    const finalizeCurrentSection = () => {
        if (currentSection) {
            sections.push(currentSection);
            currentSection = null;
        }
    };

    matches.forEach((match) => {
        const fullTag = match[0];
        const tagType = match[1].toLowerCase(); // p, h1, ul, etc.
        const content = fullTag.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

        // Skip empty blocks
        if (!content && !fullTag.includes('<img')) return;

        // --- Classification Logic ---

        // 1. Explicit Headers (h1-h6) OR Implicit Headers (Short bold paragraphs)
        const isHTag = tagType.startsWith('h');
        const isBoldPara = tagType === 'p' &&
            /<p[^>]*>\s*<(?:strong|b)[^>]*>.*<\/(?:strong|b)>\s*<\/p>/i.test(fullTag) &&
            content.length < 100 &&
            !/[.?!]$/.test(content);

        // Implicit Header: short text, no punctuation, typical Title Case or specific keywords
        const isImplicitHeader = tagType === 'p' && (
            (content.length > 2 && content.length < 60 && !/[.?!]$/.test(content)) ||
            /^(?:prepared for|prepared by|date|proposal|summary|overview):/i.test(content)
        );

        if (isHTag || isBoldPara || isImplicitHeader) {
            // Check for Subtitle pattern: Previous was Title, no content yet. 
            // And this is a "weak" header (not h1-h6).
            // NOTE: We do not merge if it is an explicit H-tag, as those usually denote structural breaks.
            if (currentSection && currentSection.type === 'title' && !currentSection.content && !isHTag) {
                // Treat as subtitle -> Content
                currentSection.content += fullTag;
                currentSection.rawHtml += fullTag;
                return;
            }

            finalizeCurrentSection();
            currentSection = {
                type: 'title',
                title: content,
                content: '', // Titles in page2Slice usually have empty content, or they start a new section
                rawHtml: fullTag
            };
            return; // Done with this block
        }

        // 2. Lists (ul, ol)
        if (tagType === 'ul' || tagType === 'ol') {
            // If we have a current 'title' section with no content, attach this list as its content
            // Otherwise, if we have a current section that is NOT the right list type, start a new one
            // Or if we have a current section that IS the right list type, append (merge)

            const listType = tagType === 'ol' ? 'numbered' : 'bullets';

            if (currentSection && currentSection.type === 'title' && !currentSection.content) {
                // Determine if we should change the type or just add content
                // Usually title sections stay type='title' but contain text. 
                // BUT page2Slice has specific 'numbered' and 'bullets' types which HAVE titles.
                // So if we just found a title, and now a list, we convert the previous title section to this list type

                currentSection.type = listType;
                currentSection.content = fullTag;
                currentSection.rawHtml += fullTag;
            } else if (currentSection && currentSection.type === listType) {
                // Merge lists
                currentSection.content += fullTag;
                currentSection.rawHtml += fullTag;
            } else {
                finalizeCurrentSection();
                sections.push({
                    type: listType,
                    title: '', // No title found immediately before
                    content: fullTag,
                    rawHtml: fullTag
                });
            }
            return;
        }

        // 3. Regular Paragraphs / Plain Text
        if (tagType === 'p' || tagType === 'div') {
            // If we have a current section (Title or Plain), append to it
            if (currentSection) {
                // Check if appending to a list section? 
                // If we have a list section, and then a paragraph, it usually means end of list → new plain section?
                // OR it could be a description for the list.
                // Heuristic: If it's a 'title' type, append. If it's 'numbered'/'bullets', maybe start new plain?

                if (currentSection.type === 'numbered' || currentSection.type === 'bullets') {
                    finalizeCurrentSection();
                    currentSection = {
                        type: 'plain',
                        title: '',
                        content: fullTag,
                        rawHtml: fullTag
                    };
                } else {
                    // Append to title or plain
                    currentSection.content += fullTag;
                    currentSection.rawHtml += fullTag;
                }
            } else {
                // Start new plain section
                currentSection = {
                    type: 'plain',
                    title: '',
                    content: fullTag,
                    rawHtml: fullTag
                };
            }
        }
    });

    finalizeCurrentSection();

    // Cleanup: Ensure content is string
    sections.forEach(s => {
        if (!s.content) s.content = '';
    });

    return sections;
};

/**
 * Advanced Cleaner: Normalizes mixed HTML content into a single string.
 * Handles Word bullets, merges lists, and ensures proper spacing.
 */
export const cleanMixedContent = (html) => {
    if (!html) return '';

    // If it's a Quill Delta (stringified JSON), return it as is
    if (typeof html === 'string' && (html.trim().startsWith('{') || html.trim().startsWith('['))) {
        return html;
    }

    // Pre-clean
    let cleanBox = html
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '& ')
        .replace(/\n/g, '');

    // 1. Detect Word-style bullets () or standard symbols and convert to standard <ul>
    // Better regex to match various bullet styles in <p> tags
    const bulletRegex = /<p[^>]*>\s*(?:|•|·|o|▪|▫|►|»|\*|-|Ï|Ë)\s*(.*?)<\/p>/gi;
    cleanBox = cleanBox.replace(bulletRegex, (match, content) => {
        return `<ul><li>${content}</li></ul>`;
    });

    // 2. Fix adjacent </ul><ul> to merge them ONLY if they are at the same level (shallow heuristic)
    // We'll keep it simple for now, as RichTextRenderer now handles nested tags better.
    cleanBox = cleanBox.replace(/<\/ul>\s*<ul>/gi, '');
    cleanBox = cleanBox.replace(/<\/ol>\s*<ol>/gi, '');

    // 3. Heuristic: If a paragraph is short, bold, and doesn't end in punctuation,
    // ensure it's wrapped in strong or converted to header if appropriate.
    const headerRegex = /<p[^>]*>\s*(?:<strong>|<b>)?\s*([^<]{5,100})\s*(?:<\/strong>|<\/b>)?\s*<\/p>/gi;
    cleanBox = cleanBox.replace(headerRegex, (match, content) => {
        if (!/[.?!]$/.test(content.trim()) && content.length < 80) {
            // Check if it's already structured as a header or bold
            if (!match.includes('<strong>') && !match.includes('<b>')) {
                return `<p><strong>${content.trim()}</strong></p>`;
            }
        }
        return match;
    });

    return cleanBox;
};
