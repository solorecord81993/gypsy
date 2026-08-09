import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ไพ่ยิปซีตอบคำถาม",
  description: "ตั้งคำถาม เลือกเปิดไพ่ 1, 3, 5 หรือ 10 ใบ แล้วอ่านคำทำนายทั้งภาพรวมและทีละใบ",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
