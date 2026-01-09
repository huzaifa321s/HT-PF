import React from 'react';
import { Text, View, StyleSheet, Link, Image, Font } from '@react-pdf/renderer';


// Register Roboto Font for better Unicode support
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxM.woff' }, // Regular
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.woff', fontWeight: 700 }, // Bold
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOiCnqEu92Fr1Mu51QrEz0.woff', fontStyle: 'italic' }, // Italic
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOjCnqEu92Fr1Mu51TzBic6CsE.woff', fontWeight: 700, fontStyle: 'italic' } // Bold Italic
    ]
});

const styles = StyleSheet.create({
    paragraph: {
        fontSize: 10.5,
        lineHeight: 1.6,
        marginBottom: 8,
        color: '#333333',
        fontFamily: 'Roboto',
        textAlign: 'left',
    },
    heading1: {
        fontSize: 22,
        fontWeight: 700,
        marginTop: 12,
        marginBottom: 8,
        color: '#000000',
        fontFamily: 'Roboto',
    },
    heading2: {
        fontSize: 18,
        fontWeight: 700,
        marginTop: 10,
        marginBottom: 6,
        color: '#000000',
        fontFamily: 'Roboto',
    },
    heading3: {
        fontSize: 15,
        fontWeight: 700,
        marginTop: 8,
        marginBottom: 4,
        color: '#000000',
        fontFamily: 'Roboto',
    },
    heading4: {
        fontSize: 13,
        fontWeight: 700,
        marginTop: 6,
        marginBottom: 3,
        color: '#000000',
        fontFamily: 'Roboto',
    },
    heading5: {
        fontSize: 11,
        fontWeight: 700,
        marginTop: 4,
        marginBottom: 2,
        color: '#000000',
        fontFamily: 'Roboto',
    },
    heading6: {
        fontSize: 10,
        fontWeight: 700,
        marginTop: 4,
        marginBottom: 2,
        color: '#000000',
        fontFamily: 'Roboto',
    },
    listContainer: {
        marginBottom: 8,
        marginLeft: 0,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingLeft: 0,
    },
    bulletMarker: {
        width: 15,
        fontSize: 10.5,
        marginRight: 5,
        textAlign: 'right',
    },
    numberMarker: {
        width: 20,
        fontSize: 10.5,
        marginRight: 5,
        fontWeight: 600,
        textAlign: 'right',
    },
    listContent: {
        flex: 1,
        fontSize: 10.5,
        lineHeight: 1.6,
    },
    // Indentation Levels
    indent1: { marginLeft: 30 },
    indent2: { marginLeft: 60 },
    indent3: { marginLeft: 90 },
    indent4: { marginLeft: 120 },
    indent5: { marginLeft: 150 },
    indent6: { marginLeft: 180 },
    indent7: { marginLeft: 210 },
    indent8: { marginLeft: 240 },

    // Alignment
    alignCenter: { textAlign: 'center' },
    alignRight: { textAlign: 'right' },
    alignJustify: { textAlign: 'justify' },

    bold: {
        fontWeight: 700,
        fontFamily: 'Roboto',
    },
    italic: {
        fontStyle: 'italic',
        fontFamily: 'Roboto',
    },
    underline: {
        textDecoration: 'underline',
    },
    strikethrough: {
        textDecoration: 'line-through',
    },
    link: {
        color: '#06c',
        textDecoration: 'underline',
    },
    code: {
        fontFamily: 'Courier',
        fontSize: 9,
        backgroundColor: '#f0f0f0',
        padding: 1,
        borderRadius: 2,
    },
    blockquote: {
        borderLeftWidth: 2,
        borderLeftColor: '#ccc',
        paddingLeft: 12,
        marginLeft: 5,
        marginBottom: 8,
        color: '#666',
    },
    codeBlock: {
        fontFamily: 'Courier',
        fontSize: 9,
        backgroundColor: '#f5f5f5',
        padding: 8,
        marginBottom: 8,
        borderRadius: 3,
        borderWidth: 0.5,
        borderColor: '#ddd',
    },
    image: {
        maxWidth: '100%',
        marginBottom: 8,
    },
    hr: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        marginVertical: 4,
    },
});



/**
 * Main Rich Text Renderer Component
 * Supports both Quill Delta and HTML formats
 */
