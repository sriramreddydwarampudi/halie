import { MaterialIcons } from '@expo/vector-icons'
import { XAxisOnlyTransition } from '@lib/animations/transitions'
import { AppSettings } from '@lib/constants/GlobalValues'
import { generateResponse } from '@lib/engine/Inference'
import { useUnfocusTextInput } from '@lib/hooks/UnfocusTextInput'
import { Characters } from '@lib/state/Characters'
import { Chats, useInference } from '@lib/state/Chat'
import { Logger } from '@lib/state/Logger'
import { Theme } from '@lib/theme/ThemeManager'
import { getDocumentAsync } from 'expo-document-picker'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'
import Animated, {
    BounceIn,
    LinearTransition,
    ZoomOut,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

export type Attachment = {
    uri: string
    type: 'image' | 'audio' | 'document'
    name: string
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

type ChatInputHeightStoreProps = {
    height: number
    setHeight: (n: number) => void
}

export const useInputHeightStore = create<ChatInputHeightStoreProps>()((set) => ({
    height: 54,
    setHeight: (n) => set({ height: Math.ceil(n) }),
}))

const ChatInput = () => {
    const insets = useSafeAreaInsets()
    const inputRef = useUnfocusTextInput()

    const { color, borderRadius, spacing } = Theme.useTheme()
    const [sendOnEnter, _] = useMMKVBoolean(AppSettings.SendOnEnter)
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const { addEntry } = Chats.useEntry()
    const { nowGenerating, abortFunction } = useInference(
        useShallow((state) => ({
            nowGenerating: state.nowGenerating,
            abortFunction: state.abortFunction,
        }))
    )
    const setHeight = useInputHeightStore(useShallow((state) => state.setHeight))

    const { charName } = Characters.useCharacterStore(
        useShallow((state) => ({
            charName: state?.card?.name,
        }))
    )

    const { userName } = Characters.useUserStore(
        useShallow((state) => ({ userName: state.card?.name }))
    )

    const [newMessage, setNewMessage] = useState<string>('')

    const abortResponse = async () => {
        Logger.info(`Aborting Generation`)
        if (abortFunction) await abortFunction()
    }

    const handleSend = async () => {
        if (newMessage.trim() !== '' || attachments.length > 0)
            await addEntry(
                userName ?? '',
                true,
                newMessage,
                attachments.map((item) => item.uri)
            )
        const swipeId = await addEntry(charName ?? '', false, '')
        setNewMessage('')
        setAttachments([])
        if (swipeId) generateResponse(swipeId)
    }

    return (
        <View
            onLayout={(e) => {
                setHeight(e.nativeEvent.layout.height)
            }}
            style={{
                position: 'absolute',
                width: '100%',
                bottom: 0,
                paddingBottom: insets.bottom + spacing.s,
                paddingTop: spacing.s,
                paddingHorizontal: spacing.m,
                backgroundColor: color.neutral._100,
                borderTopWidth: 1,
                borderColor: color.neutral._200,
                rowGap: spacing.xs,
            }}>
            <Animated.FlatList
                itemLayoutAnimation={LinearTransition}
                style={{
                    display: attachments.length > 0 ? 'flex' : 'none',
                    padding: spacing.m,
                    backgroundColor: color.neutral._200,
                    borderRadius: borderRadius.m,
                    marginBottom: spacing.s,
                }}
                horizontal
                contentContainerStyle={{ columnGap: spacing.m }}
                data={attachments}
                keyExtractor={(item) => item.uri}
                renderItem={({ item }) => {
                    return (
                        <Animated.View
                            entering={BounceIn}
                            exiting={ZoomOut.duration(100)}
                            style={{ alignItems: 'center', maxWidth: 60, rowGap: 4 }}>
                            <Image
                                source={{ uri: item.uri }}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: borderRadius.m,
                                    borderWidth: 1,
                                    borderColor: color.primary._500,
                                }}
                            />

                            <ThemedButton
                                iconName="close"
                                iconSize={16}
                                buttonStyle={{
                                    borderWidth: 0,
                                    paddingHorizontal: 2,
                                    position: 'absolute',
                                    alignSelf: 'flex-end',
                                    margin: -4,
                                    backgroundColor: color.error._500,
                                    borderRadius: 10,
                                }}
                                onPress={() => {
                                    setAttachments(attachments.filter((a) => a.uri !== item.uri))
                                }}
                            />
                        </Animated.View>
                    )
                }}
            />
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    columnGap: spacing.s,
                }}>
                <TouchableOpacity
                    onPress={async () => {
                        const result = await getDocumentAsync({
                            type: 'image/*',
                            multiple: true,
                            copyToCacheDirectory: true,
                        })
                        if (result.canceled || result.assets.length < 1) return

                        const newAttachments = result.assets
                            .map((item) => ({
                                uri: item.uri,
                                type: 'image',
                                name: item.name,
                            }))
                            .filter(
                                (item) =>
                                    !attachments.some(
                                        (a) => a.name === item.name
                                    )
                            ) as Attachment[]
                        setAttachments([...attachments, ...newAttachments])
                    }}
                    style={{
                        padding: spacing.s,
                    }}>
                    <MaterialIcons name="add-circle-outline" size={28} color={color.primary._500} />
                </TouchableOpacity>

                <AnimatedTextInput
                    layout={XAxisOnlyTransition}
                    ref={inputRef}
                    style={{
                        color: color.text._100,
                        backgroundColor: color.neutral._200,
                        flex: 1,
                        borderRadius: 20,
                        paddingHorizontal: spacing.l,
                        paddingVertical: spacing.s,
                        minHeight: 40,
                        maxHeight: 120,
                    }}
                    placeholder="Type a message..."
                    placeholderTextColor={color.text._700}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    submitBehavior={sendOnEnter ? 'blurAndSubmit' : 'newline'}
                    onSubmitEditing={sendOnEnter ? handleSend : undefined}
                />
                
                <Animated.View layout={XAxisOnlyTransition}>
                    <TouchableOpacity
                        style={{
                            borderRadius: 22,
                            backgroundColor: nowGenerating ? color.error._500 : color.primary._500,
                            width: 44,
                            height: 44,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={nowGenerating ? abortResponse : handleSend}>
                        <MaterialIcons
                            name={nowGenerating ? 'stop' : 'send'}
                            color={color.neutral._100}
                            size={24}
                            style={!nowGenerating ? { marginLeft: 3 } : {}}
                        />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    )
}

export default ChatInput
