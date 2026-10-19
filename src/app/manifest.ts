import type { MetadataRoute } from "next";

/** Makes ThrottleDex installable: "Add to Home Screen" opens it full screen with its own icon. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ThrottleDex",
    short_name: "ThrottleDex",
    description: "The car people real enthusiasts send their friends to, one city at a time.",
    start_url: "/cities",
    scope: "/",
    display: "standalone",
    background_color: "#15202b",
    theme_color: "#15202b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
