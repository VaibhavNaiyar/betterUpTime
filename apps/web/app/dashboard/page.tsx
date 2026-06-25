"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getWebsites, addWebsite, deleteWebsite, Website, Tick } from "../../lib/api";

const C = {
  bg: "#FAF4EC",
  surface: "#FFFFFF",
  ink1: "#1E1810",
  ink2: "#6B5D50",
  ink3: "#A8988A",
  accent: "#9B4F2A",
  border: "rgba(30,24,16,0.1)",
  inputBorder: "rgba(30,24,16,0.15)",
  up: "#16a34a",
  down: "#dc2626",
};

function StatusPill({ status }: { status: "Up" | "Down" | "Unkown" | null }) {
  if (status === "Up") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#16a34a", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", padding: "3px 9px", borderRadius: 5, letterSpacing: "0.04em" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#22c55e" }} />
      UP
    </span>
  );
  if (status === "Down") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#b91c1c", background: "rgba(185,28,28,0.07)", border: "1px solid rgba(185,28,28,0.18)", padding: "3px 9px", borderRadius: 5, letterSpacing: "0.04em" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#dc2626" }} />
      DOWN
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: C.ink3, background: "rgba(30,24,16,0.05)", border: `1px solid ${C.border}`, padding: "3px 9px", borderRadius: 5, letterSpacing: "0.04em" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: C.ink3 }} />
      UNKNOWN
    </span>
  );
}

function TickBar({ tick }: { tick: Tick | null }) {
  const base: React.CSSProperties = { flex: 1, height: 28, borderRadius: 3, cursor: "default", transition: "opacity 0.15s" };
  if (!tick) return <span style={{ ...base, backgroundColor: "rgba(30,24,16,0.08)" }} title="No data" />;
  if (tick.status === "Up") return <span style={{ ...base, backgroundColor: "#22c55e" }} title={`Up — ${tick.response_time}ms`} />;
  return <span style={{ ...base, backgroundColor: "#dc2626" }} title="Down" />;
}

