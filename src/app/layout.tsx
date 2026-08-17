import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { AppProvider } from "@/state/app-store";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LifeQuest — Turn your life into a game",
  description:
    "Complete real-life habits, earn XP, build streaks and level up. A minimalist habit tracker with light RPG progression.",
  applicationName: "LifeQuest",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  // Lets iOS run it fullscreen from the Home Screen with a proper title.
  appleWebApp: {
    capable: true,
    title: "LifeQuest",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#14170f" },
  ],
  width: "device-width",
  initialScale: 1,
  // Required so safe-area insets work around the notch / home indicator.
  viewportFit: "cover",
};

/** Sets the theme class before first paint to avoid a flash of wrong theme. */
const themeScript = `
(function () {
  try {
    var raw = window.localStorage.getItem("lifequest:v1");
    var theme = "system";
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.settings && parsed.settings.theme) theme = parsed.settings.theme;
    }
    var dark = theme === "dark" || (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        <AppProvider>{children}</AppProvider>
        <PWARegister />
      </body>
    </html>
  );
}
