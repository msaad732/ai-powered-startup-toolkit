import { useState } from "react";
import jsPDF from "jspdf";
import {
  ChevronLeft,
  ChevronRight,
  Wand2,
  Sparkles,
  Check,
  AlertCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Briefcase,
  Rocket,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  BrainCircuit,
  Presentation,
  Scale,
  MenuIcon,
  X,
  BarChart,
  Download,
} from "lucide-react";
import { API_BASE } from "../config/api";

const THEMES = [
  {
    id: "midnight",
    name: "Midnight VC",
    desc: "Dark, commanding, serious capital",
    bg: "#0A0F1E",
    surface: "#111827",
    accent: "#6366F1",
    accentSoft: "#312E81",
    text: "#F1F5F9",
    muted: "#94A3B8",
    border: "#1E293B",
    slideStyle: "dark",
  },
  {
    id: "aurora",
    name: "Aurora",
    desc: "Vibrant gradient energy, tech-forward",
    bg: "#0D1117",
    surface: "#161B22",
    accent: "#10B981",
    accentSoft: "#064E3B",
    text: "#ECFDF5",
    muted: "#6EE7B7",
    border: "#1F2937",
    slideStyle: "dark",
  },
  {
    id: "paper",
    name: "Clean Slate",
    desc: "Minimal, white-space driven, editorial",
    bg: "#FAFAFA",
    surface: "#FFFFFF",
    accent: "#F97316",
    accentSoft: "#FFF7ED",
    text: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",
    slideStyle: "light",
  },
  {
    id: "cobalt",
    name: "Cobalt Pitch",
    desc: "Bold blue authority, classic VC feel",
    bg: "#EFF6FF",
    surface: "#FFFFFF",
    accent: "#1D4ED8",
    accentSoft: "#DBEAFE",
    text: "#1E3A5F",
    muted: "#64748B",
    border: "#BFDBFE",
    slideStyle: "light",
  },
  {
    id: "ember",
    name: "Ember",
    desc: "Warm, high-energy, disruptive",
    bg: "#0C0A09",
    surface: "#1C1917",
    accent: "#F97316",
    accentSoft: "#431407",
    text: "#FEF3C7",
    muted: "#D97706",
    border: "#292524",
    slideStyle: "dark",
  },
  {
    id: "arctic",
    name: "Arctic",
    desc: "Crisp white-and-teal, healthtech/fintech",
    bg: "#F0FDFA",
    surface: "#FFFFFF",
    accent: "#0F766E",
    accentSoft: "#CCFBF1",
    text: "#134E4A",
    muted: "#64748B",
    border: "#99F6E4",
    slideStyle: "light",
  },
];

const SLIDE_ICONS = {
  Title: "Rocket",
  "The Problem": "AlertCircle",
  "Our Solution": "Lightbulb",
  "Market Opportunity": "Target",
  "Business Model": "Briefcase",
  Traction: "TrendingUp",
  "Competitive Edge": "ShieldCheck",
  "Go-To-Market": "ArrowRight",
  "Financial Outlook": "BarChart3",
  "The Team": "Users",
  "The Ask": "Sparkles",
};
const ICON_MAP = {
  Rocket,
  AlertCircle,
  Lightbulb,
  Target,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  Users,
  Sparkles,
};

const buildPrompt = (problem, solution) => `
You are a world-class startup pitch deck writer. Given a problem and solution, generate a complete 11-slide pitch deck in JSON.
Problem: "${problem}"
Solution: "${solution}"
Return ONLY valid JSON — no markdown, no backticks. Format:
{"startupName":"short punchy name","tagline":"one-line tagline","slides":[
{"title":"Title","headline":"startup name + tagline","body":"The company in one powerful sentence.","stat":null},
{"title":"The Problem","headline":"A pain worth solving","body":"2-3 sentences on the problem, its scale, and why it matters now.","stat":"e.g. $X billion lost annually"},
{"title":"Our Solution","headline":"Introducing [name]","body":"Crisp 2-sentence description of the product and how it solves the problem.","stat":null},
{"title":"Market Opportunity","headline":"A massive, underserved market","body":"TAM/SAM/SOM narrative in 2 sentences.","stat":"TAM: $X billion"},
{"title":"Business Model","headline":"How we make money","body":"Revenue streams and pricing model in 2 sentences.","stat":"e.g. $X ARPU"},
{"title":"Traction","headline":"Early proof it works","body":"Key traction metrics, pilot results, or early validation in 2 sentences.","stat":"e.g. X paying customers"},
{"title":"Competitive Edge","headline":"Why we win","body":"3 unique advantages over existing alternatives.","stat":null},
{"title":"Go-To-Market","headline":"How we reach customers","body":"Channel strategy and first 12-month plan in 2 sentences.","stat":null},
{"title":"Financial Outlook","headline":"The path to scale","body":"Revenue projections and key milestones for 3 years in 2 sentences.","stat":"Projected $XM ARR by Y3"},
{"title":"The Team","headline":"Built for this moment","body":"2 sentences on why this founding team is uniquely positioned to win.","stat":null},
{"title":"The Ask","headline":"Join us","body":"Funding ask, use of funds, and the vision in 2-3 sentences.","stat":"Raising $XM Seed"}
]}`;

