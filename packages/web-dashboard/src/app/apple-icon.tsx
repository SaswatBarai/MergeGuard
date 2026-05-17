import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#09090b",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <svg width="128" height="128" viewBox="0 0 48 48" fill="none">
          <path
            d="M24 5.25 37.75 10.75v12.05c0 8.9-5.65 16.85-13.75 19.8-8.1-2.95-13.75-10.9-13.75-19.8V10.75L24 5.25Z"
            stroke="#a78bfa"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M18 16.5v8.25c0 3.6 2.9 6.5 6.5 6.5H30"
            stroke="#a78bfa"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30 19.25v12"
            stroke="#a78bfa"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="m25.5 23.75 4.5-4.5 4.5 4.5"
            stroke="#a78bfa"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="16.5" r="3.25" fill="#facc15" />
          <circle cx="30" cy="31.25" r="3.25" fill="#facc15" />
        </svg>
      </div>
    ),
    size
  )
}
