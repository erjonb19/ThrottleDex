import { useColorScheme } from "react-native";

/* Same tokens as the website (src/app/globals.css): cool neutrals, petrol-blue accent, one hazard stripe. */
const light = {
  bg: "#f3f5f7", paper: "#ffffff", ink: "#15202b", ink2: "#4b5866", ink3: "#7c8794", line: "#d5dbe2",
  accent: "#1b6a86", accentInk: "#ffffff", stripe: "#f2c230", open: "#eef1f4", good: "#2f7d4f", warn: "#b4650e",
};
const dark: typeof light = {
  bg: "#141a20", paper: "#1c242c", ink: "#eef2f5", ink2: "#b7c1cb", ink3: "#8692a0", line: "#2f3a45",
  accent: "#6cc0dd", accentInk: "#0e1a20", stripe: "#e4b62a", open: "#1a2129", good: "#6fcf97", warn: "#e8a84a",
};

export type Colors = typeof light;
export const HEADER = "#15202b";

export function useColors(): Colors {
  return useColorScheme() === "dark" ? dark : light;
}