export const RichTextRenderer = ({ content, html, baseStyle = {} }) => {
    console.log('content ', html)
    const rawContent = content || html;
    if (!rawContent) return null;


    // 1. Render as HTML/Plain Text
    const contentToRender = rawContent;

    // 2. Render as HTML
    const decodeHtml = (h) => h.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…').replace(/&copy;/g, '©').replace(/&reg;/g, '®').replace(/&trade;/g, '™');

    const cleanTextForPdf = (text) => {
        if (!text) return "";
        return text
            .replace(/Ï/g, "•")
            .replace(/Ë/g, "•")
            .replace(/·/g, "•")
            .replace(//g, "•") // Wingdings square
            .replace(//g, "•") // Wingdings round
            .replace(//g, "•") // Wingdings arrow
            .replace(/(^|[\n\r])o\s+/g, "$1• ") // 'o' used as bullet (Start of line only)
            .replace(/○/g, "•") // Large Circle (White)
            .replace(/§/g, "•")
            .replace(/◦/g, "•") // White bullet (sub-bullet)
            .replace(/▪/g, "•") // Small square (sub-bullet)
            .replace(/⁃/g, "•") // Hyphen bullet
            .replace(/∙/g, "•") // Medium bullet
            .replace(/➢/g, "•") // Arrow bullet
            .replace(//g, "•"); // Wingdings arrow
    };

    const renderInline = (htmlText) => {
        if (!htmlText) return '';
        // Fix for Smart Paste artifacts and weird bullet symbols
        const cleanedHtml = cleanTextForPdf(htmlText);

        const parts = cleanedHtml.split(/(<[^>]+>)/);
        const result = [];
        const stack = [{ color: '#202124', fontSize: 11, fontFamily: 'Roboto' }];

        parts.forEach((part, i) => {
            if (!part) return;
            if (part.startsWith('<') && !part.startsWith('</')) {
                const tag = part.match(/<([a-z0-9]+)/i)?.[1]?.toLowerCase();
                const s = { ...stack[stack.length - 1] };

                if (tag === 'b' || tag === 'strong') { s.fontWeight = 700; s.fontFamily = 'Roboto'; }
                else if (tag === 'i' || tag === 'em') { s.fontStyle = 'italic'; s.fontFamily = 'Roboto'; }
                else if (tag === 'u') s.textDecoration = 'underline';
                else if (tag === 's' || tag === 'strike' || tag === 'del') s.textDecoration = 'line-through';
                else if (tag === 'sup' || tag === 'sub') { s.fontSize = 8; s.verticalAlign = tag === 'sup' ? 'super' : 'sub'; }
                else if (tag === 'code') { s.fontFamily = 'Courier'; s.fontSize = 10; s.backgroundColor = '#f4f4f4'; }
                else if (tag === 'a') { s.color = '#1155cc'; s.textDecoration = 'underline'; s.href = part.match(/href="([^"]+)"/)?.[1]; }
                else if (tag === 'br') { result.push("\n"); } // Handle line breaks
                else if (tag === 'span') {
                    const c = part.match(/color:\s*([^;"]+)/); if (c) s.color = c[1].trim();
                    const b = part.match(/background-color:\s*([^;"]+)/); if (b) s.backgroundColor = b[1].trim();
                    const f = part.match(/font-size:\s*([^;"]+)/); if (f) s.fontSize = f[1].includes('px') ? parseInt(f[1]) : (f[1].includes('pt') ? parseInt(f[1]) * 1.33 : 11);
                    const fm = part.match(/font-family:\s*([^;"]+)/); if (fm) {
                        const fontFamily = fm[1].trim().toLowerCase();
                        if (fontFamily.includes('serif')) s.fontFamily = 'Times-Roman';
                        else if (fontFamily.includes('mono')) s.fontFamily = 'Courier';
                        else s.fontFamily = 'Roboto';
                    }
                }
                stack.push(s);
            } else if (part.startsWith('</')) {
                stack.pop();
            } else {
                const decoded = decodeHtml(part);
                const s = stack[stack.length - 1];
                if (s.href) {
                    result.push(<Link key={i} src={s.href} style={s}>{decoded}</Link>);
                } else {
                    result.push(<Text key={i} style={s}>{decoded}</Text>);
                }
            }
        });
        return result;
    };

    const parseBlocks = (htmlString, level = 0) => {
        // Cleaning and normalization
        const cleaned = htmlString
            .replace(/&nbsp;/g, ' ')
            .replace(/<span class="ql-cursor">.*?<\/span>/g, '')
            .trim();

        // Improved block splitter to capture tag and attributes separately
        const blockRegex = /<(p|div|h[1-6]|ul|ol|blockquote|pre|hr|table)([^>]*)>(.*?)<\/\1>|<hr[^>]*\/?>/gis;
        const matches = [...cleaned.matchAll(blockRegex)];

        if (matches.length === 0) {
            return <Text style={[styles.paragraph, baseStyle]}>{renderInline(cleaned)}</Text>;
        }

        return matches.map((match, index) => {
            const element = match[0];
            const tag = match[1]?.toLowerCase();
            const attrStr = match[2] || '';
            const content = match[3] || '';
            const key = `html-block-${level}-${index}`;

            if (element.startsWith('<hr')) return <View key={key} style={styles.hr} />;

            // Extract alignment from class
            let blockStyles = [];
            const alignMatch = attrStr.match(/ql-align-(center|right|justify)/i);
            if (alignMatch) blockStyles.push(styles[`align${alignMatch[1].charAt(0).toUpperCase() + alignMatch[1].slice(1)}`]);

            // Extract indentation from class
            const indentMatch = attrStr.match(/ql-indent-(\d+)/);
            if (indentMatch) blockStyles.push(styles[`indent${indentMatch[1]}`]);

            if (tag && tag.startsWith('h')) {
                const hLevel = tag[1];
                return <Text key={key} style={[styles[`heading${hLevel}`], ...blockStyles, baseStyle]}>{renderInline(content)}</Text>;
            }

            if (tag === 'blockquote') {
                return (
                    <View key={key} style={[styles.blockquote, ...blockStyles, { marginLeft: (styles.blockquote.marginLeft || 0) + (level * 20) }]}>
                        {parseBlocks(content, level + 1)}
                    </View>
                );
            }

            if (tag === 'pre') {
                const codeContent = content.replace(/<code[^>]*>|<\/code>/gi, '').replace(/<[^>]+>/g, '');
                return (
                    <View key={key} style={[styles.codeBlock, ...blockStyles, { marginLeft: level * 20 }]}>
                        <Text style={{ fontFamily: 'Courier', fontSize: 9 }}>{decodeHtml(codeContent)}</Text>
                    </View>
                );
            }

            if (tag === 'ul' || tag === 'ol') {
                const isOrdered = tag === 'ol';
                const items = content.split(/<li[^>]*>/i).filter(Boolean);
                let counter = 1;

                return (
                    <View key={key} style={[styles.listContainer, ...blockStyles, { marginLeft: level * 20 }]}>
                        {items.map((item, i) => {
                            // Re-extract attributes for each <li>
                            const liMatch = content.match(new RegExp(`<li([^>]*)>${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'));
                            const liAttrs = liMatch ? liMatch[1] : '';
                            const liContent = item.split(/<\/li>/i)[0];

                            let liStyles = [styles.listItem];
                            const liIndent = liAttrs.match(/ql-indent-(\d+)/);
                            if (liIndent) liStyles.push(styles[`indent${liIndent[1]}`]);

                            const liAlign = liAttrs.match(/ql-align-(center|right|justify)/i);
                            if (liAlign) liStyles.push(styles[`align${liAlign[1].charAt(0).toUpperCase() + liAlign[1].slice(1)}`]);

                            return (
                                <View key={`${key}-li-${i}`} style={liStyles}>
                                    <Text style={isOrdered ? styles.numberMarker : styles.bulletMarker}>
                                        {isOrdered ? `${counter++}.` : '•'}
                                    </Text>
                                    <View style={styles.listContent}>
                                        {renderInline(liContent)}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                );
            }

            if (tag === 'p' || tag === 'div') {
                return (
                    <Text key={key} style={[styles.paragraph, ...blockStyles, baseStyle, { marginLeft: level * 20 }]}>
                        {renderInline(content)}
                    </Text>
                );
            }

            return null;
        });
    };

    return (
        <View style={baseStyle}>
            {parseBlocks(rawContent)}
        </View>
    );
};

export default RichTextRenderer;