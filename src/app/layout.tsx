import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StateForge",
  description: "JFLAP for the modern web — build, simulate, and share automata in the browser",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
