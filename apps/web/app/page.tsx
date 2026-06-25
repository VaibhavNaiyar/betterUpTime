"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const C = {
  bg: "#FAF4EC",
  surface: "#FFFFFF",
  ink1: "#1E1810",
  ink2: "#6B5D50",
  ink3: "#A8988A",
  accent: "#9B4F2A",
  border: "rgba(30,24,16,0.1)",
  up: "#22c55e",
  down: "#dc2626",
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.replace("/dashboard");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: C.bg }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/dashboard" style={{ fontSize: 16, fontWeight: 700, color: C.ink1, letterSpacing: "-0.2px", textDecoration: "none" }}>
            BetterUptime
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <Link href="/signin" style={{ fontSize: 14, color: C.ink2, fontWeight: 500, textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 600, color: "white", backgroundColor: C.ink1, padding: "9px 20px", borderRadius: 7, textDecoration: "none", letterSpacing: "0.01em" }}>
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 64px 80px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent, marginBottom: 36 }}>
            Website monitoring
          </p>

          <h1 style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2.5px", color: C.ink1, margin: 0, marginBottom: 28 }}>
            Know when your sites<br />go down — instantly.
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.75, color: C.ink2, maxWidth: 460, margin: "0 auto 52px" }}>
            Track response times, view tick history, and keep your services running without surprises.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <Link href="/signup" style={{ fontSize: 14, fontWeight: 600, color: "white", backgroundColor: C.ink1, padding: "13px 32px", borderRadius: 8, textDecoration: "none", letterSpacing: "0.01em" }}>
              Start monitoring free
            </Link>
            <Link href="/signin" style={{ fontSize: 14, fontWeight: 500, color: C.ink2, backgroundColor: "transparent", border: `1.5px solid ${C.border}`, padding: "12px 32px", borderRadius: 8, textDecoration: "none" }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Preview card */}
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 64px 120px" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: C.border }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: C.border }} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: C.border }} />
              <span style={{ fontSize: 12, color: C.ink3, marginLeft: 8 }}>Monitors</span>
            </div>
            {[
              { url: "yoursite.com", up: true, label: "142ms" },
              { url: "api.yoursite.com", up: true, label: "89ms" },
              { url: "blog.yoursite.com", up: false, label: "Down" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, backgroundColor: s.up ? C.up : C.down }} />
                  <span style={{ fontSize: 13, color: C.ink1, fontWeight: 500 }}>https://{s.url}</span>
                </div>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: s.up ? C.ink2 : C.down, fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "22px 64px", textAlign: "center" }}>
        <span style={{ fontSize: 13, color: C.ink3 }}>BetterUptime &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
