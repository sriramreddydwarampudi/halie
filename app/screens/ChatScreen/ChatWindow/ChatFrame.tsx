import Avatar from '@components/views/Avatar'
import { AppSettings } from '@lib/constants/GlobalValues'
import { useAvatarViewerStore } from '@lib/state/AvatarViewer'
import { Characters } from '@lib/state/Characters'
import { Chats } from '@lib/state/Chat'
import { Theme } from '@lib/theme/ThemeManager'
import { ReactNode } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'

type ChatFrameProps = {
    children?: ReactNode
    index: number
    nowGenerating: boolean
    isLast?: boolean
}

const ChatFrame: React.FC<ChatFrameProps> = ({ children, index, nowGenerating, isLast }) => {
    const { color, spacing, borderRadius, fontSize } = Theme.useTheme()
    const message = Chats.useEntryData(index)
    const setShowViewer = useAvatarViewerStore((state) => state.setShow)
    const charImageId = Characters.useCharacterStore((state) => state.card?.image_id) ?? 0
    const userImageId = Characters.useUserStore((state) => state.card?.image_id) ?? 0

    const swipe = message.swipes[message.swipe_id]

    const getDeltaTime = () =>
        Math.round(
            Math.max(
                0,
                ((nowGenerating && isLast ? Date.now() : swipe.gen_finished.getTime()) -
                    swipe.gen_started.getTime()) /
                    1000
            )
        )
    const deltaTime = getDeltaTime()

    const isUser = message.is_user
    const rowDir = isUser ? 'row-reverse' : 'row'
    const align = isUser ? 'flex-end' : 'flex-start'

    return (
        <View style={{ flex: 1, flexDirection: rowDir, alignItems: 'flex-end', paddingHorizontal: 4 }}>
            {!isUser && (
                <TouchableOpacity onPress={() => setShowViewer(true, false)}>
                    <Avatar
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            marginRight: spacing.m,
                            marginBottom: spacing.xs,
                        }}
                        targetImage={Characters.getImageDir(charImageId)}
                    />
                </TouchableOpacity>
            )}
            <View style={{ flex: 1, alignItems: align }}>
                {children}
                <View style={{ 
                    flexDirection: rowDir, 
                    columnGap: 8, 
                    marginTop: 4, 
                    marginHorizontal: spacing.m,
                    opacity: 0.6
                }}>
                    <Text style={{ fontSize: fontSize.xs, color: color.text._500 }}>
                        {swipe.gen_finished.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {!isUser && index !== 0 && (
                        <Text style={{ fontSize: fontSize.xs, color: color.text._700 }}>
                            {deltaTime}s
                        </Text>
                    )}
                </View>
            </View>
            {isUser && (
                <TouchableOpacity onPress={() => setShowViewer(true, true)}>
                    <Avatar
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            marginLeft: spacing.m,
                            marginBottom: spacing.xs,
                        }}
                        targetImage={Characters.getImageDir(userImageId)}
                    />
                </TouchableOpacity>
            )}
        </View>
    )
}

export default ChatFrame
