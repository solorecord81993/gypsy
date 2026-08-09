import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ไพ่ยิปซีตอบคำถาม",
  description: "ตั้งคำถาม เลือกเปิดไพ่ 1, 3, 5 หรือ 10 ใบ แล้วอ่านคำทำนายทั้งภาพรวมและทีละใบ",
  applicationName: "ไพ่ยิปซี",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ไพ่ยิปซี",
    statusBarStyle: "default",
  },
  other: { "codex-preview": "development" },
  icons: {
    icon: [
      { url: "/app-icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/app-icon.svg",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7046E8",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
