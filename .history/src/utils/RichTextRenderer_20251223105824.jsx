import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    paragraph: {
        fontSize: 11,
        lineHeight: 1.5,
        marginBottom: 8,
        textAlign: 'justify',
    },
    bold: {
        fontWeight: 800,
    },
    italic: {
        fontStyle: 'italic',
    },
    underline: {
        textDecoration: 'underline',
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 4,
        marginLeft: 10,
    },
    bulletDot: {
        width: 10,
        fontSize: 11,
    },
    bulletNumber: {
        width: 20,
        fontSize: 11,
    },
    content: {
        flex: 1,
        fontSize: 11,
    }
});

/**
 * Simple HTML to React-PDF parser.
 * Supports: p, b, strong, u, i, em, span (style="color:...")
 * ul, ol, li
 */
export const RichTextRenderer = ({ html, baseStyle = {} }) => {
    if (!html) return null;

    // Basic sanitization/cleanup
    const cleanHtml = html.replace(/&nbsp;/g, ' ');

    const parseNode = (node) => {
        // 1. Split into block elements (p, ul, ol)
        const blocks = cleanHtml.split(/(?=<p|<ul|<ol)|(?<=<\/p>|<\/ul>|<\/ol>)/);

        return blocks.map((block, index) => {
            if (block.startsWith('<p')) {
                const content = block.replace(/<p[^>]*>|<\/p>/g, '');
                // Handle alignment in p tags
                const alignMatch = block.match(/class="ql-align-([^"]+)"/) || block.match(/style="text-align:\s*([^;"]+)"/);
                const pStyle = alignMatch ? { textAlign: alignMatch[1] } : {};

                return <Text key={index} style={[styles.paragraph, baseStyle, pStyle]}>{renderInline(content)}</Text>;
            }
            if (block.startsWith('<ul')) {
                const items = block.split(/(?=<li)|(?<=<\/li>)/);
                return (
                    <View key={index} style={{ marginBottom: 10 }}>
                        {items.map((item, i) => {
                            if (item.startsWith('<li')) {
                                const content = item.replace(/<li[^>]*>|<\/li>/g, '');
                                return (
                                    <View key={i} style={styles.bulletItem}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={[styles.content, baseStyle]}>{renderInline(content)}</Text>
                                    </View>
                                );
                            }
                            return null;
                        })}
                    </View>
                );
            }
            if (block.startsWith('<ol')) {
                const items = block.split(/(?=<li)|(?<=<\/li>)/);
                let count = 1;
                return (
                    <View key={index} style={{ marginBottom: 10 }}>
                        {items.map((item, i) => {
                            if (item.startsWith('<li')) {
                                const content = item.replace(/<li[^>]*>|<\/li>/g, '');
                                return (
                                    <View key={i} style={styles.bulletItem}>
                                        <Text style={styles.bulletNumber}>{count++}.</Text>
                                        <Text style={[styles.content, baseStyle]}>{renderInline(content)}</Text>
                                    </View>
                                );
                            }
                            return null;
                        })}
                    </View>
                );
            }
            // If it's just text (fallback)
            const plain = block.replace(/<[^>]+>/g, '').trim();
            return plain ? <Text key={index} style={[styles.paragraph, baseStyle]}>{plain}</Text> : null;
        });
    };

    const renderInline = (html) => {
        const parts = html.split(/(<[^>]+>|<\/[^>]+>)/);
        const result = [];
        const stack = [{}];

        parts.forEach((part, i) => {
            if (part.startsWith('<') && !part.startsWith('</')) {
                const tag = part.match(/<([a-z1-9]+)/i)?.[1];
                const newStyle = { ...stack[stack.length - 1] };
                if (tag === 'b' || tag === 'strong') newStyle.fontWeight = 800;
                if (tag === 'u') newStyle.textDecoration = 'underline';
                if (tag === 'i' || tag === 'em') newStyle.fontStyle = 'italic';
                if (tag === 'span') {
                    // Robust style parsing
                    const colorMatch = part.match(/color:\s*([^;"]+)/);
                    if (colorMatch) newStyle.color = colorMatch[1].trim();

                    const bgMatch = part.match(/background-color:\s*([^;"]+)/);
                    if (bgMatch) newStyle.backgroundColor = bgMatch[1].trim();
                }
                stack.push(newStyle);
            } else if (part.startsWith('</')) {
                stack.pop();
            } else if (part) {
                // Decode entities
                const decoded = part
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&nbsp;/g, ' ');

                result.push(
                    <Text key={i} style={stack[stack.length - 1]}>
                        {decoded}
                    </Text>
                );
            }
        });

        return result;
    };

    return <View style={baseStyle}>{parseNode(cleanHtml)}</View>;
};
