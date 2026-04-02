import { db } from '@db'
import { diary, characters } from 'db/schema'
import { eq, desc } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import React from 'react'
import { FlatList, View, Text } from 'react-native'
import { Theme } from '@lib/theme/ThemeManager'
import { Characters } from '@lib/state/Characters'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import TText from '@components/text/TText'
import { Time } from '@lib/utils/Time'

const DiaryScreen = () => {
    const { color, spacing, borderRadius, fontSize } = Theme.useTheme()
    const insets = useSafeAreaInsets()
    const charId = Characters.useCharacterStore((state) => state.id)

    const { data: entries } = useLiveQuery(
        db.query.diary.findMany({
            where: charId ? eq(diary.character_id, charId) : undefined,
            orderBy: desc(diary.create_date),
        })
    )

    const renderItem = ({ item }: { item: typeof diary.$inferSelect }) => (
        <View
            style={{
                backgroundColor: color.neutral._200,
                borderRadius: borderRadius.m,
                padding: spacing.m,
                marginBottom: spacing.m,
            }}>
            <TText
                style={{
                    fontSize: fontSize.s,
                    color: color.text._700,
                    marginBottom: spacing.xs,
                }}>
                {Time.formatDate(item.create_date)}
            </TText>
            <TText style={{ color: color.text._100 }}>{item.content}</TText>
        </View>
    )

    return (
        <View style={{ flex: 1, backgroundColor: color.neutral._100, paddingHorizontal: spacing.m }}>
            <FlatList
                data={entries}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: insets.top + spacing.m, paddingBottom: insets.bottom + spacing.m }}
                ListEmptyComponent={
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
                        <TText style={{ color: color.text._400 }}>No entries yet. Halie is still thinking...</TText>
                    </View>
                }
            />
        </View>
    )
}

export default DiaryScreen
