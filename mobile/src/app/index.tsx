import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ErrorView, Loading } from "@/components/States";
import { getCities } from "@/lib/data";
import { useColors } from "@/lib/theme";
import { useLoad } from "@/lib/useLoad";

/** First screen: every city, live ones first, the rest marked coming soon. */
export default function CitiesScreen() {
  const c = useColors();
  const { data, error, loading, refreshing, refresh, retry } = useLoad(getCities, "cities");
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={retry} />;

  return (
    <FlatList
      data={data}
      keyExtractor={(m) => m.slug}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={
        <View style={[styles.header, { borderColor: c.stripe }]}>
          <Text style={[styles.eyebrow, { color: c.ink3 }]}>Who do you use for that?</Text>
          <Text style={[styles.h1, { color: c.ink }]}>The car people real enthusiasts send their friends to.</Text>
          <Text style={[styles.lede, { color: c.ink2 }]}>Pick a city. Each list belongs to one person who stands behind it.</Text>
        </View>
      }
      renderItem={({ item: m }) => {
        const live = m.lists > 0;
        return (
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push({ pathname: "/[metro]", params: { metro: m.slug } })}
              testID={`city-${m.slug}`}
              style={[styles.card, { borderColor: c.line, backgroundColor: live ? c.paper : c.open }, !live && styles.dashed]}
            >
              <View style={styles.row}>
                <Text style={[styles.city, { color: c.ink }]}>{m.name}</Text>
                <Text style={[styles.eyebrow, { color: live ? c.good : c.ink3 }]}>
                  {live ? `${m.lists} ${m.lists === 1 ? "list" : "lists"}` : "coming soon"}
                </Text>
              </View>
              <Text style={[styles.areas, { color: c.ink2 }]} numberOfLines={2}>
                {m.areas.filter((a) => !a.startsWith("Mobile")).join(" · ")}
              </Text>
            </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  header: { borderBottomWidth: 6, paddingBottom: 16, marginBottom: 8, gap: 6 },
  eyebrow: { fontSize: 11.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  h1: { fontSize: 30, fontWeight: "800", lineHeight: 33 },
  lede: { fontSize: 15, lineHeight: 21, marginTop: 4 },
  card: { borderWidth: 1, borderRadius: 10, padding: 16, gap: 4 },
  dashed: { borderStyle: "dashed" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 },
  city: { fontSize: 22, fontWeight: "700", flexShrink: 1 },
  areas: { fontSize: 13 },
});
