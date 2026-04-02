import { db } from '@db'
import { chats } from 'db/schema'
import { eq } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import React, { useState, useEffect } from 'react'
import { View, ScrollView, TextInput, StyleSheet } from 'react-native'
import { Theme } from '@lib/theme/ThemeManager'
import { Chats } from '@lib/state/Chat'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import TText from '@components/text/TText'
import ThemedButton from '@components/buttons/ThemedButton'
import { Logger } from '@lib/state/Logger'

const UserMemoryScreen = () => {
    const { color, spacing, borderRadius, fontSize, borderWidth } = Theme.useTheme()
    const insets = useSafeAreaInsets()
    const chatId = Chats.useChatState((state) => state.data?.id)
    
    const { data: chatData } = useLiveQuery(
        db.query.chats.findFirst({
            where: chatId ? eq(chats.id, chatId) : undefined,
        })
    )

    const [memory, setMemory] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        if (chatData !== undefined) {
            setMemory(chatData.user_memory)
        }
    }, [chatData])

    const handleSave = async () => {
        if (chatId) {
            await Chats.db.mutate.updateUserMemory(chatId, memory)
            setIsEditing(false)
            Logger.infoToast('Memory updated')
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: color.neutral._100 }}>
            <ScrollView 
                contentContainerStyle={{ 
                    paddingTop: insets.top + spacing.xl, 
                    paddingBottom: insets.bottom + spacing.xl,
                    paddingHorizontal: spacing.xl 
                }}
            >
                <TText style={{ fontSize: fontSize.xl2, color: color.text._100, marginBottom: spacing.m }}>
                    Halie's Memory
                </TText>
                <TText style={{ color: color.text._400, marginBottom: spacing.xl }}>
                    This is what Halie remembers about you. It is automatically updated during conversation, but you can also edit it manually.
                </TText>

                <View style={{
                    backgroundColor: color.neutral._200,
                    borderRadius: borderRadius.m,
                    padding: spacing.l,
                    borderWidth: borderWidth.m,
                    borderColor: isEditing ? color.primary._500 : 'transparent',
                    minHeight: 200,
                }}>
                    {isEditing ? (
                        <TextInput
                            multiline
                            value={memory}
                            onChangeText={setMemory}
                            style={{
                                color: color.text._100,
                                fontSize: fontSize.m,
                                textAlignVertical: 'top',
                            }}
                            placeholder="Halie doesn't remember anything yet..."
                            placeholderTextColor={color.text._600}
                        />
                    ) : (
                        <TText style={{ color: color.text._100, fontSize: fontSize.m }}>
                            {memory || "Halie doesn't remember anything yet..."}
                        </TText>
                    )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xl, columnGap: spacing.m }}>
                    {isEditing ? (
                        <>
                            <ThemedButton 
                                label="Cancel" 
                                variant="secondary" 
                                onPress={() => {
                                    setMemory(chatData?.user_memory ?? '')
                                    setIsEditing(false)
                                }} 
                            />
                            <ThemedButton 
                                label="Save Changes" 
                                variant="primary" 
                                onPress={handleSave} 
                            />
                        </>
                    ) : (
                        <ThemedButton 
                            label="Edit Memory" 
                            variant="secondary" 
                            onPress={() => setIsEditing(true)} 
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

export default UserMemoryScreen
