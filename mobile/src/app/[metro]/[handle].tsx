import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { PickCard } from "@/components/PickCard";
import { ErrorView, Loading } from "@/components/States";
import { TierChips } from "@/components/TierChips";
import { getCuratorPage } from "@/lib/data";
import { useColors } from "@/lib/theme";
import type { Category, Listing, Tier } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";

type Row = { category: Category; listing?: Listing };

/** One curator's list, grouped like the website, with the same tier filter. */
export default function CuratorScreen() {
  const { metro, handle } = useLocalSearchParams<{ metro: string; handle: string }>();
  const c = useColors();
  const [tier, setTier] = useState<Tier | "all">("all");
  const { data, error, loading, refreshing, refresh, retry } = useLoad(() => getCuratorPage(metro, handle), `${metro}/${handle}`);

  const { sections, counts } = useMemo(() => {
    if (!data) return { sections: [], counts: {} as Partial<Record<Tier, number>> };
    const byCategory = new Map(data.listings.map((l) => [l.vendor.category, l]));
    const counts: Partial<Record<Tier, number>> = {};
    for (const l of data.listings) for (const t of l.vendor.tiers ?? []) counts[t] = (counts[t] ?? 0) + 1;
    const groups = [...new Set(data.categories.map((x) => x.group_name))];
    const sections = groups
      .map((g) => {
        const cats = data.categories.filter((x) => x.group_name === g);
        const rows: Row[] = cats
          .map((category) => ({ category, listing: byCategory.get(category.slug) }))
          // A tier filter shows only picks tagged for it; "All" also shows open slots.
          .filter((r) => (tier === "all" ? true : !!r.listing?.vendor.tiers?.includes(tier)));
        return { title: g, filled: cats.filter((x) => byCategory.has(x.slug)).length, total: cats.length, data: rows };
      })
      .filter((s) => s.data.length > 0);
    return { sections, counts };
  }, [data, tier]);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorView message={error} onRetry={retry} />;
  if (!data) return <ErrorView message="This list isn't public. It may not be approved yet." onRetry={retry} />;
  const { curator, listings, categories, metro: m } = data;

  return (
    <>
      <Stack.Screen options={{ title: curator.display_name }} />
      <SectionList
        sections={sections}
        keyExtractor={(r) => r.category.slug}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={{ gap: 10 }}>
            <View style={[styles.header, { borderColor: c.stripe }]}>
              <Text style={[styles.eyebrow, { color: c.ink3 }]}>{m?.name ?? metro} · ThrottleDex</Text>
              <Text style={[styles.h1, { color: c.ink }]}>{curator.display_name}&apos;s car people</Text>
              <Text style={[styles.mono, { color: c.ink2 }]}>{listings.length} of {categories.length} slots filled</Text>
            </View>
            {!!curator.bio && <Text style={[styles.bio, { color: c.ink2 }]}>{curator.bio}</Text>}
            <TierChips counts={counts} value={tier} onChange={setTier} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}>
            <Text style={[styles.h2, { color: c.ink }]}>{section.title}</Text>
            <Text style={[styles.mono, { color: c.ink3 }]}>{section.filled}/{section.total}</Text>
          </View>
        )}
        renderItem={({ item }) => <PickCard category={item.category} listing={item.listing} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={
          <View style={[styles.footer, { borderColor: c.line }]}>
            <Text style={[styles.h2, { color: c.ink, fontSize: 18 }]}>How this list works</Text>
            {[
              `Every name here is someone ${curator.display_name} has paid, or sent a friend to on their own name.`,
              "Picks are re-checked about every six months. Shops change hands, lose their best painter, or close.",
              "A pick not confirmed in nine months is flagged until it is.",
              "Nobody pays to be on this list.",
            ].map((t, i) => (
              <Text key={i} style={[styles.bio, { color: c.ink2, fontSize: 14 }]}>{`${i + 1}. ${t}`}</Text>
            ))}
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  header: { borderBottomWidth: 6, paddingBottom: 14, gap: 6 },
  eyebrow: { fontSize: 11.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  h1: { fontSize: 32, fontWeight: "800", lineHeight: 35 },
  h2: { fontSize: 22, fontWeight: "700", textTransform: "uppercase" },
  mono: { fontSize: 12, fontFamily: "monospace" },
  bio: { fontSize: 15, lineHeight: 21 },
  sectionHead: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 28, marginBottom: 12 },
  footer: { borderTopWidth: 1, marginTop: 36, paddingTop: 14, gap: 6 },
});
