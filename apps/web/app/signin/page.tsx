"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signin } from "../../lib/api";

const C = {
  bg: "#FAF4EC",
  surface: "#FFFFFF",
  ink1: "#1E1810",
  ink2: "#6B5D50",
  ink3: "#A8988A",
  accent: "#9B4F2A",
  border: "rgba(30,24,16,0.1)",
  inputLine: "rgba(30,24,16,0.18)",
  error: "#C0392B",
  errorBg: "rgba(192,57,43,0.06)",
};

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const token = await signin(username.trim(), password);
      localStorage.setItem("token", token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.ink1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "white" }}>B</span>
          </div>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: C.ink1, textDecoration: "none", letterSpacing: "-0.2px" }}>
            BetterUptime
          </Link>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.ink1, marginBottom: 6, letterSpacing: "-0.5px" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: C.ink3, marginBottom: 28, lineHeight: 1.5 }}>
          Sign in to your monitoring dashboard.
        </p>

        <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, marginBottom: 28 }} />

        {error && (
          <div style={{ fontSize: 13, color: C.error, background: C.errorBg, border: "1px solid rgba(192,57,43,0.18)", padding: "10px 14px", borderRadius: 7, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 8, letterSpacing: "0.04em" }}>
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_username"
              disabled={loading}
              style={{ width: "100%", padding: "10px 0", border: "none", borderBottom: `1.5px solid ${C.inputLine}`, background: "transparent", fontSize: 15, color: C.ink1, outline: "none", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderBottomColor = C.ink1)}
              onBlur={e => (e.target.style.borderBottomColor = C.inputLine)}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 8, letterSpacing: "0.04em" }}>
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{ width: "100%", padding: "10px 0", border: "none", borderBottom: `1.5px solid ${C.inputLine}`, background: "transparent", fontSize: 15, color: C.ink1, outline: "none", fontFamily: "inherit" }}
              onFocus={e => (e.target.style.borderBottomColor = C.ink1)}
              onBlur={e => (e.target.style.borderBottomColor = C.inputLine)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px 0", borderRadius: 9, border: "none", background: C.ink1, color: "white", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1, fontFamily: "inherit", letterSpacing: "0.01em" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ fontSize: 13, color: C.ink3, marginTop: 20, textAlign: "center" }}>
          No account?{" "}
          <Link href="/signup" style={{ color: C.ink1, fontWeight: 700, textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
