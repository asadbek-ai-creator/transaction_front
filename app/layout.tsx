import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT-Ledi — Скоринг AML-оповещений",
  description: "Оценка вероятности эскалации оповещений финансового мониторинга",
};

export const viewport: Viewport = {
  themeColor: "#15803d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen font-sans text-text antialiased">{children}</body>
    </html>
  );
}
