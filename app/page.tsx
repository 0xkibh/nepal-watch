import { getArrests, Arrest } from '../lib/airtable';

const stats = (arrests: Arrest[]) => [
  { label: "Total arrested", value: String(arrests.length) },
  { label: "Currently detained", value: String(arrests.filter(a => a.status === 'Detained').length) },
  { label: "Released", value: String(arrests.filter(a => a.status === 'Released').length) },
  { label: "Days since govt. formed", value: String(Math.floor((Date.now() - new Date('2026-03-28').getTime()) / 86400000)) },
];

export default async function Home() {
  const arrests = await getArrests();
  const statCards = stats(arrests);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5" }}>

      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid #222",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
        position: "sticky",
        top: 0,
        background: "#0a0a0a",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", background: "#dc2626",
            borderRadius: "6px", display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700, fontSize: "13px", color: "#fff"
          }}>N</div>
          <span style={{ fontWeight: 600, fontSize: "15px", letterSpacing: "-0.3px" }}>Nepal Watch</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", fontSize: "14px", color: "#888" }}>
          <a href="#arrests" style={{ color: "#e5e5e5" }}>Arrests</a>
          <a href="#timeline">Timeline</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        borderBottom: "1px solid #222",
        padding: "4rem 2rem 3rem",
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "inline-block",
          background: "#dc262620",
          border: "1px solid #dc262640",
          color: "#f87171",
          fontSize: "12px",
          fontWeight: 500,
          padding: "4px 12px",
          borderRadius: "999px",
          marginBottom: "1.5rem",
          letterSpacing: "0.5px",
        }}>
          LIVE — Government formed March 28, 2026
        </div>
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          letterSpacing: "-1px",
          lineHeight: 1.1,
          marginBottom: "1rem",
          color: "#fff",
        }}>
          Tracking Nepal&apos;s<br />
          <span style={{ color: "#dc2626" }}>new government.</span>
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#888", maxWidth: "540px", lineHeight: 1.7 }}>
          An independent, open-source record of arrests, policies, and actions
          taken by the RSP government since March 28, 2026. Every entry is sourced and timestamped.
        </p>
      </div>

      {/* Stats */}
      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
        borderBottom: "1px solid #222",
      }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "10px",
            padding: "1.25rem",
          }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Arrests */}
      <div id="arrests" style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff" }}>Arrests</h2>
          <span style={{ fontSize: "13px", color: "#555" }}>
            Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        {arrests.length === 0 && (
          <p style={{ color: "#555", fontSize: "14px" }}>No records yet.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {arrests.map((a) => (
            <div key={a.id} style={{
              background: "#111",
              border: "1px solid #222",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              alignItems: "start",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#fff" }}>{a.name}</span>
                  <span style={{
                    fontSize: "11px",
                    background: "#1a1a2e",
                    color: "#818cf8",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    border: "1px solid #2d2d5e",
                  }}>{a.party}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>{a.role}</div>
                <div style={{ fontSize: "13px", color: "#888" }}>
                  <span style={{ color: "#555" }}>Charge: </span>{a.charge}
                </div>
                {a.source && (
                  <a href={a.source} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: "12px", color: "#dc2626", marginTop: "8px", display: "inline-block"
                  }}>
                    View source →
                  </a>
                )}
                <div style={{ fontSize: "12px", color: "#555", marginTop: "8px" }}>
                  Arrested: {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <div style={{
                background: a.status === "Detained" ? "#1a0a0a" : a.status === "Released" ? "#0a1a0a" : "#1a1400",
                border: `1px solid ${a.status === "Detained" ? "#7f1d1d" : a.status === "Released" ? "#14532d" : "#713f12"}`,
                color: a.status === "Detained" ? "#f87171" : a.status === "Released" ? "#4ade80" : "#fbbf24",
                fontSize: "12px",
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: "999px",
                whiteSpace: "nowrap",
              }}>
                {a.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div id="about" style={{
        borderTop: "1px solid #222",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "3rem 2rem",
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff", marginBottom: "1rem" }}>About</h2>
        <p style={{ fontSize: "14px", color: "#666", maxWidth: "600px", lineHeight: 1.8 }}>
          Nepal Watch is an independent public record. We are not affiliated with any political party.
          All data is sourced from verified news reports and official statements.
          If you have a tip or correction, contact us at{" "}
          <a href="mailto:tips@nepalwatch.org" style={{ color: "#dc2626" }}>tips@nepalwatch.org</a>.
        </p>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #1a1a1a",
        padding: "1.5rem 2rem",
        textAlign: "center",
        fontSize: "12px",
        color: "#444",
      }}>
        Nepal Watch — open source, independent journalism. Data updated daily.
      </footer>

    </div>
  );
}