// ── Export all slides as a direct PDF download (no print dialog) ───────────
function hexToRgb(hex) {
  const clean = (hex || "#000000").replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const bigint = parseInt(full, 16) || 0;
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function exportPDF(deckData, t) {
  if (!deckData) return;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const marginTop = 18;
  const contentWidth = pageWidth - marginX * 2;

  const bg = hexToRgb(t.bg);
  const accent = hexToRgb(t.accent);
  const accentSoft = hexToRgb(t.accentSoft);
  const text = hexToRgb(t.text);
  const muted = hexToRgb(t.muted);
  const border = hexToRgb(t.border);

  deckData.slides.forEach((slide, i) => {
    if (i > 0) doc.addPage("a4", "landscape");

    // background fill
    doc.setFillColor(...bg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // outer border
    doc.setDrawColor(...border);
    doc.setLineWidth(0.4);
    doc.rect(2, 2, pageWidth - 4, pageHeight - 4);

    // slide counter (top right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(
      `${String(i + 1).padStart(2, "0")} / ${String(deckData.slides.length).padStart(2, "0")}`,
      pageWidth - marginX,
      marginTop,
      { align: "right" },
    );

    // startup watermark (bottom left)
    doc.setFontSize(7);
    doc.text(
      (deckData.startupName || "").toUpperCase(),
      marginX,
      pageHeight - 10,
    );

    // category badge + label
    doc.setFillColor(...accentSoft);
    doc.roundedRect(marginX, marginTop + 6, 9, 7, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...accent);
    doc.text((slide.title || "").toUpperCase(), marginX + 13, marginTop + 11);

    // headline
    let y = marginTop + 26;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...text);
    const headlineLines = doc.splitTextToSize(
      slide.headline || "",
      contentWidth * 0.72,
    );
    doc.text(headlineLines, marginX, y);
    y += headlineLines.length * 8 + 8;

    // body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...muted);
    const bodyLines = doc.splitTextToSize(
      slide.body || "",
      contentWidth * 0.68,
    );
    doc.text(bodyLines, marginX, y);
    y += bodyLines.length * 6 + 10;

    // stat chip
    if (slide.stat) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const statWidth = doc.getTextWidth(slide.stat) + 10;
      doc.setFillColor(...accentSoft);
      doc.roundedRect(marginX, y, statWidth, 8, 1.5, 1.5, "F");
      doc.setTextColor(...accent);
      doc.text(slide.stat, marginX + 5, y + 5.5);
    }

    // bottom progress bar
    doc.setFillColor(...border);
    doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, "F");
    doc.setFillColor(...accent);
    doc.rect(
      0,
      pageHeight - 1.5,
      pageWidth * ((i + 1) / deckData.slides.length),
      1.5,
      "F",
    );
  });

  const safeName = (deckData.startupName || "Pitch_Deck").replace(
    /[^a-z0-9]+/gi,
    "_",
  );
  doc.save(`${safeName}_Pitch_Deck.pdf`);
}
// ─────────────────────────────────────────────────────────────────────────────

