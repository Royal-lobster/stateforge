import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          borderRadius: "4px",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Arrow into initial state */}
          <path d="M2 14 L7 14" stroke="#22d3ee" strokeWidth="1.5" />
          <path d="M5.5 11.5 L8 14 L5.5 16.5" stroke="#22d3ee" strokeWidth="1.2" fill="none" />
          {/* State q0 */}
          <circle cx="13.5" cy="14" r="4.5" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
          {/* Transition arrow */}
          <path d="M18 14 L21 14" stroke="#22d3ee" strokeWidth="1.5" />
          <path d="M19.8 12 L22 14 L19.8 16" stroke="#22d3ee" strokeWidth="1.2" fill="none" />
          {/* State q1 (accepting — double circle) */}
          <circle cx="26" cy="14" r="4" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
          <circle cx="26" cy="14" r="2.5" stroke="#22d3ee" strokeWidth="1" fill="none" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
