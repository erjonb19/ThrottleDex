import { router, Stack, useLocalSearchParams } from "expo-router";
import { FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ErrorView, Loading, Notice } from "@/components/States";
import { SITE_URL, getCurators } from "@/lib/data";
import { useColors } from "@/lib/theme";
import { useLoad } from "@/lib/useLoad";

/** One city: everyone with an approved list there, or a "coming soon" invite. */
export default function CityScreen() {
  const { metro } = useLocalSearchParams<{ metro: string }>();
  const c = useColors();
  const { data, error, loading, refreshing, refresh, retry } = useLoad(() => getCurators(metro), metro);
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={retry} />;
  if (!data?.metro) return <ErrorView message="We don't cover that city yet." onRetry={retry} />;
  const m = data.metro;

  return (
    <>
      <Stack.Screen options={{ title: m.name }} />
      <FlatList
        data={data.curators}
        keyExtractor={(x) => x.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={[styles.header, { borderColor: c.stripe }]}>
            <Text style={[styles.eyebrow, { color: c.ink3 }]}>{m.name}</Text>
            <Text style={[styles.h1, { color: c.ink }]}>Whose list do you trust?</Text>
            <Text style={[styles.lede, { color: c.ink2 }]}>
              Each list belongs to one person who stands behind it. Pick someone whose cars and taste are close to yours.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ gap: 12 }}>
            <Notice>
              {`Coming soon. ${m.name} doesn't have a list yet. If you're the person friends ask "who do you use for that?", start the first one. It goes live once we approve it.`}
            </Notice>
            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL(`${SITE_URL}/login`)}
              style={[styles.btn, { backgroundColor: c.accent }]}
            >
              <Text style={{ color: c.accentInk, fontWeight: "700", fontSize: 15 }}>{`Start the first ${m.name} list`}</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item: cur }) => (
            <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/[metro]/[handle]", params: { metro, handle: cur.handle } })} testID={`curator-${cur.handle}`} style={[styles.card, { borderColor: c.line, backgroundColor: c.paper }]}>
              <Text style={[styles.name, { color: c.ink }]}>{cur.display_name}</Text>
              <Text style={[styles.mono, { color: c.ink3 }]}>/{metro}/{cur.handle}</Text>
              {!!cur.bio && <Text style={[styles.bio, { color: c.ink2 }]} numberOfLines={3}>{cur.bio}</Text>}
            </Pressable>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  header: { borderBottomWidth: 6, paddingBottom: 16, marginBottom: 8, gap: 6 },
  eyebrow: { fontSize: 11.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  h1: { fontSize: 30, fontWeight: "800", lineHeight: 33 },
  lede: { fontSize: 15, lineHeight: 21, marginTop: 4 },
  card: { borderWidth: 1, borderRadius: 10, padding: 16, gap: 3 },
  name: { fontSize: 22, fontWeight: "700" },
  mono: { fontSize: 12, fontFamily: "monospace" },
  bio: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  btn: { alignSelf: "flex-start", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 8 },
});
