import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/lib/theme";

export function Loading() {
  const c = useColors();
  return (
    <View style={[styles.center, { backgroundColor: c.bg }]}>
      <ActivityIndicator color={c.accent} />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  const c = useColors();
  return (
    <View style={[styles.center, { backgroundColor: c.bg }]}>
      <Text style={[styles.msg, { color: c.ink2 }]}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry} style={[styles.btn, { backgroundColor: c.accent }]}>
        <Text style={{ color: c.accentInk, fontWeight: "600" }}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={[styles.notice, { borderColor: c.line, backgroundColor: c.open }]}>
      <Text style={{ color: c.ink2, fontSize: 15, lineHeight: 21 }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  msg: { fontSize: 15, textAlign: "center", lineHeight: 21 },
  btn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  notice: { borderWidth: 1, borderStyle: "dashed", borderRadius: 10, padding: 16 },
});
