import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dawuro",
    short_name: "Dawuro",
    description:
      "Scripture as conversation — a verse in your language and English, spoken aloud, passed person to person on WhatsApp.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7F0",
    theme_color: "#B23A16",
    orientation: "portrait-primary",
    categories: ["lifestyle", "education"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