function TickHistory({ ticks }: { ticks: Tick[] }) {
  const sorted = [...ticks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(-10);
  const slots: (Tick | null)[] = Array(10).fill(null);
  sorted.forEach((t, i) => { slots[10 - sorted.length + i] = t; });
  return <div style={{ display: "flex", gap: 4 }}>{slots.map((t, i) => <TickBar key={i} tick={t} />)}</div>;
}

function WebsiteCard({ website, onDelete }: { website: Website; onDelete: (id: string) => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);

  const latestTick = website.ticks.length > 0
    ? website.ticks.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
    : null;

  const currentStatus = latestTick?.status ?? null;
  const lastResponseTime = latestTick?.response_time ?? null;
  const upCount = website.ticks.filter(t => t.status === "Up").length;
  const uptimePct = website.ticks.length > 0 ? Math.round((upCount / website.ticks.length) * 100) : null;

  async function handleDelete() {
    if (!confirm(`Remove ${website.url}?`)) return;
    setDeleting(true);
    try { await onDelete(website.id); } finally { setDeleting(false); }
  }

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <StatusPill status={currentStatus} />
            <span style={{ fontSize: 14, fontWeight: 600, color: C.ink1 }}>{website.url}</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <span style={{ fontSize: 12, color: C.ink3 }}>
              Response: <span style={{ fontFamily: "monospace", fontWeight: 600, color: C.ink2 }}>{lastResponseTime !== null ? `${lastResponseTime}ms` : "—"}</span>
            </span>
            {uptimePct !== null && (
              <span style={{ fontSize: 12, color: C.ink3 }}>
                Uptime: <span style={{ fontWeight: 600, color: uptimePct >= 90 ? "#16a34a" : "#b91c1c" }}>{uptimePct}%</span>
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Remove"
          style={{ background: "none", border: "none", cursor: deleting ? "not-allowed" : "pointer", color: C.ink3, padding: 4, opacity: deleting ? 0.4 : 1, lineHeight: 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
      <TickHistory ticks={website.ticks} />
      <p style={{ fontSize: 11, color: C.ink3, marginTop: 8, letterSpacing: "0.02em" }}>Last 10 checks</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) { router.replace("/signin"); return; }
    setToken(stored);
  }, [router]);

  const fetchWebsites = useCallback(async (tok: string, silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError("");
    try { setWebsites(await getWebsites(tok)); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to load."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { if (token) fetchWebsites(token); }, [token, fetchWebsites]);
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => fetchWebsites(token, true), 30_000);
    return () => clearInterval(id);
  }, [token, fetchWebsites]);

  async function handleAddWebsite(e: FormEvent) {
    e.preventDefault();
    setAddError("");
    const url = newUrl.trim();
    if (!url) { setAddError("Please enter a URL."); return; }
    if (!token) return;
    setAdding(true);
    try { await addWebsite(token, url); setNewUrl(""); await fetchWebsites(token, true); }
    catch (err: unknown) { setAddError(err instanceof Error ? err.message : "Failed to add."); }
    finally { setAdding(false); }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    await deleteWebsite(token, id);
    setWebsites(prev => prev.filter(w => w.id !== id));
  }

  const WRAP: React.CSSProperties = { maxWidth: 860, margin: "0 auto", padding: "0 64px" };

  if (!token) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: C.bg }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${C.border}`, borderTopColor: C.ink1, animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg }}>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(250,244,236,0.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...WRAP, paddingTop: 18, paddingBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.ink1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>B</span>
            </div>
            <a href="/dashboard" style={{ fontSize: 15, fontWeight: 700, color: C.ink1, letterSpacing: "-0.2px", textDecoration: "none" }}>BetterUptime</a>
            {refreshing && <span style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${C.border}`, borderTopColor: C.ink1, display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
          </div>
          <button
            onClick={() => { localStorage.removeItem("token"); router.replace("/"); }}
            style={{ fontSize: 13, fontWeight: 500, color: C.ink2, background: "none", border: `1px solid ${C.border}`, padding: "7px 16px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ paddingTop: 52, paddingBottom: 96 }}>

        {/* Add monitor */}
        <section style={{ ...WRAP, marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: C.ink3, textTransform: "uppercase", marginBottom: 14 }}>Add a monitor</p>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 28px" }}>
            <form onSubmit={handleAddWebsite} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={adding}
                style={{ flex: 1, minWidth: 240, padding: "11px 16px", borderRadius: 8, border: `1.5px solid ${C.inputBorder}`, background: C.bg, fontSize: 14, color: C.ink1, outline: "none", fontFamily: "inherit" }}
                onFocus={e => (e.target.style.borderColor = C.ink1)}
                onBlur={e => (e.target.style.borderColor = C.inputBorder)}
              />
              <button
                type="submit"
                disabled={adding}
                style={{ padding: "11px 24px", borderRadius: 8, border: "none", background: C.ink1, color: "white", fontSize: 13, fontWeight: 600, cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.6 : 1, whiteSpace: "nowrap", fontFamily: "inherit", letterSpacing: "0.01em" }}
              >
                {adding ? "Adding…" : "Add website"}
              </button>
            </form>
            {addError && <p style={{ fontSize: 12, color: "#C0392B", marginTop: 10 }}>{addError}</p>}
          </div>
        </section>

        {/* Monitors */}
        <section style={WRAP}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: C.ink3, textTransform: "uppercase" }}>
              Monitors {!loading && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>({websites.length})</span>}
            </p>
            {!loading && (
              <button onClick={() => token && fetchWebsites(token, true)} disabled={refreshing} style={{ fontSize: 12, fontWeight: 500, color: C.ink3, background: "none", border: "none", cursor: "pointer", opacity: refreshing ? 0.4 : 1, fontFamily: "inherit" }}>
                Refresh
              </button>
            )}
          </div>

          {error && (
            <div style={{ fontSize: 13, color: "#C0392B", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.18)", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 28px", animation: "pulse 1.5s ease-in-out infinite" }}>
                  <div style={{ height: 13, background: "rgba(255,255,255,0.08)", borderRadius: 6, width: "28%", marginBottom: 10 }} />
                  <div style={{ height: 11, background: "rgba(255,255,255,0.05)", borderRadius: 6, width: "18%", marginBottom: 18 }} />
                  <div style={{ display: "flex", gap: 4 }}>
                    {Array(10).fill(0).map((_, j) => <div key={j} style={{ flex: 1, height: 28, background: "rgba(255,255,255,0.06)", borderRadius: 3 }} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && websites.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {websites.map(w => <WebsiteCard key={w.id} website={w} onDelete={handleDelete} />)}
            </div>
          )}

          {!loading && websites.length === 0 && !error && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "64px 40px", textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.ink2, marginBottom: 6 }}>No monitors yet</p>
              <p style={{ fontSize: 13, color: C.ink3 }}>Add a website above to start tracking its uptime.</p>
            </div>
          )}

          {!loading && websites.length > 0 && (
            <p style={{ textAlign: "center", fontSize: 11, color: C.ink3, marginTop: 32, letterSpacing: "0.02em" }}>
              Auto-refreshes every 30 seconds
            </p>
          )}
        </section>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
      `}</style>
    </div>
  );
}
