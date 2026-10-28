"use client";

// Last-resort error page when the root layout itself fails. Must render its own <html>/<body>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", margin: 0, background: "#f4faf5", color: "#0b1229" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 26 }}>AgriLand is temporarily unavailable</h1>
          <p style={{ color: "#4b5563" }}>Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, background: "#167208", color: "#fff", border: 0, borderRadius: 8, padding: "12px 24px", fontSize: 15, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
