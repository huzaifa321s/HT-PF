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

    // Basic sanitization/cleanup (optional)
    const cleanHtml = html.replace(/&nbsp;/g, ' ');

    const parseNode = (node) => {
        // This is a very basic parser using regex to find tags.
        // For a production app, a real HTML parser like 'html-parse-stringify' or 'htmlparser2' is better.
        // But since we are in a controlled environment, we can handle the most common tags.

        const segments = [];
        let lastIndex = 0;

        // Simple regex to find top-level block tags or just all tags
        // We'll handle this recursively for nested tags if needed, 
        // but React Quill usually produces relatively flat HTML for these simple formats.

        // Let's use a simpler approach: Split by tags and process.
        const tagRegex = /<([^>]+)>(.*?)<\/\1>|<([^>]+)\/>/g;
        // Actually, recursive parsing is tricky with regex. 
        // Let's use a simple mapping for the most common Quill outputs.

        // 1. Split into block elements (p, ul, ol)
        const blocks = cleanHtml.split(/(?=<p|<ul|<ol)|(?<=<\/p>|<\/ul>|<\/ol>)/);

        return blocks.map((block, index) => {
            if (block.startsWith('<p')) {
                const content = block.replace(/<p[^>]*>|<\/p>/g, '');
                return <Text key={index} style={[styles.paragraph, baseStyle]}>{renderInline(content)}</Text>;
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
        // Process b, strong, u, i, span
        // We'll split by tags and create nested Text components
        const parts = html.split(/(<[^>]+>|<\/[^>]+>)/);
        const result = [];
        const stack = [{}]; // Holds current styles

        parts.forEach((part, i) => {
            if (part.startsWith('<') && !part.startsWith('</')) {
                const tag = part.match(/<([a-z1-9]+)/i)?.[1];
                const newStyle = { ...stack[stack.length - 1] };
                if (tag === 'b' || tag === 'strong') newStyle.fontWeight = 800;
                if (tag === 'u') newStyle.textDecoration = 'underline';
                if (tag === 'i' || tag === 'em') newStyle.fontStyle = 'italic';
                if (tag === 'span') {
                    const colorMatch = part.match(/color:\s*(#[0-9a-fA-F]+|[a-zA-Z]+)/);
                    if (colorMatch) newStyle.color = colorMatch[1];
                }
                stack.push(newStyle);
            } else if (part.startsWith('</')) {
                stack.pop();
            } else if (part) {
                result.push(
                    <Text key={i} style={stack[stack.length - 1]}>
                        {part.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                    </Text>
                );
            }
        });

        return result;
    };

    return <View>{parseNode(cleanHtml)}</View>;
};
