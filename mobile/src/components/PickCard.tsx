import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { recordClick, vendorLink } from "@/lib/data";
import { useColors } from "@/lib/theme";
import { STALE_AFTER_MONTHS, monthsSince, type Category, type Listing } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmt(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function open(listingId: string, url: string) {
  recordClick(listingId);
  void Linking.openURL(url);
}

/** One category slot: a pick with its links, or an honest "No pick yet". Mirrors the website's Slot. */
export function PickCard({ category, listing }: { category: Category; listing?: Listing }) {
  const c = useColors();

  if (!listing) {
    return (
      <View style={[styles.card, styles.open, { borderColor: c.line, backgroundColor: c.open }]}>
        <View style={styles.row}>
          <Text style={[styles.eyebrow, { color: c.ink3 }]}>{category.name}</Text>
          <Text style={[styles.eyebrow, { color: c.ink3 }]}>OPEN</Text>
        </View>
        <Text style={[styles.purpose, { color: c.ink2 }]}>{category.purpose}</Text>
        <Text style={[styles.name, { color: c.ink3, fontWeight: "500" }]}>No pick yet</Text>
      </View>
    );
  }

  const v = listing.vendor;
  const link = vendorLink(v);
  const stale = monthsSince(listing.confirmed_at) > STALE_AFTER_MONTHS;

  return (
    <View testID={`pick-${category.slug}`} style={[styles.card, { borderColor: c.line, backgroundColor: c.paper }]}>
      <Text style={[styles.eyebrow, { color: c.ink3 }]}>{category.name}</Text>
      <Text style={[styles.purpose, { color: c.ink2 }]}>{category.purpose}</Text>
      <Text style={[styles.name, { color: c.ink }]}>{v.name}</Text>
      {!!v.area && <Text style={[styles.mono, { color: c.ink2 }]}>{v.area}</Text>}
      {!!listing.note && <Text style={[styles.note, { color: c.ink2 }]}>{listing.note}</Text>}
      <View style={[styles.row, styles.actions]}>
        {link && (
          <Pressable accessibilityRole="link" onPress={() => open(listing.id, link.url)} hitSlop={8}>
            <Text style={[styles.link, { color: c.accent, borderColor: c.accent }]}>{link.label}</Text>
          </Pressable>
        )}
        {!!v.phone && (
          <Pressable accessibilityRole="link" accessibilityLabel={`Call ${v.name}`} onPress={() => open(listing.id, `tel:${v.phone.replace(/[^\d+]/g, "")}`)} hitSlop={8}>
            <Text style={[styles.link, { color: c.accent, borderColor: c.accent }]}>Call {v.phone}</Text>
          </Pressable>
        )}
      </View>
      <Text style={[styles.mono, { color: stale ? c.warn : c.good }]}>
        {stale ? "needs re-check, last confirmed " : "confirmed "}
        {fmt(listing.confirmed_at)}
      </Text>
      {v.status === "paused" && <Text style={[styles.mono, { color: c.warn }]}>taking a break from new work</Text>}
      {v.status === "closed" && <Text style={[styles.mono, { color: c.warn }]}>closed</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 10, padding: 16, gap: 5 },
  open: { borderStyle: "dashed" },
  row: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  actions: { justifyContent: "flex-start", marginTop: 6, rowGap: 8 },
  eyebrow: { fontSize: 11.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  purpose: { fontSize: 13 },
  name: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  mono: { fontSize: 12, fontFamily: "monospace" },
  note: { fontSize: 14, lineHeight: 20 },
  link: { fontSize: 14.5, fontWeight: "600", borderBottomWidth: 1, paddingBottom: 1 },
});
