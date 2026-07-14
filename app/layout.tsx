import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif, Source_Serif_4 } from "next/font/google";
import { OfflineBanner } from "@/components/OfflineBanner";
import "./globals.css";

/** UI sans — good Latin coverage; Noto handles Twi diacritics (ɛ ɔ Ɛ Ɔ). */
const notoSans = Noto_Sans({
  variable: "--font-ui",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Verse serif — diacritic-safe for Twi Scripture text. */
const notoSerif = Noto_Serif({
  variable: "--font-verse",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "Dawuro — Scripture in the voice of your people",
  description:
    "Speak or type what's on your heart. Receive Scripture in English and Twi, hear it aloud, and share it on WhatsApp.",
  applicationName: "Dawuro",
  appleWebApp: {
    capable: true,
    title: "Dawuro",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Dawuro",
    description:
      "Scripture in English and Twi — spoken aloud, shareable on WhatsApp.",
    type: "website",
    images: [{ url: "/og.png", width: 512, height: 512, alt: "Dawuro" }],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B23A16",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSerif.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
