import Accordion from '@components/views/Accordion'
import { Theme } from '@lib/theme/ThemeManager'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { MarkdownIt } from 'react-native-markdown-display'

import ThemedButton from '@components/buttons/ThemedButton'
import { Logger } from '@lib/state/Logger'
import { setStringAsync } from 'expo-clipboard'
import doubleQuotePlugin from './MarkdownQuotePlugin'
import thinkPlugin from './MarkdownThinkPlugin'
import latexPlugin from './MarkdownLatexPlugin'
import MathJax from 'react-native-mathjax-svg'
import { useMemo } from 'react'

export namespace MarkdownStyle {
    export const Rules = MarkdownIt({ typographer: true })
        .use(thinkPlugin)
        .use(doubleQuotePlugin)
        .use(latexPlugin)

    export const RenderRules = {
        fence: (node: any, children: any, parent: any, styles: any, inheritedStyles = {}) => {
            let { content, sourceInfo } = node
            if (
                typeof node.content === 'string' &&
                node.content.charAt(node.content.length - 1) === '\n'
            ) {
                content = node.content.substring(0, node.content.length - 1)
            }
            return (
                <View key={node.key}>
                    <View style={styles.fenceHeader}>
                        <Text style={{ color: styles.fenceHeader.color }}>
                            {sourceInfo || 'Code'}
                        </Text>
                        {content && (
                            <ThemedButton
                                iconName="copy1"
                                variant="tertiary"
                                iconStyle={{ color: styles.fenceHeader.color }}
                                onPress={() => {
                                    setStringAsync(content)
                                        .then(() => {
                                            Logger.infoToast('Copied Code')
                                        })
                                        .catch(() => {
                                            Logger.errorToast('Failed to copy to clipboard')
                                        })
                                }}
                            />
                        )}
                    </View>
                    <Text style={[inheritedStyles, styles.fence]}>{content}</Text>
                </View>
            )
        },
        double_quote: (node: any, children: any, parent: any, styles: any) => {
            return (
                <Text key={node.key} style={styles.double_quote}>
                    {children}
                </Text>
            )
        },
        think: (node: any, children: any, parent: any, styles: any) => {
            return (
                <Accordion
                    key={node.key}
                    label={node.sourceInfo ? 'Thought Process' : 'Thinking...'}
                    style={{
                        flex: 1,
                        marginBottom: 8,
                        elevation: 8,
                    }}>
                    {children}
                </Accordion>
            )
        },
        latex_block: (node: any, children: any, parent: any, styles: any) => {
            const { content } = node
            return (
                <MathJax
                    key={node.key}
                    style={styles.latex_block}
                    color={styles.latex_block.color ?? 'white'}>
                    {content}
                </MathJax>
            )
        },
        latex_inline: (node: any, children: any, parent: any, styles: any) => {
            const { content } = node
            return (
                <MathJax
                    key={node.key}
                    style={styles.latex_inline}
                    color={styles.latex_inline.color ?? 'white'}>
                    {content}
                </MathJax>
            )
        },
    }

    export const useCustomFormatting = (isUser?: boolean) => {
        const mdStyle = useMarkdownStyle(isUser)

        const { markdown, rules, style } = useMemo(
            () => ({
                markdown: Rules,
                rules: RenderRules,
                style: mdStyle,
            }),
            [Rules, RenderRules, mdStyle]
        )
        return { markdown, rules, style }
    }

