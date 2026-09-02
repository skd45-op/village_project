"use client";

// Last-resort boundary for errors thrown in the root layout. Must render its own
// <html>/<body>. Kept dependency-free so it works even if the app shell is broken.

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          padding: "2rem",
          background: "#fafafa",
          color: "#171717",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <h1 style={{ fontSize: 20, margin: "0.5rem 0" }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#737373" }}>
            The app ran into an unexpected problem. Please try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              background: "#059669",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "0.5rem 1rem",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
