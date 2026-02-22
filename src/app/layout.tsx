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
        <script dangerouslySetInnerHTML={{ __html: `
          window.onerror = function(msg, src, line, col, err) {
            var d = document.createElement('pre');
            d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0a;color:#ef4444;padding:40px;font-size:14px;white-space:pre-wrap;overflow:auto';
            d.textContent = 'ERROR: ' + msg + '\\n\\nSource: ' + src + ':' + line + ':' + col + '\\n\\nStack: ' + (err && err.stack || 'none');
            document.body.appendChild(d);
          };
          window.addEventListener('unhandledrejection', function(e) {
            var d = document.createElement('pre');
            d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0a0a0a;color:#ef4444;padding:40px;font-size:14px;white-space:pre-wrap;overflow:auto';
            d.textContent = 'UNHANDLED REJECTION: ' + (e.reason && e.reason.stack || e.reason || 'unknown');
            document.body.appendChild(d);
          });
        `}} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0a0a0a] text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
