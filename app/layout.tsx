import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif, Source_Serif_4 } from "next/font/google";
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
  title: "Dawuro — Scripture in the voice of your people",
  description:
    "Speak or type what's on your heart. Receive Scripture in English and Twi, hear it aloud, and share it on WhatsApp.",
  applicationName: "Dawuro",
  appleWebApp: {
    capable: true,
    title: "Dawuro",
    statusBarStyle: "default",
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
        {children}
      </body>
    </html>
  );
}
