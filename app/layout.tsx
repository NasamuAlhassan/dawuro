import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Serif, Source_Serif_4 } from "next/font/google";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AppProvider } from "@/lib/app-context";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-ui",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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

// Absolute base for OG/preview URLs. Falls back to Vercel's own production
// URL so WhatsApp previews still resolve if NEXT_PUBLIC_APP_URL is unset.
const PUBLIC_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_URL || "http://localhost:3000"),
  title: "Dawuro — Scripture as conversation, in the voice of your people",
  description:
    "Speak what's on your heart, receive a verse in your language and English, hear it aloud, and send it on WhatsApp. Whoever opens it can reply with a verse of their own — no app needed.",
  applicationName: "Dawuro",
  appleWebApp: {
    capable: true,
    title: "Dawuro",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Dawuro — Scripture as conversation",
    description:
      "A verse in your language, spoken aloud. Send it on WhatsApp; whoever opens it can hear it and reply with their own.",
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
  viewportFit: "cover",
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
      <body className="flex min-h-full flex-col text-foreground">
        <OfflineBanner />
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