function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { name: "Home", icon: <LayoutDashboard size={14} />, path: "/" },
    {
      name: "IdeaValidation",
      icon: <BrainCircuit size={14} />,
      path: "/ideavalidation",
    },
    { name: "Finance&Budget", icon: <BarChart3 size={14} />, path: "/finance" },
    {
      name: "Pitch Deck",
      icon: <Presentation size={14} />,
      path: "/pitch-ppt",
      active: true,
    },
    {
      name: "Venture Capitalists",
      icon: <Scale size={14} />,
      path: "/venture-capitalists",
    },
    {
      name: "Name&Slogan Generator",
      icon: <Target size={14} />,
      path: "/name-slogangenerator",
    },
    {
      name: "Social Media Management",
      icon: <BarChart size={14} />,
      path: "/socialmedia",
    },
  ];
  return (
    <nav
      style={{
        background: "#0F172A",
        borderBottom: "1px solid rgba(99,102,241,.2)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontWeight: 900,
            color: "white",
            fontSize: 16,
            letterSpacing: "-0.02em",
          }}
        >
          PitchDeck/<span style={{ color: "#60A5FA" }}>Summary</span>
        </span>
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "rgba(30,41,59,.5)",
            padding: 4,
            borderRadius: 12,
            border: "1px solid #334155",
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                  background: item.active ? "#4F46E5" : "transparent",
                  color: item.active ? "white" : "#94A3B8",
                  transition: "all .15s",
                }}
              >
                {item.icon}
                {item.name}
              </button>
            </a>
          ))}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "none",
            background: "#4F46E5",
            border: "none",
            borderRadius: 8,
            padding: "8px 10px",
            color: "white",
            cursor: "pointer",
          }}
          className="mobile-toggle"
        >
          {isOpen ? <X size={18} /> : <MenuIcon size={18} />}
        </button>
      </div>
      {isOpen && (
        <div
          style={{
            background: "#0F172A",
            borderTop: "1px solid #1E293B",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `1px solid ${item.active ? "#6366F1" : "#1E293B"}`,
                  background: item.active ? "#4F46E5" : "rgba(30,41,59,.4)",
                  color: item.active ? "white" : "#CBD5E1",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {item.icon}
                {item.name}
              </div>
            </a>
          ))}
        </div>
      )}
      <style>{`@media(max-width:1024px){ .desktop-nav{display:none!important} .mobile-toggle{display:flex!important} }`}</style>
    </nav>
  );
}

