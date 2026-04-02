import ThemedButton from '@components/buttons/ThemedButton'
import AvatarViewer from '@components/views/AvatarViewer'
import Drawer from '@components/views/Drawer'
import HeaderButton from '@components/views/HeaderButton'
import HeaderTitle from '@components/views/HeaderTitle'
import SettingsDrawer from '@components/views/SettingsDrawer'
import Avatar from '@components/views/Avatar'
import { Characters } from '@lib/state/Characters'
import { Chats } from '@lib/state/Chat'
import { Theme } from '@lib/theme/ThemeManager'
import ChatInput, { useInputHeightStore } from '@screens/ChatScreen/ChatInput'
import ChatWindow from '@screens/ChatScreen/ChatWindow'
import ChatsDrawer from '@screens/ChatScreen/ChatsDrawer'
import { useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useShallow } from 'zustand/react/shallow'
import { useChatEditorStore } from './ChatWindow/ChatEditor'

const ChatMenu = () => {
    const insets = useSafeAreaInsets()
    const { color, fontSize, spacing } = Theme.useTheme()
    const { unloadCharacter, charId, charName, charImageId } = Characters.useCharacterStore(
        useShallow((state) => ({
            unloadCharacter: state.unloadCard,
            charId: state.id,
            charName: state.card?.name,
            charImageId: state.card?.image_id,
        }))
    )

    const editorVisible = useChatEditorStore(useShallow((state) => state.editMode))

    const chatInputHeight = useInputHeightStore(useShallow((state) => state.height))
    const heightOffset = insets.bottom < 25 ? chatInputHeight : 0

    const { chat, unloadChat, loadChat } = Chats.useChat()

    const { showSettings } = Drawer.useDrawerStore(
        useShallow((state) => ({
            showSettings: state.values?.[Drawer.ID.SETTINGS],
        }))
    )

    useEffect(() => {
        return () => {
            unloadCharacter()
            unloadChat()
        }
    }, [])

    return (
        <Drawer.Gesture
            config={[
                {
                    drawerID: Drawer.ID.SETTINGS,
                    openDirection: 'right',
                    closeDirection: 'left',
                },
            ]}>
            <View style={{ flex: 1 }}>
                <HeaderTitle 
                    headerTitle={() => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: spacing.m }}>
                            <Avatar 
                                targetImage={Characters.getImageDir(charImageId ?? 0)}
                                style={{ width: 32, height: 32, borderRadius: 16 }}
                            />
                            <Text style={{ color: color.text._100, fontSize: fontSize.l, fontWeight: 'bold' }}>
                                {charName || 'Halie'}
                            </Text>
                        </View>
                    )}
                />
                <HeaderButton
                    headerLeft={() => <Drawer.Button drawerID={Drawer.ID.SETTINGS} />}
                    headerRight={() => null}
                />
                <KeyboardAvoidingView
                    enabled={!editorVisible}
                    keyboardVerticalOffset={insets.bottom + heightOffset}
                    behavior="translate-with-padding"
                    style={{ flex: 1, paddingBottom: insets.bottom }}>
                    {chat && <ChatWindow />}
                    <ChatInput />
                    <AvatarViewer />
                </KeyboardAvoidingView>
                {/**Drawer has to be outside of the KeyboardAvoidingView */}
                <SettingsDrawer useInset />
            </View>
        </Drawer.Gesture>
    )
}

export default ChatMenu
