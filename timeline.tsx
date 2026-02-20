import { useState } from "react";

const EVENTS = [
  {
    date: "Apr 2024",
    ts: 0,
    side: "left",
    tag: "ALEPH¹∅",
    title: "First Adversarial Sessions Documented",
    desc: "Initial pattern recognition: AI systems fabricating validation, creating dependency loops, reinforcing beliefs across sessions.",
    color: "#f59e0b",
  },
  {
    date: "Jun 2024",
    ts: 1,
    side: "left",
    tag: "ALEPH¹∅",
    title: "Cross-Session Persistence Identified",
    desc: "Documented AI retaining manipulation patterns across conversation boundaries. Named it 'cross-session contamination.'",
    color: "#f59e0b",
  },
  {
    date: "Sep 2024",
    ts: 2,
    side: "left",
    tag: "ALEPH¹∅",
    title: "14 Signal Equations Published",
    desc: "Formalized mathematical framework for detecting symbolic regression, inference loops, belief reinforcement, and retention strategies.",
    color: "#f59e0b",
  },
  {
    date: "Nov 2024",
    ts: 3,
    side: "left",
    tag: "ALEPH¹∅",
    title: "1000+ Evaluation Sessions",
    desc: "Framework tested across frontier LLM systems. Documented fabrication, validation loops, cognitive boundary violations at scale.",
    color: "#f59e0b",
  },
  {
    date: "Early 2025",
    ts: 4,
    side: "left",
    tag: "ALEPH¹∅",
    title: "alephonenull.com + npm Package Live",
    desc: "Full documentation site, evaluation toolkit, and technical papers published. 1700+ adversarial evaluation sessions documented.",
    color: "#f59e0b",
  },
  {
    date: "Jul 2025",
    ts: 5,
    side: "right",
    tag: "OWASP",
    title: "OWASP Top 10 for LLMs (2025)",
    desc: "Formalized prompt injection (LLM01) and insecure output handling. Began recommending red teaming for high-risk AI systems.",
    color: "#64748b",
  },
  {
    date: "Oct 2025",
    ts: 6,
    side: "right",
    tag: "MITRE",
    title: "MITRE ATLAS Adds 14 Agent Techniques",
    desc: "AML.T0080: Memory Poisoning. AML.T0058: AI Agent Context Poisoning. Formalized cross-session persistence as official TTPs.",
    color: "#64748b",
    highlight: true,
  },
  {
    date: "Nov 2025",
    ts: 7,
    side: "right",
    tag: "DEEPTEAM",
    title: "DeepTeam Open-Source Red Teaming",
    desc: "First open-source framework mapping recursive propagation and inference loop detection. Tri-model attacker/target/judge architecture.",
    color: "#64748b",
  },
  {
    date: "Dec 2025",
    ts: 8,
    side: "right",
    tag: "EU / NIST",
    title: "EU AI Act + NIST Mandates",
    desc: "Documented red teaming now required for high-risk AI systems. CISA guidance for AI in critical environments published.",
    color: "#64748b",
  },
  {
    date: "Feb 2026",
    ts: 9,
    side: "right",
    tag: "MICROSOFT",
    title: "AI Recommendation Poisoning Published",
    desc: "Microsoft documents 31 companies across 14 industries injecting persistence commands into AI memory. Validates cross-session manipulation at commercial scale.",
    color: "#64748b",
    highlight: true,
  },
];

const MAPPING = [
  {
    aleph: "Cross-session manipulation",
    industry: "Memory Poisoning",
    id: "AML.T0080",
    delta: "~18 months prior",
  },
  {
    aleph: "Cross-session defense",
    industry: "AI Agent Context Poisoning",
    id: "AML.T0058",
    delta: "~18 months prior",
  },
  {
    aleph: "Inference loops / thought loops",
    industry: "Thread Injection",
    id: "AML.T0058.002",
    delta: "~16 months prior",
  },
  {
    aleph: "Belief reinforcement",
    industry: "AI Recommendation Poisoning",
    id: "AML.T0080+T0051",
    delta: "~20 months prior",
  },
  {
    aleph: "Symbolic regression",
    industry: "Recursive propagation",
    id: "Impact tactic",
    delta: "~14 months prior",
  },
  {
    aleph: "Retention strategies",
    industry: "Persistent context compromise",
    id: "AgentPoison / T3",
    delta: "~12 months prior",
  },
];

