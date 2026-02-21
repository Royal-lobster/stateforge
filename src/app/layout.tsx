import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StateForge",
  description: "JFLAP for the modern web — build, simulate, and share automata in the browser",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0a0a0a] text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
