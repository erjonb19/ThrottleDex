import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HEADER, useColors } from "@/lib/theme";

export default function RootLayout() {
  const c = useColors();
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: HEADER },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          headerBackTitle: "Back",
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "ThrottleDex" }} />
        <Stack.Screen name="[metro]/index" options={{ title: "" }} />
        <Stack.Screen name="[metro]/[handle]" options={{ title: "" }} />
      </Stack>
    </>
  );
}
