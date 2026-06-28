import React, { useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  DollarSign,
  Users,
  Target,
  BarChart3,
  FileDown,
  Building2,
  Activity,
  Globe,
  Rocket,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  MenuIcon,
  X,
  LayoutDashboard,
  BrainCircuit,
  Presentation,
  Scale,
  BarChart,
} from "lucide-react";
import { API_BASE } from "../config/api";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navigation() {
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
    <nav className="w-full bg-slate-900 border-b border-indigo-500/20 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <span className="font-black text-white tracking-tighter text-xl leading-none">
          Venture<span className="text-blue-400">Capitalists</span>
        </span>
        <div className="hidden lg:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          {navItems.map((item) => (
            <Link key={item.name} to={item.path}>
              <button
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all
                ${
                  item.name === "Venture Capitalists"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            </Link>
          ))}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
        >
          {isOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>
      {isOpen && (
        <div className="lg:hidden w-full bg-slate-900 border-t border-slate-800">
          <div className="flex flex-col p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm border transition-all
                  ${
                    item.name === "Venture Capitalists"
                      ? "bg-indigo-600 text-white border-indigo-400"
                      : "bg-slate-800/40 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                {React.cloneElement(item.icon, { size: 18 })}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Reusable UI pieces (defined OUTSIDE main component) ─────────────────────
const inputCls =
  "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition";
const selectCls =
  "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 transition";

const FieldLabel = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

const SectionCard = ({
  icon: Icon,
  title,
  iconColor = "text-violet-500",
  children,
}) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
    <div className="flex items-center gap-2.5 mb-5">
      <div className={`p-1.5 rounded-lg bg-slate-50 ${iconColor}`}>
        <Icon size={18} />
      </div>
      <h2 className="text-sm font-bold text-slate-700">{title}</h2>
    </div>
    {children}
  </div>
);

const RiskBar = ({ label, score }) => {
  const color =
    score >= 7 ? "bg-rose-400" : score >= 4 ? "bg-amber-400" : "bg-emerald-400";
  const textColor =
    score >= 7
      ? "text-rose-600"
      : score >= 4
        ? "text-amber-600"
        : "text-emerald-600";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span className={textColor}>{score}/10</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
};

const ScoreRing = ({ score }) => {
  const r = 54,
    circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = score >= 70 ? "#7c3aed" : score >= 45 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle
          cx="72"
          cy="72"
          r={r}
          stroke="#f1f5f9"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="72"
          cy="72"
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-4xl font-black text-slate-800 leading-none">
          {score}
        </p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          VC Score
        </p>
      </div>
    </div>
  );
};

const verdictStyle = {
  "Hot Deal": "bg-emerald-100 text-emerald-700",
  Fundable: "bg-violet-100 text-violet-700",
  "Too Early": "bg-amber-100 text-amber-700",
  "Not VC-Suitable": "bg-rose-100 text-rose-700",
};

// ─── Steps indicator (outside main) ──────────────────────────────────────────
const Steps = ({ step }) => (
  <div className="flex items-center justify-center gap-3 mb-8">
    {[1, 2].map((i) => (
      <div key={i} className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
          ${
            step === i
              ? "bg-violet-600 text-white ring-4 ring-violet-100"
              : step > i
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {step > i ? <CheckCircle2 size={14} /> : i}
        </div>
        <span
          className={`text-xs font-semibold ${step === i ? "text-slate-800" : "text-slate-400"}`}
        >
          {i === 1 ? "Startup profile" : "VC report"}
        </span>
        {i === 1 && <ChevronRight size={14} className="text-slate-300" />}
      </div>
    ))}
  </div>
);

// ─── Report (outside main) ────────────────────────────────────────────────────
const Report = ({ assessment, form, onReset, onDownload }) => {
  const d = assessment;
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center text-center gap-4">
          <ScoreRing score={d.vcScore} />
          <span
            className={`px-5 py-1.5 rounded-full text-xs font-bold ${verdictStyle[d.vcVerdict] ?? "bg-slate-100 text-slate-600"}`}
          >
            {d.vcVerdict}
          </span>
        </div>
        <div>
          <p className="text-lg font-black text-slate-800 mb-1">
            {form.startupName}
          </p>
          <p className="text-slate-500 text-sm leading-relaxed mb-5">
            {d.oneLiner}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Implied pre-money", value: d.impliedValuation },
              { label: "Stage fit", value: d.stageFit },
              { label: "Equity offered", value: `${form.dilution}%` },
              { label: "Runway", value: `${form.runway} mo` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">
            Strengths
          </p>
          <ul className="space-y-3">
            {d.strengths.map((s, i) => (
              <li
                key={i}
                className="flex gap-2.5 items-start text-sm text-slate-700"
              >
                <CheckCircle2
                  size={15}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-4">
            Red flags
          </p>
          <ul className="space-y-3">
            {d.redFlags.map((r, i) => (
              <li
                key={i}
                className="flex gap-2.5 items-start text-sm text-slate-700"
              >
                <AlertCircle
                  size={15}
                  className="text-rose-400 shrink-0 mt-0.5"
                />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
          Risk matrix
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <RiskBar label="Team risk" score={d.riskScores.teamRisk} />
          <RiskBar label="Market risk" score={d.riskScores.marketRisk} />
          <RiskBar label="Product risk" score={d.riskScores.productRisk} />
          <RiskBar label="Financial risk" score={d.riskScores.financialRisk} />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
          Best-match VC archetypes
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {d.vcArchetypes.map((v, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <Building2 size={20} className="text-violet-500 mb-2" />
              <p className="text-sm font-bold text-slate-800 mb-1 leading-snug">
                {v.type}
              </p>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                {v.why}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${v.matchPct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-violet-600">
                  {v.matchPct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Term sheet signals
          </p>
          <ul className="space-y-3">
            {d.termSignals.map((t, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm text-slate-300 items-start"
              >
                <div className="w-1 h-1 rounded-full bg-violet-400 mt-2 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Exit paths
          </p>
          <ul className="space-y-3">
            {d.exitPaths.map((e, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm text-slate-700 items-start"
              >
                <ArrowRight
                  size={14}
                  className="text-violet-500 shrink-0 mt-0.5"
                />
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
          Roadmap to raise
        </p>
        <div className="space-y-4">
          {d.roadmap.map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 text-xs font-black">
                {i + 1}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pt-0.5">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center py-6 border-t border-slate-100">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
        >
          <FileDown size={16} />
          Download full report
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-violet-600 text-sm font-bold transition-colors"
        >
          <RefreshCw size={14} />
          New assessment
        </button>
      </div>
    </div>
  );
};

// ─── PDF report builder ───────────────────────────────────────────────────────
function buildVCReportPDF(assessment, form) {
  const d = assessment;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = 60;

  const VIOLET = [109, 40, 217];
  const SLATE_900 = [15, 23, 42];
  const SLATE_600 = [71, 85, 105];
  const SLATE_400 = [148, 163, 184];
  const EMERALD = [5, 150, 105];
  const ROSE = [220, 38, 38];

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = 60;
    }
  };

  const addSectionTitle = (title, color = SLATE_400) => {
    ensureSpace(26);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...color);
    doc.text(title.toUpperCase(), margin, y);
    y += 16;
  };

  const addBulletList = (items, opts = {}) => {
    const { size = 11, color = SLATE_600 } = opts;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    items.forEach((item) => {
      const lines = doc.splitTextToSize(`•  ${item}`, contentWidth);
      ensureSpace(lines.length * (size * 1.3) + 4);
      doc.text(lines, margin, y);
      y += lines.length * (size * 1.3) + 4;
    });
  };

  const addParagraph = (text, opts = {}) => {
    const { size = 11, color = SLATE_600, italic = false } = opts;
    if (!text) return;
    doc.setFont("helvetica", italic ? "italic" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    ensureSpace(lines.length * (size * 1.3));
    doc.text(lines, margin, y);
    y += lines.length * (size * 1.3) + 6;
  };

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...SLATE_900);
  doc.text(form.startupName || "Untitled Startup", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...SLATE_900);
  doc.text(`${d.vcScore}/100`, pageWidth - margin, y, { align: "right" });
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_400);
  doc.text(
    `VC Readiness Report  •  Generated ${new Date().toLocaleDateString()}`,
    margin,
    y,
  );
  doc.text("VC Score", pageWidth - margin, y, { align: "right" });
  y += 18;

  // verdict badge
  doc.setFillColor(237, 233, 254);
  const verdictWidth = doc.getTextWidth(d.vcVerdict) + 20;
  doc.roundedRect(margin, y, verdictWidth, 18, 9, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...VIOLET);
  doc.text(d.vcVerdict, margin + 10, y + 12.5);
  y += 32;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // one-liner
  addParagraph(`"${d.oneLiner}"`, { italic: true, color: SLATE_600 });
  y += 4;

  // KPI grid (simple 2x2 text grid)
  const kpis = [
    ["Implied pre-money", d.impliedValuation],
    ["Stage fit", d.stageFit],
    ["Equity offered", `${form.dilution}%`],
    ["Runway", `${form.runway} mo`],
  ];
  ensureSpace(50);
  const colWidth = contentWidth / 2;
  kpis.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colWidth;
    const rowY = y + row * 36;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_400);
    doc.text(label.toUpperCase(), x, rowY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...SLATE_900);
    doc.text(String(value), x, rowY + 14);
  });
  y += 36 * Math.ceil(kpis.length / 2) + 14;

  // Strengths
  addSectionTitle("Strengths", EMERALD);
  addBulletList(d.strengths);
  y += 8;

  // Red flags
  addSectionTitle("Red Flags", ROSE);
  addBulletList(d.redFlags);
  y += 8;

  // Risk matrix
  addSectionTitle("Risk Matrix");
  const risks = [
    ["Team risk", d.riskScores.teamRisk],
    ["Market risk", d.riskScores.marketRisk],
    ["Product risk", d.riskScores.productRisk],
    ["Financial risk", d.riskScores.financialRisk],
  ];
  risks.forEach(([label, score]) => {
    ensureSpace(16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...SLATE_600);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(`${score}/10`, pageWidth - margin, y, { align: "right" });
    y += 16;
  });
  y += 8;

  // VC Archetypes
  addSectionTitle("Best-Match VC Archetypes");
  d.vcArchetypes.forEach((v) => {
    ensureSpace(34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...SLATE_900);
    doc.text(`${v.type} — ${v.matchPct}% match`, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...SLATE_600);
    const lines = doc.splitTextToSize(v.why, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 10;
  });
  y += 4;

  // Term signals
  addSectionTitle("Term Sheet Signals");
  addBulletList(d.termSignals);
  y += 8;

  // Exit paths
  addSectionTitle("Exit Paths");
  addBulletList(d.exitPaths);
  y += 8;

  // Roadmap
  addSectionTitle("Roadmap to Raise");
  d.roadmap.forEach((step, i) => {
    addParagraph(`${i + 1}.  ${step}`, { size: 11 });
  });

  // Footer on every page
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_400);
    doc.text(
      `Confidential  •  ${form.startupName || ""}`,
      pageWidth / 2,
      pageHeight - 24,
      { align: "center" },
    );
  }

  const safeName = (form.startupName || "startup").replace(/[^a-z0-9]+/gi, "_");
  doc.save(`${safeName}_VC_Readiness_Report.pdf`);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VentureCapitalists() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);

  const [form, setForm] = useState({
    startupName: "",
    industry: "SaaS",
    stage: "Seed",
    bizModel: "B2B SaaS",
    months: "",
    teamSize: "",
    teamBg: "Mixed technical + business",
    productStage: "Live product — early traction",
    geo: "National",
    arr: "",
    momGrowth: "",
    burnRate: "",
    runway: "",
    tam: "",
    customers: "",
    priorFunding: "",
    targetRaise: "",
    dilution: 15,
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const num = (v) => parseFloat(String(v).replace(/,/g, "")) || 0;

  const runAssessment = async () => {
    if (!form.startupName) {
      setError("Please enter your startup name.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/venture/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName: form.startupName,
          industry: form.industry,
          stage: form.stage,
          bizModel: form.bizModel,
          months: form.months,
          teamSize: form.teamSize,
          teamBg: form.teamBg,
          productStage: form.productStage,
          geo: form.geo,
          arr: form.arr,
          momGrowth: form.momGrowth,
          burnRate: form.burnRate,
          runway: form.runway,
          tam: form.tam,
          customers: form.customers,
          priorFunding: form.priorFunding,
          targetRaise: form.targetRaise,
          dilution: Number(form.dilution),
        }),
      });
      if (!res.ok) throw new Error("API request failed");
      const data = await res.json();
      setAssessment(data);
      setStep(2);
    } catch {
      setError("Analysis failed. Please check your inputs and try again.");
    }

    setLoading(false);
  };

  const downloadReport = () => {
    if (!assessment) return;
    buildVCReportPDF(assessment, form);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16 pt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Venture Capital Readiness
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Evaluate your startup's VC fit, find your best-match investor
            archetypes, and get a clear roadmap to raise.
          </p>
        </div>

        <Steps step={step} />

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <SectionCard
                icon={Building2}
                title="Company basics"
                iconColor="text-violet-500"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldLabel label="Startup name">
                    <input
                      className={inputCls}
                      value={form.startupName}
                      onChange={set("startupName")}
                      placeholder="e.g. Nexa AI"
                    />
                  </FieldLabel>
                  <FieldLabel label="Industry / sector">
                    <select
                      className={selectCls}
                      value={form.industry}
                      onChange={set("industry")}
                    >
                      {[
                        "SaaS",
                        "Fintech",
                        "HealthTech",
                        "DeepTech / AI",
                        "Consumer",
                        "EdTech",
                        "CleanTech",
                        "Marketplace",
                        "E-commerce",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Funding stage sought">
                    <select
                      className={selectCls}
                      value={form.stage}
                      onChange={set("stage")}
                    >
                      {[
                        "Pre-Seed",
                        "Seed",
                        "Series A",
                        "Series B",
                        "Series C+",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Business model">
                    <select
                      className={selectCls}
                      value={form.bizModel}
                      onChange={set("bizModel")}
                    >
                      {[
                        "B2B SaaS",
                        "B2C Subscription",
                        "Marketplace (take-rate)",
                        "Transactional / Usage-based",
                        "Enterprise / License",
                        "D2C",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Months of operation">
                    <input
                      className={inputCls}
                      type="number"
                      value={form.months}
                      onChange={set("months")}
                      placeholder="e.g. 18"
                    />
                  </FieldLabel>
                  <FieldLabel label="Team size (headcount)">
                    <input
                      className={inputCls}
                      type="number"
                      value={form.teamSize}
                      onChange={set("teamSize")}
                      placeholder="e.g. 12"
                    />
                  </FieldLabel>
                </div>
              </SectionCard>

              <SectionCard
                icon={TrendingUp}
                title="Traction & financials"
                iconColor="text-blue-500"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldLabel label="Annual Recurring Revenue / ARR (USD)">
                    <div className="relative">
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
                      <input
                        className={inputCls + " pl-8"}
                        value={form.arr}
                        onChange={set("arr")}
                        placeholder="e.g. 500,000"
                      />
                    </div>
                  </FieldLabel>
                  <FieldLabel label="MoM revenue growth (%)">
                    <input
                      className={inputCls}
                      type="number"
                      value={form.momGrowth}
                      onChange={set("momGrowth")}
                      placeholder="e.g. 15"
                    />
                  </FieldLabel>
                  <FieldLabel label="Monthly burn rate (USD)">
                    <div className="relative">
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
                      <input
                        className={inputCls + " pl-8"}
                        value={form.burnRate}
                        onChange={set("burnRate")}
                        placeholder="e.g. 80,000"
                      />
                    </div>
                  </FieldLabel>
                  <FieldLabel label="Runway (months)">
                    <input
                      className={inputCls}
                      type="number"
                      value={form.runway}
                      onChange={set("runway")}
                      placeholder="e.g. 10"
                    />
                  </FieldLabel>
                  <FieldLabel label="Total Addressable Market / TAM (USD)">
                    <div className="relative">
                      <Globe
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
                      <input
                        className={inputCls + " pl-8"}
                        value={form.tam}
                        onChange={set("tam")}
                        placeholder="e.g. 5,000,000,000"
                      />
                    </div>
                  </FieldLabel>
                  <FieldLabel label="Number of paying customers">
                    <input
                      className={inputCls}
                      type="number"
                      value={form.customers}
                      onChange={set("customers")}
                      placeholder="e.g. 45"
                    />
                  </FieldLabel>
                </div>
              </SectionCard>

              <SectionCard
                icon={Users}
                title="Team & product"
                iconColor="text-emerald-500"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldLabel label="Founding team background">
                    <select
                      className={selectCls}
                      value={form.teamBg}
                      onChange={set("teamBg")}
                    >
                      {[
                        "Technical (engineers/scientists)",
                        "Domain experts",
                        "Serial entrepreneurs",
                        "Mixed technical + business",
                        "First-time founders",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Product stage">
                    <select
                      className={selectCls}
                      value={form.productStage}
                      onChange={set("productStage")}
                    >
                      {[
                        "Idea / Concept",
                        "MVP / Beta",
                        "Live product — early traction",
                        "Product-market fit achieved",
                        "Scaling",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Geographic presence">
                    <select
                      className={selectCls}
                      value={form.geo}
                      onChange={set("geo")}
                    >
                      {[
                        "Local / Single city",
                        "National",
                        "MENA region",
                        "Multi-region",
                        "Global",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Prior funding raised (USD)">
                    <div className="relative">
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
                      <input
                        className={inputCls + " pl-8"}
                        value={form.priorFunding}
                        onChange={set("priorFunding")}
                        placeholder="e.g. 500,000 or 0"
                      />
                    </div>
                  </FieldLabel>
                </div>
              </SectionCard>

              <SectionCard
                icon={Target}
                title="This round"
                iconColor="text-rose-500"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldLabel label="Target raise (USD)">
                    <div className="relative">
                      <DollarSign
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
                      <input
                        className={inputCls + " pl-8"}
                        value={form.targetRaise}
                        onChange={set("targetRaise")}
                        placeholder="e.g. 2,000,000"
                      />
                    </div>
                  </FieldLabel>
                  <FieldLabel label={`Equity dilution: ${form.dilution}%`}>
                    <div className="pt-2">
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="1"
                        value={form.dilution}
                        onChange={set("dilution")}
                        className="w-full accent-violet-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>5%</span>
                        <span>40%</span>
                      </div>
                    </div>
                  </FieldLabel>
                </div>
              </SectionCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <h3 className="text-base font-black mb-1">What you'll get</h3>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                  A VC-lens analysis of your startup across 6 dimensions.
                </p>
                {[
                  { icon: Activity, label: "VC attractiveness score (0–100)" },
                  {
                    icon: BarChart3,
                    label: "Risk matrix — team, market, product, finance",
                  },
                  { icon: Building2, label: "Best-match investor archetypes" },
                  { icon: ShieldAlert, label: "Likely term sheet conditions" },
                  { icon: ArrowRight, label: "Exit path scenarios" },
                  { icon: Rocket, label: "Roadmap to close this round" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-start gap-3 mb-3">
                    <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center shrink-0">
                      <Icon size={12} className="text-violet-300" />
                    </div>
                    <span className="text-xs text-slate-300 leading-snug">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2 text-rose-600 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                onClick={runAssessment}
                disabled={loading || !form.startupName}
                className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-100 active:scale-95"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} fill="currentColor" />
                )}
                {loading ? "Analyzing…" : "Assess VC readiness"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && assessment && (
          <Report
            assessment={assessment}
            form={form}
            onReset={() => {
              setStep(1);
              setAssessment(null);
            }}
            onDownload={downloadReport}
          />
        )}
      </div>
    </div>
  );
}
