import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useColors } from "@/lib/theme";
import { TIERS, type Tier } from "@/lib/types";

/** Same filter as the website: "All" plus only the tiers that have picks. Hidden when there is nothing to choose. */
export function TierChips({
  counts, value, onChange,
}: { counts: Partial<Record<Tier, number>>; value: Tier | "all"; onChange: (t: Tier | "all") => void }) {
  const c = useColors();
  const tiers = TIERS.filter((t) => (counts[t.slug] ?? 0) > 0);
  if (tiers.length < 2) return null;

  const chip = (key: Tier | "all", label: string, n?: number) => {
    const on = value === key;
    return (
      <Pressable
        key={key}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        onPress={() => onChange(key)}
        style={[styles.chip, { borderColor: on ? c.ink : c.line, backgroundColor: on ? c.ink : c.paper }]}
      >
        <Text style={{ color: on ? c.bg : c.ink, fontSize: 14, fontWeight: "600" }}>
          {label}
          {n !== undefined && <Text style={{ fontSize: 12, opacity: 0.7 }}>{`  ${n}`}</Text>}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {chip("all", "All")}
      {tiers.map((t) => chip(t.slug, t.name, counts[t.slug]))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
});
