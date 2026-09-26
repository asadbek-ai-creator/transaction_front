import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT-Ledi — AML Alert Risk",
  description: "Скоринг эскалации оповещений финансового мониторинга",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