export default function App() {
  const [step, setStep] = useState("input");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [selectedTheme, setTheme] = useState("midnight");
  const [deckData, setDeckData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setSlide] = useState(0);

  const t = THEMES.find((th) => th.id === selectedTheme);
  const slideCount = deckData?.slides?.length || 0;
  const slide = deckData?.slides?.[currentSlide];
  const SlideIcon = slide
    ? ICON_MAP[SLIDE_ICONS[slide.title]] || Sparkles
    : Sparkles;

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, solution, theme_id: selectedTheme }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Request failed");
      }
      const parsed = await res.json();
      setDeckData(parsed);
      setSlide(0);
      setStep("deck");
    } catch (e) {
      setError("Generation failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: step === "input" ? "#FFFFFF" : "#09090B",
        fontFamily: "'Inter',system-ui,sans-serif",
        color: step === "input" ? "#0F172A" : "#F4F4F5",
      }}
    >
      <TopNav />

      {/* Step breadcrumb bar */}
      <div
        style={{
          borderBottom: `1px solid ${step === "input" ? "#E2E8F0" : "#18181B"}`,
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: step === "input" ? "#FFFFFF" : "#09090B",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              borderRadius: 8,
              padding: "5px 7px",
              display: "flex",
            }}
          >
            <Sparkles size={14} color="white" />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 14,
              color: step === "input" ? "#0F172A" : "#F4F4F5",
              letterSpacing: "-0.02em",
            }}
          >
            PitchGen <span style={{ color: "#6366F1" }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {["input", "theme", "deck"].map((s, i) => (
            <div
              key={s}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <div
                onClick={() => {
                  if (s === "input") setStep("input");
                  else if (s === "theme" && problem && solution)
                    setStep("theme");
                  else if (s === "deck" && deckData) setStep("deck");
                }}
                style={{
                  padding: "4px 14px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: step === s ? "#6366F1" : "transparent",
                  color:
                    step === s
                      ? "white"
                      : step === "input"
                        ? "#94A3B8"
                        : "#52525B",
                  border:
                    step === s
                      ? "none"
                      : `1px solid ${step === "input" ? "#E2E8F0" : "#27272A"}`,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                {i + 1}.{" "}
                {s === "input" ? "Brief" : s === "theme" ? "Theme" : "Deck"}
              </div>
              {i < 2 && (
                <span
                  style={{
                    color: step === "input" ? "#CBD5E1" : "#3F3F46",
                    fontSize: 11,
                  }}
                >
                  ›
                </span>
              )}
            </div>
          ))}
        </div>
        <div style={{ width: 120 }} />
      </div>

      {/* ══ STEP 1 — Brief ══ */}
      {step === "input" && (
        <div style={{ maxWidth: 620, margin: "72px auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: 20,
                padding: "4px 14px",
                fontSize: 10,
                fontWeight: 700,
                color: "#64748B",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}
            >
              <Sparkles size={9} /> AI Pitch Generator
            </div>
            <h1
              style={{
                fontSize: 38,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                margin: "0 0 14px",
                color: "#0F172A",
              }}
            >
              Describe your startup.
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#6366F1,#A78BFA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                We'll build the deck.
              </span>
            </h1>
            <p
              style={{
                color: "#64748B",
                fontSize: 15,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Two inputs. Eleven slides. Investor-ready in seconds.
            </p>
          </div>

          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 20,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {[
              {
                key: "problem",
                label: "The Problem",
                val: problem,
                set: setProblem,
                hint: "Who suffers, how badly, and why existing solutions fail.",
              },
              {
                key: "solution",
                label: "Your Solution",
                val: solution,
                set: setSolution,
                hint: "The core mechanism, the 'aha' moment, and what makes it uniquely better.",
              },
            ].map(({ key, label, val, set, hint }) => (
              <div key={key}>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 8,
                  }}
                >
                  {label}
                </label>
                <textarea
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={hint}
                  rows={4}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#FFFFFF",
                    border: `1px solid ${val ? "#6366F1" : "#CBD5E1"}`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    color: "#0F172A",
                    fontSize: 13,
                    lineHeight: 1.65,
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    transition: "border-color .2s",
                  }}
                />
              </div>
            ))}
            <button
              disabled={!problem.trim() || !solution.trim()}
              onClick={() => setStep("theme")}
              style={{
                background:
                  problem.trim() && solution.trim()
                    ? "linear-gradient(135deg,#6366F1,#8B5CF6)"
                    : "#E2E8F0",
                color: problem.trim() && solution.trim() ? "white" : "#94A3B8",
                border: "none",
                borderRadius: 12,
                padding: "13px 24px",
                fontWeight: 800,
                fontSize: 14,
                cursor:
                  problem.trim() && solution.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all .2s",
              }}
            >
              Choose a Theme <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 2 — Theme ══ */}
      {step === "theme" && (
        <div style={{ maxWidth: 780, margin: "56px auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                margin: "0 0 10px",
              }}
            >
              Pick your visual identity
            </h2>
            <p style={{ color: "#71717A", margin: 0, fontSize: 14 }}>
              Your deck will be styled end-to-end with this theme.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {THEMES.map((th) => (
              <div
                key={th.id}
                onClick={() => setTheme(th.id)}
                style={{
                  background: th.bg,
                  border: `2px solid ${selectedTheme === th.id ? th.accent : "transparent"}`,
                  borderRadius: 14,
                  padding: 14,
                  cursor: "pointer",
                  position: "relative",
                  boxShadow:
                    selectedTheme === th.id
                      ? `0 0 0 1px ${th.accent}40,0 8px 24px ${th.accent}20`
                      : "none",
                  transition: "all .2s",
                }}
              >
                {selectedTheme === th.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: th.accent,
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={10} color="white" strokeWidth={3} />
                  </div>
                )}
                <div
                  style={{
                    background: th.surface,
                    borderRadius: 7,
                    padding: "9px 11px",
                    marginBottom: 9,
                    minHeight: 50,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 3,
                      background: th.accent,
                      borderRadius: 2,
                      marginBottom: 5,
                    }}
                  />
                  <div
                    style={{
                      width: "72%",
                      height: 2,
                      background: th.muted + "60",
                      borderRadius: 2,
                      marginBottom: 3,
                    }}
                  />
                  <div
                    style={{
                      width: "52%",
                      height: 2,
                      background: th.muted + "40",
                      borderRadius: 2,
                    }}
                  />
                </div>
                <div
                  style={{
                    color: th.text,
                    fontWeight: 800,
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  {th.name}
                </div>
                <div style={{ color: th.muted, fontSize: 10 }}>{th.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => setStep("input")}
              style={{
                background: "transparent",
                border: "1px solid #27272A",
                color: "#A1A1AA",
                borderRadius: 12,
                padding: "11px 22px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
            <button
              onClick={generate}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "11px 28px",
                fontWeight: 800,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Generating Deck…
                </>
              ) : (
                <>
                  <Wand2 size={14} /> Generate My Deck
                </>
              )}
            </button>
          </div>
          {error && (
            <p
              style={{
                textAlign: "center",
                color: "#F87171",
                marginTop: 14,
                fontSize: 12,
              }}
            >
              {error}
            </p>
          )}
        </div>
      )}

      {/* ══ STEP 3 — Deck ══ */}
      {step === "deck" && deckData && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "36px 24px 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 900,
              marginBottom: 20,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 19,
                  fontWeight: 900,
                  color: "#F4F4F5",
                  letterSpacing: "-0.02em",
                }}
              >
                {deckData.startupName}
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#71717A" }}>
                {deckData.tagline}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setStep("input");
                  setDeckData(null);
                }}
                style={{
                  background: "transparent",
                  border: "1px solid #27272A",
                  color: "#A1A1AA",
                  borderRadius: 9,
                  padding: "7px 14px",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Start Over
              </button>
              <button
                onClick={generate}
                style={{
                  background: "#18181B",
                  border: "1px solid #27272A",
                  color: "#A1A1AA",
                  borderRadius: 9,
                  padding: "7px 14px",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <RefreshCw size={11} /> Regenerate
              </button>
              <button
                onClick={() => exportPDF(deckData, t)}
                style={{
                  background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                  border: "none",
                  color: "white",
                  borderRadius: 9,
                  padding: "7px 14px",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Download size={11} /> Export PDF
              </button>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 900,
              aspectRatio: "16/9",
              background: t.bg,
              borderRadius: 22,
              border: `1px solid ${t.border}`,
              boxShadow: `0 32px 80px ${t.accent}15,0 0 0 1px ${t.border}`,
              padding: "44px 60px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 260,
                height: 260,
                background: t.accent + "18",
                borderRadius: "50%",
                filter: "blur(60px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -80,
                left: -40,
                width: 180,
                height: 180,
                background: t.accent + "10",
                borderRadius: "50%",
                filter: "blur(80px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 26,
                right: 32,
                fontSize: 10,
                fontWeight: 800,
                color: t.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {String(currentSlide + 1).padStart(2, "0")} /{" "}
              {String(slideCount).padStart(2, "0")}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: 32,
                fontSize: 9,
                fontWeight: 800,
                color: t.muted + "80",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {deckData.startupName}
            </div>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 640 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    background: t.accentSoft,
                    borderRadius: 7,
                    padding: "5px 7px",
                    display: "flex",
                  }}
                >
                  <SlideIcon size={13} color={t.accent} strokeWidth={2.5} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: t.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  {slide.title}
                </span>
              </div>
              <h2
                style={{
                  margin: "0 0 16px",
                  fontSize: 26,
                  fontWeight: 900,
                  color: t.text,
                  lineHeight: 1.2,
                  letterSpacing: "-0.025em",
                }}
              >
                {slide.headline}
              </h2>
              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: t.muted,
                  fontWeight: 500,
                }}
              >
                {slide.body}
              </p>
              {slide.stat && (
                <div
                  style={{
                    display: "inline-block",
                    background: t.accentSoft,
                    border: `1px solid ${t.accent}40`,
                    borderRadius: 9,
                    padding: "7px 14px",
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 800, color: t.accent }}
                  >
                    {slide.stat}
                  </span>
                </div>
              )}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: t.border,
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: t.accent,
                  width: `${((currentSlide + 1) / slideCount) * 100}%`,
                  transition: "width .4s ease",
                  borderRadius: "0 2px 2px 0",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 22,
            }}
          >
            <button
              onClick={() => setSlide((p) => Math.max(0, p - 1))}
              disabled={currentSlide === 0}
              style={{
                background: "#18181B",
                border: "1px solid #27272A",
                color: currentSlide === 0 ? "#3F3F46" : "#F4F4F5",
                borderRadius: "50%",
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentSlide === 0 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={17} />
            </button>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {deckData.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: i === currentSlide ? 22 : 5,
                      height: 5,
                      borderRadius: 3,
                      background: i === currentSlide ? "#6366F1" : "#3F3F46",
                      transition: "all .25s",
                    }}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => setSlide((p) => Math.min(slideCount - 1, p + 1))}
              disabled={currentSlide === slideCount - 1}
              style={{
                background: "#18181B",
                border: "1px solid #27272A",
                color: currentSlide === slideCount - 1 ? "#3F3F46" : "#F4F4F5",
                borderRadius: "50%",
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  currentSlide === slideCount - 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 20,
              maxWidth: 900,
              width: "100%",
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {deckData.slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  background: i === currentSlide ? "#6366F1" : "#18181B",
                  border: `1px solid ${i === currentSlide ? "#6366F1" : "#27272A"}`,
                  color: i === currentSlide ? "white" : "#71717A",
                  borderRadius: 7,
                  padding: "5px 11px",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all .2s",
                }}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
