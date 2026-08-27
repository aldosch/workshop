import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flags Demo",
  description: "Minimal demo of @repo/flags shared package",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ colorScheme: "light dark" }}>
      <body>{children}</body>
    </html>
  );
}