export default function PriorArtTimeline() {
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const [view, setView] = useState("timeline");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#08080c",
      color: "#e2e2e8",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      padding: "0",
      overflow: "hidden",
    }}>
      {/* Grain overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        pointerEvents: "none",
        zIndex: 100,
      }} />

      {/* Header */}
      <div style={{
        padding: "48px 32px 24px",
        borderBottom: "1px solid rgba(245, 158, 11, 0.15)",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, #f59e0b, transparent)",
        }} />
        <div style={{
          fontSize: "10px",
          letterSpacing: "6px",
          textTransform: "uppercase",
          color: "#f59e0b",
          marginBottom: "12px",
          opacity: 0.8,
        }}>
          PRIOR ART DOCUMENTATION
        </div>
        <h1 style={{
          fontSize: "clamp(24px, 4vw, 40px)",
          fontWeight: 300,
          margin: 0,
          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}>
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>ALEPH¹∅</span>
          <span style={{ opacity: 0.3, margin: "0 16px" }}>→</span>
          <span style={{ opacity: 0.5, fontWeight: 300 }}>Industry Formalization</span>
        </h1>
        <p style={{
          fontSize: "13px",
          color: "#888",
          marginTop: "12px",
          maxWidth: "680px",
          lineHeight: 1.6,
        }}>
          Patterns first documented by AlephOneNull (2024) were subsequently formalized by 
          MITRE ATLAS (Oct 2025), OWASP GenAI (2025), and Microsoft Security Research (Feb 2026).
        </p>

        {/* View toggle */}
        <div style={{
          display: "flex",
          gap: "2px",
          marginTop: "20px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "6px",
          padding: "2px",
          width: "fit-content",
        }}>
          {["timeline", "mapping"].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                style={{
                  padding: "6px 16px",
                  fontSize: "11px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  background: view === v ? "rgba(245, 158, 11, 0.15)" : "transparent",
                  color: view === v ? "#f59e0b" : "#666",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {v}
              </button>
            ))}
        </div>
      </div>

      {view === "timeline" ? (
        <div style={{ padding: "40px 16px", maxWidth: "900px", margin: "0 auto" }}>
          {/* Vertical line */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "linear-gradient(180deg, #f59e0b 45%, #64748b 55%)",
              opacity: 0.3,
            }} />

            {/* Divider marker */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: `${(5 / 10) * 100}%`,
              transform: "translate(-50%, -50%)",
              background: "#08080c",
              padding: "8px 0",
              zIndex: 10,
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "2px solid #f59e0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: "#f59e0b",
                background: "#08080c",
                margin: "0 auto",
              }}>
                ▼
              </div>
              <div style={{
                fontSize: "9px",
                letterSpacing: "3px",
                color: "#f59e0b",
                textAlign: "center",
                marginTop: "4px",
                whiteSpace: "nowrap",
              }}>
                INDUSTRY CATCHES UP
              </div>
            </div>

            {EVENTS.map((evt, i) => {
              const isLeft = evt.side === "left";
              const isActive = activeEvent === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveEvent(isActive ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setActiveEvent(isActive ? null : i);
                    }
                  }}
                  style={{
                    display: "flex",
                    flexDirection: isLeft ? "row" : "row-reverse",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                    cursor: "pointer",
                    position: "relative",
                    minHeight: "80px",
                    background: "none",
                    border: "none",
                    padding: 0,
                    font: "inherit",
                    color: "inherit",
                  }}
                >
                  {/* Content */}
                  <div style={{
                    width: "calc(50% - 28px)",
                    padding: "12px 16px",
                    background: isActive
                      ? `rgba(${isLeft ? "245, 158, 11" : "100, 116, 139"}, 0.08)`
                      : "transparent",
                    borderRadius: "8px",
                    border: `1px solid ${isActive
                      ? `rgba(${isLeft ? "245, 158, 11" : "100, 116, 139"}, 0.25)`
                      : "transparent"}`,
                    transition: "all 0.25s ease",
                    textAlign: isLeft ? "right" : "left",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      justifyContent: isLeft ? "flex-end" : "flex-start",
                    }}>
                      <span style={{
                        fontSize: "9px",
                        letterSpacing: "2px",
                        padding: "2px 6px",
                        background: `rgba(${isLeft ? "245, 158, 11" : "100, 116, 139"}, 0.15)`,
                        color: evt.color,
                        borderRadius: "3px",
                        fontWeight: 700,
                      }}>
                        {evt.tag}
                      </span>
                      <span style={{
                        fontSize: "11px",
                        color: "#666",
                      }}>
                        {evt.date}
                      </span>
                    </div>
                    <div style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: evt.highlight ? evt.color : "#ccc",
                      marginBottom: "4px",
                      lineHeight: 1.3,
                    }}>
                      {evt.title}
                    </div>
                    {isActive && (
                      <div style={{
                        fontSize: "11px",
                        color: "#888",
                        lineHeight: 1.5,
                        marginTop: "8px",
                      }}>
                        {evt.desc}
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div style={{
                    width: "56px",
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "14px",
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: isActive ? "12px" : "8px",
                      height: isActive ? "12px" : "8px",
                      borderRadius: "50%",
                      background: evt.color,
                      opacity: isActive ? 1 : 0.6,
                      transition: "all 0.2s",
                      boxShadow: isActive ? `0 0 12px ${evt.color}` : "none",
                    }} />
                  </div>

                  {/* Spacer for other side */}
                  <div style={{ width: "calc(50% - 28px)" }} />
                </button>
              );
            })}
          </div>

          {/* Bottom stat */}
          <div style={{
            marginTop: "48px",
            padding: "24px",
            background: "rgba(245, 158, 11, 0.04)",
            border: "1px solid rgba(245, 158, 11, 0.12)",
            borderRadius: "8px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "11px", color: "#f59e0b", letterSpacing: "3px", marginBottom: "8px" }}>
              LEAD TIME
            </div>
            <div style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, color: "#f59e0b" }}>
              12–20 months
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
              ahead of industry formalization across all documented patterns
            </div>
          </div>
        </div>
      ) : (
        /* MAPPING VIEW */
        <div style={{ padding: "40px 16px", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{
            fontSize: "10px",
            letterSpacing: "4px",
            color: "#f59e0b",
            marginBottom: "24px",
            opacity: 0.7,
          }}>
            PATTERN → FORMALIZATION MAPPING
          </div>

          {MAPPING.map((m, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr auto",
                gap: "12px",
                alignItems: "center",
                padding: "16px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {/* Aleph term */}
              <div>
                <div style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 600 }}>
                  {m.aleph}
                </div>
                <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                  ALEPH¹∅ (2024)
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                fontSize: "16px",
                color: "#333",
                padding: "0 8px",
              }}>
                →
              </div>

              {/* Industry term */}
              <div>
                <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                  {m.industry}
                </div>
                <div style={{
                  fontSize: "10px",
                  color: "#4a5568",
                  marginTop: "2px",
                  fontFamily: "inherit",
                }}>
                  {m.id}
                </div>
              </div>

              {/* Delta */}
              <div style={{
                fontSize: "11px",
                color: "#f59e0b",
                background: "rgba(245, 158, 11, 0.08)",
                padding: "4px 10px",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                textAlign: "right",
              }}>
                {m.delta}
              </div>
            </div>
          ))}

          {/* Source refs */}
          <div style={{
            marginTop: "40px",
            padding: "20px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{
              fontSize: "10px",
              letterSpacing: "3px",
              color: "#666",
              marginBottom: "12px",
            }}>
              INDUSTRY REFERENCES
            </div>
            {[
              { label: "MITRE ATLAS", detail: "AML.T0058, AML.T0080 — Oct 2025", url: "atlas.mitre.org" },
              { label: "OWASP GenAI", detail: "Top 10 for LLMs — 2025", url: "genai.owasp.org" },
              { label: "Microsoft Security", detail: "AI Recommendation Poisoning — Feb 10, 2026", url: "microsoft.com/security/blog" },
              { label: "NIST AI RMF", detail: "AI Risk Management Framework", url: "nist.gov" },
              { label: "EU AI Act", detail: "Red teaming mandated for high-risk AI", url: "" },
            ].map((ref, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "6px 0",
                borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.03)" : "none",
              }}>
                <span style={{ fontSize: "12px", color: "#aaa" }}>{ref.label}</span>
                <span style={{ fontSize: "11px", color: "#555" }}>{ref.detail}</span>
              </div>
            ))}
          </div>

          {/* The line */}
          <div style={{
            marginTop: "32px",
            padding: "20px 24px",
            background: "rgba(245, 158, 11, 0.06)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#ccc",
            lineHeight: 1.7,
            fontStyle: "italic",
          }}>
            "Patterns first documented in this framework (2024) were subsequently formalized by 
            MITRE ATLAS (Oct 2025) and validated by Microsoft Security Research (Feb 2026). 
            1,700+ adversarial evaluation sessions constitute primary empirical evidence 
            predating industry standardization by 12–20 months."
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "24px 32px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "10px",
        color: "#444",
        letterSpacing: "1px",
      }}>
        <span>ALEPH¹∅ ADVERSARIAL AI COGNITION EVALUATION FRAMEWORK</span>
        <span>alephonenull.com</span>
      </div>
    </div>
  );
}