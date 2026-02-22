import { ImageResponse } from "next/og";

export const alt = "StateForge — Build, simulate, and share automata in the browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Automata diagram — circles and arrows only, no SVG text */}
        <svg width="400" height="100" viewBox="0 0 400 100" fill="none" style={{ marginBottom: 48 }}>
          {/* Arrow into q0 */}
          <path d="M10 50 L40 50" stroke="#22d3ee" strokeWidth="3" />
          <path d="M35 42 L45 50 L35 58" stroke="#22d3ee" strokeWidth="2.5" fill="none" />
          {/* State q0 */}
          <circle cx="80" cy="50" r="28" stroke="#22d3ee" strokeWidth="3" fill="none" />
          {/* Dot inside q0 to mark it */}
          <circle cx="80" cy="50" r="4" fill="#22d3ee" />
          {/* Transition q0→q1 */}
          <path d="M108 50 L172 50" stroke="#22d3ee" strokeWidth="3" />
          <path d="M165 42 L177 50 L165 58" stroke="#22d3ee" strokeWidth="2.5" fill="none" />
          {/* State q1 */}
          <circle cx="210" cy="50" r="28" stroke="#22d3ee" strokeWidth="3" fill="none" />
          {/* Transition q1→q2 */}
          <path d="M238 50 L302 50" stroke="#22d3ee" strokeWidth="3" />
          <path d="M295 42 L307 50 L295 58" stroke="#22d3ee" strokeWidth="2.5" fill="none" />
          {/* State q2 (accepting — double circle) */}
          <circle cx="340" cy="50" r="28" stroke="#22d3ee" strokeWidth="3" fill="none" />
          <circle cx="340" cy="50" r="21" stroke="#22d3ee" strokeWidth="2" fill="none" />
          {/* Self-loop on q1 */}
          <path d="M195 23 Q210 -5 225 23" stroke="#22d3ee" strokeWidth="2.5" fill="none" />
          <path d="M222 27 L227 20 L220 19" stroke="#22d3ee" strokeWidth="2" fill="none" />
        </svg>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 72, fontWeight: 700, color: "#f0f0f0", letterSpacing: -2 }}>State</span>
          <span style={{ fontSize: 72, fontWeight: 700, color: "#22d3ee", letterSpacing: -2 }}>Forge</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 24, color: "#888888", marginTop: 16 }}>
          Build, simulate, and share automata in the browser
        </div>
      </div>
    ),
    { ...size },
  );
}