    export const useMarkdownStyle = (isUser?: boolean) => {
        const { color, spacing, borderRadius } = Theme.useTheme()

        const textColor = isUser ? '#FFFFFF' : color.text._100
        const secondaryTextColor = isUser ? 'rgba(255, 255, 255, 0.7)' : color.text._400

        return useMemo(
            () =>
                StyleSheet.create({
                    double_quote: { color: isUser ? '#FFFFFF' : color.quote },
                    // The main container
                    body: {
                        color: textColor,
                    },

                    // Headings
                    heading1: {
                        flexDirection: 'row',
                        fontSize: 32,
                        color: textColor,
                        fontWeight: '500',
                    },
                    heading2: {
                        flexDirection: 'row',
                        fontSize: 24,
                        color: textColor,
                        fontWeight: '500',
                    },
                    heading3: {
                        flexDirection: 'row',
                        fontSize: 18,
                        color: textColor,
                        fontWeight: '500',
                    },
                    heading4: {
                        flexDirection: 'row',
                        fontSize: 16,
                        color: textColor,
                        fontWeight: '500',
                    },
                    heading5: {
                        flexDirection: 'row',
                        fontSize: 13,
                        color: textColor,
                        fontWeight: '500',
                    },
                    heading6: {
                        flexDirection: 'row',
                        fontSize: 11,
                        color: textColor,
                        fontWeight: '500',
                    },

                    // Horizontal Rule
                    hr: {
                        backgroundColor: isUser ? '#FFFFFF' : color.primary._500,
                        height: 1,
                        marginTop: spacing.m,
                    },

                    // Emphasis
                    strong: {
                        fontWeight: 'bold',
                        color: textColor,
                    },
                    em: {
                        fontStyle: 'italic',
                        color: secondaryTextColor,
                    },
                    s: {
                        textDecorationLine: 'line-through',
                        color: secondaryTextColor,
                    },

                    // Blockquotes
                    blockquote: {
                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : color.neutral._200,
                        borderColor: isUser ? '#FFFFFF' : color.primary._500,
                        borderLeftWidth: 4,
                        marginLeft: spacing.sm,
                        paddingHorizontal: spacing.sm,
                        color: secondaryTextColor,
                    },

                    // Lists
                    bullet_list: {
                        marginVertical: spacing.sm,
                    },
                    ordered_list: {
                        marginVertical: spacing.sm,
                    },
                    list_item: {
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        color: textColor,
                    },
                    // @pseudo class, does not have a unique render rule
                    bullet_list_icon: {
                        color: secondaryTextColor,
                        marginLeft: spacing.m,
                        marginRight: spacing.m,
                    },
                    // @pseudo class, does not have a unique render rule
                    bullet_list_content: {
                        flex: 1,
                        color: textColor,
                    },
                    // @pseudo class, does not have a unique render rule
                    ordered_list_icon: {
                        color: secondaryTextColor,
                        marginLeft: spacing.m,
                        marginRight: spacing.m,
                    },
                    // @pseudo class, does not have a unique render rule
                    ordered_list_content: {
                        flex: 1,
                        color: textColor,
                    },

                    // Code
                    code_inline: {
                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : color.neutral._200,
                        paddingHorizontal: spacing.m,
                        flex: 1,
                        borderRadius: 4,
                        color: textColor,
                        ...Platform.select({
                            ios: {
                                fontFamily: 'Courier',
                            },
                            android: {
                                fontFamily: 'monospace',
                            },
                        }),
                    },
                    code_block: {
                        color: secondaryTextColor,
                        borderWidth: 1,
                        borderColor: isUser ? 'rgba(255, 255, 255, 0.3)' : color.neutral._100,
                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : color.neutral._200,
                        padding: 4,
                        borderRadius: 8,
                        ...Platform.select({
                            ios: {
                                fontFamily: 'Courier',
                            },
                            android: {
                                fontFamily: 'monospace',
                            },
                        }),
                    },
                    fence: {
                        color: isUser ? '#FFFFFF' : color.text._300,
                        backgroundColor: isUser ? 'rgba(0,0,0,0.3)' : color.neutral._400,
                        paddingLeft: spacing.l,
                        paddingRight: spacing.l,
                        paddingVertical: spacing.m,
                        marginBottom: spacing.m,
                        borderBottomLeftRadius: borderRadius.m,
                        borderBottomRightRadius: borderRadius.m,
                        ...Platform.select({
                            ios: {
                                fontFamily: 'Courier',
                            },
                            android: {
                                fontFamily: 'monospace',
                            },
                        }),
                    },

                    fenceHeader: {
                        color: isUser ? '#FFFFFF' : color.text._300,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 4,
                        paddingHorizontal: 12,
                        backgroundColor: isUser ? 'rgba(0,0,0,0.5)' : color.neutral._300,
                        borderTopLeftRadius: borderRadius.m,
                        borderTopRightRadius: borderRadius.m,
                        marginTop: spacing.sm,
                    },

                    // Tables
                    table: {
                        borderWidth: 1,
                        borderColor: isUser ? 'rgba(255, 255, 255, 0.3)' : color.primary._200,
                        borderRadius: borderRadius.m,
                        marginBottom: spacing.m,
                        overflow: 'hidden',
                    },
                    thead: {
                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : color.neutral._100,
                    },
                    tbody: {
                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.05)' : color.neutral._200,
                    },
                    th: {
                        flex: 1,
                        padding: 8,
                        color: textColor,
                    },
                    tr: {
                        borderBottomWidth: 1,
                        borderColor: isUser ? 'rgba(255, 255, 255, 0.2)' : color.neutral._300,
                        flexDirection: 'row',
                    },
                    td: {
                        flex: 1,
                        padding: 8,
                        color: textColor,
                    },

                    // Links
                    link: {
                        textDecorationLine: 'underline',
                        color: isUser ? '#FFFFFF' : color.primary._500,
                    },
                    blocklink: {
                        flex: 1,
                        borderColor: '#000000',
                        borderBottomWidth: 1,
                    },

                    // Images
                    image: {
                        flex: 1,
                    },

                    // Text Output
                    text: {
                        color: textColor,
                    },
                    textgroup: {
                        color: textColor,
                    },
                    latex_inline: {
                        color: isUser ? '#FFFFFF' : color.text._300,
                    },
                    latex_block: {
                        color: isUser ? '#FFFFFF' : color.text._300,
                        marginTop: spacing.l,
                        marginBottom: spacing.sm,
                    },
                    paragraph: {
                        flexWrap: 'wrap',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        width: '100%',
                        color: textColor,
                        marginVertical: spacing.sm,
                    },

                    hardbreak: {
                        width: '100%',
                        height: 1,
                        color: textColor,
                    },
                    softbreak: {},

                    // Believe these are never used but retained for completeness
                    pre: {},
                    inline: {},
                    span: {},
                }),
            [color, spacing, borderRadius, isUser, textColor, secondaryTextColor]
        )
    }
}
