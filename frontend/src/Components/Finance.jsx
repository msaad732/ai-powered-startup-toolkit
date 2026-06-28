import React, { useState, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  MenuIcon,
  Scale,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Download,
  ChevronRight,
  Calculator,
  Briefcase,
  Layers,
  BarChart3,
  Wallet,
  Menu,
  X,
  LayoutDashboard,
  LineChart,
  Globe,
  Users,
  Target,
  BrainCircuit,
  Presentation,
  RefreshCcw,
} from "lucide-react";
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart as RePieChart,
  Pie,
} from "recharts";
import { API_BASE } from "../config/api";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const App = () => {
  const [financeData, setFinanceData] = useState(null);
  const safeRevenue = financeData?.revenueForecast || [];
  const [step, setStep] = useState("input");
  const [loadingStep, setLoadingStep] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Market trends state
  const [trendsData, setTrendsData] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState(null);

  const [formData, setFormData] = useState({
    startupName: "",
    businessModel: "SaaS",
    industry: "Technology",
    marketSize: "Medium",
    operationalScale: "Local",
    stage: "Pre-revenue",
    avgPrice: "",
    expectedCustomers: "",
    growthRate: 15,
  });

  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const loadingMessages = [
    "Initializing financial engine...",
    "Estimating CAPEX & OPEX requirements...",
    "Forecasting 12-month revenue growth...",
    "Calculating break-even milestones...",
    "Analyzing cash flow and burn rate...",
    "Assessing financial risk factors...",
    "Finalizing viability score...",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Fetch Market Trends from Groq ────────────────────────────────────────
  const fetchMarketTrends = async () => {
    setTrendsLoading(true);
    setTrendsError(null);
    setTrendsData(null);

    try {
      const res = await fetch(`${API_BASE}/finance/market-trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessModel: formData.businessModel,
          industry: formData.industry,
          marketSize: formData.marketSize,
          stage: formData.stage,
          startupName: formData.startupName,
        }),
      });

      if (!res.ok) throw new Error("Backend API error");
      const parsed = await res.json();
      setTrendsData(parsed);
    } catch (err) {
      console.error("Groq trends error:", err);
      setTrendsError("Could not load AI analysis. Please try again.");
    } finally {
      setTrendsLoading(false);
    }
  };

  const handleTrendsTab = () => {
    setStep("trends");
    if (!trendsData && !trendsLoading) {
      fetchMarketTrends();
    }
  };

  // ── Icon resolver for trend cards ────────────────────────────────────────
  const TrendIcon = ({ name, className }) => {
    const icons = { Globe, Users, Target, TrendingUp, Zap, ShieldCheck };
    const Icon = icons[name] || Globe;
    return <Icon className={className} />;
  };

  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600" },
  };

  // ── Export PDF (jsPDF — one click, no print dialog) ──────────────────────
  const exportPDF = async () => {
    if (!financeData) return;
    setExportingPdf(true);

    try {
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = 0;

      const addPage = () => {
        doc.addPage();
        y = 18;
      };
      const checkY = (needed = 10) => {
        if (y + needed > 275) addPage();
      };

      const drawRect = (x, ry, w, h, fill, stroke) => {
        doc.setFillColor(...fill);
        if (stroke) {
          doc.setDrawColor(...stroke);
          doc.setLineWidth(0.3);
          doc.roundedRect(x, ry, w, h, 3, 3, "FD");
        } else {
          doc.roundedRect(x, ry, w, h, 3, 3, "F");
        }
      };

      const writeText = (text, x, ty, opts = {}) => {
        doc.setFont("helvetica", opts.style || "normal");
        doc.setFontSize(opts.size || 10);
        doc.setTextColor(...(opts.color || [30, 41, 59]));
        doc.text(String(text), x, ty, opts.align ? { align: opts.align } : {});
      };

      const wrapText = (text, x, startY, maxW, lineH, opts = {}) => {
        const lines = doc.splitTextToSize(String(text), maxW);
        lines.forEach((line) => {
          checkY(lineH);
          writeText(line, x, y, opts);
          y += lineH;
        });
      };

      // ── HEADER ─────────────────────────────────────────────────────────
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 42, "F");
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 38, pageW, 4, "F");

      writeText("Finance & Budget Report", margin, 16, {
        style: "bold",
        size: 18,
        color: [255, 255, 255],
      });
      writeText(
        `${formData.startupName}  ·  ${formData.businessModel}  ·  ${formData.industry}`,
        margin,
        26,
        { size: 9, color: [148, 163, 184] },
      );

      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      writeText(dateStr, pageW - margin, 16, {
        size: 9,
        color: [148, 163, 184],
        align: "right",
      });
      writeText(formData.stage, pageW - margin, 26, {
        style: "bold",
        size: 9,
        color: [199, 210, 254],
        align: "right",
      });

      y = 52;

      // ── VIABILITY SCORE ────────────────────────────────────────────────
      checkY(38);
      drawRect(margin, y, contentW, 36, [238, 242, 255], [199, 210, 254]);
      writeText("FINANCIAL VIABILITY ASSESSMENT", margin + 6, y + 9, {
        style: "bold",
        size: 7,
        color: [99, 102, 241],
      });
      writeText(financeData.status, margin + 6, y + 18, {
        style: "bold",
        size: 12,
        color: [15, 23, 42],
      });
      writeText(
        "Based on burn rate vs. growth projections",
        margin + 6,
        y + 26,
        { size: 8, color: [100, 116, 139] },
      );

      const cx = pageW - margin - 22;
      const cy = y + 18;
      doc.setFillColor(99, 102, 241);
      doc.circle(cx, cy, 14, "F");
      writeText(`${financeData.viabilityScore}`, cx, cy + 4, {
        style: "bold",
        size: 16,
        color: [255, 255, 255],
        align: "center",
      });
      writeText("/100", cx, cy + 10, {
        size: 7,
        color: [199, 210, 254],
        align: "center",
      });
      y += 44;

      // ── KPI CARDS (4 across) ───────────────────────────────────────────
      checkY(22);
      const year1Revenue = Math.round(
        financeData.revenueForecast.reduce((a, b) => a + b.revenue, 0),
      );
      const fundingNeeded = Math.round(
        (financeData.capex || []).reduce((a, b) => a + b.cost, 0) +
          financeData.cashFlow.burnRate * 6,
      );
      const kpis = [
        {
          label: "Startup Runway",
          value: `${financeData.cashFlow.runway} Months`,
          sub: `Burn: $${financeData.cashFlow.burnRate}/mo`,
        },
        {
          label: "Break-Even",
          value: `Month ${financeData.breakEven.months}`,
          sub: `Req: ${financeData.breakEven.minCustomers} users`,
        },
        {
          label: "Year 1 Revenue",
          value: `$${year1Revenue.toLocaleString()}`,
          sub: "Aggressive Projection",
        },
        {
          label: "Funding Needed",
          value: `$${fundingNeeded.toLocaleString()}`,
          sub: "6-Month Cushion",
        },
      ];
      const kpiW = (contentW - 9) / 4;
      kpis.forEach((k, i) => {
        const kx = margin + i * (kpiW + 3);
        drawRect(kx, y, kpiW, 20, [248, 250, 252], [226, 232, 240]);
        writeText(k.label, kx + 4, y + 6, {
          style: "bold",
          size: 6,
          color: [148, 163, 184],
        });
        writeText(k.value, kx + 4, y + 13, {
          style: "bold",
          size: 9,
          color: [15, 23, 42],
        });
        writeText(k.sub, kx + 4, y + 18, { size: 6, color: [100, 116, 139] });
      });
      y += 28;

      // ── REVENUE FORECAST TABLE ─────────────────────────────────────────
      checkY(14);
      writeText("12-Month Revenue Forecast", margin, y, {
        style: "bold",
        size: 12,
        color: [15, 23, 42],
      });
      y += 2;
      doc.setDrawColor(199, 210, 254);
      doc.setLineWidth(0.4);
      doc.line(margin, y, margin + contentW, y);
      y += 6;

      // Header row
      drawRect(margin, y, contentW, 7, [241, 245, 249], [226, 232, 240]);
      writeText("Month", margin + 4, y + 5, {
        style: "bold",
        size: 7.5,
        color: [71, 85, 105],
      });
      writeText("Revenue ($)", margin + contentW * 0.35, y + 5, {
        style: "bold",
        size: 7.5,
        color: [71, 85, 105],
      });
      writeText("Profit ($)", margin + contentW * 0.65, y + 5, {
        style: "bold",
        size: 7.5,
        color: [71, 85, 105],
      });
      y += 9;

      financeData.revenueForecast.forEach((r, i) => {
        checkY(7);
        if (i % 2 === 0) drawRect(margin, y - 1, contentW, 7, [248, 250, 252]);
        writeText(r.month, margin + 4, y + 4.5, {
          size: 8,
          color: [51, 65, 85],
        });
        writeText(
          `$${r.revenue.toLocaleString()}`,
          margin + contentW * 0.35,
          y + 4.5,
          { size: 8, color: [51, 65, 85] },
        );
        writeText(
          `$${r.profit.toLocaleString()}`,
          margin + contentW * 0.65,
          y + 4.5,
          { size: 8, color: [22, 101, 52] },
        );
        y += 7;
      });
      y += 6;

      // ── CAPEX & OPEX SIDE BY SIDE ──────────────────────────────────────
      checkY(14);
      const halfW = (contentW - 6) / 2;

      writeText("CAPEX Breakdown", margin, y, {
        style: "bold",
        size: 11,
        color: [15, 23, 42],
      });
      writeText("OPEX Breakdown", margin + halfW + 6, y, {
        style: "bold",
        size: 11,
        color: [15, 23, 42],
      });
      y += 2;
      doc.line(margin, y, margin + halfW, y);
      doc.line(margin + halfW + 6, y, margin + contentW, y);
      y += 6;

      const capex = financeData.capex || [];
      const opex = financeData.opex || [];
      const maxRows = Math.max(capex.length, opex.length);

      for (let i = 0; i < maxRows; i++) {
        checkY(7);
        if (i % 2 === 0) {
          drawRect(margin, y - 1, halfW, 7, [248, 250, 252]);
          drawRect(margin + halfW + 6, y - 1, halfW, 7, [248, 250, 252]);
        }
        if (capex[i]) {
          writeText(capex[i].category, margin + 3, y + 4.5, {
            size: 7.5,
            color: [51, 65, 85],
          });
          writeText(
            `$${capex[i].cost.toLocaleString()}`,
            margin + halfW - 4,
            y + 4.5,
            { style: "bold", size: 7.5, color: [30, 41, 59], align: "right" },
          );
        }
        if (opex[i]) {
          writeText(opex[i].category, margin + halfW + 9, y + 4.5, {
            size: 7.5,
            color: [51, 65, 85],
          });
          writeText(
            `$${opex[i].cost.toLocaleString()}`,
            margin + contentW - 1,
            y + 4.5,
            { style: "bold", size: 7.5, color: [30, 41, 59], align: "right" },
          );
        }
        y += 7;
      }
      y += 8;

      // ── RISKS ──────────────────────────────────────────────────────────
      if ((financeData.risks || []).length > 0) {
        checkY(14);
        writeText("Risk Analysis", margin, y, {
          style: "bold",
          size: 11,
          color: [15, 23, 42],
        });
        y += 2;
        doc.line(margin, y, margin + contentW, y);
        y += 6;

        financeData.risks.forEach((r) => {
          const lines = doc.splitTextToSize(
            `Mitigation: ${r.mitigation}`,
            contentW - 10,
          );
          const h = 10 + lines.length * 4.5;
          checkY(h + 3);
          drawRect(margin, y, contentW, h, [255, 247, 237], [251, 146, 60]);
          doc.setFillColor(249, 115, 22);
          doc.rect(margin, y, 3, h, "F");
          writeText(`⚠  ${r.risk}`, margin + 6, y + 6, {
            style: "bold",
            size: 8,
            color: [194, 65, 12],
          });
          lines.forEach((line, li) => {
            writeText(line, margin + 6, y + 11 + li * 4.5, {
              size: 7.5,
              color: [154, 52, 18],
            });
          });
          y += h + 4;
        });
        y += 4;
      }

      // ── RECOMMENDATIONS ────────────────────────────────────────────────
      if ((financeData.recommendations || []).length > 0) {
        checkY(14);
        writeText("Recommendations", margin, y, {
          style: "bold",
          size: 11,
          color: [15, 23, 42],
        });
        y += 2;
        doc.line(margin, y, margin + contentW, y);
        y += 6;

        financeData.recommendations.forEach((r) => {
          const lines = doc.splitTextToSize(`✓  ${r}`, contentW - 10);
          const h = 6 + lines.length * 4.5;
          checkY(h + 3);
          drawRect(margin, y, contentW, h, [240, 253, 244], [134, 239, 172]);
          doc.setFillColor(34, 197, 94);
          doc.rect(margin, y, 3, h, "F");
          lines.forEach((line, li) => {
            writeText(line, margin + 6, y + 5 + li * 4.5, {
              size: 8,
              color: [22, 101, 52],
            });
          });
          y += h + 4;
        });
      }

      // ── FOOTER ─────────────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 285, pageW, 12, "F");
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(0, 285, pageW, 285);
        writeText(
          "FYP Module: Financial Viability Engine  ·  AI-Powered Startup Toolkit",
          margin,
          291,
          { size: 7, color: [148, 163, 184] },
        );
        writeText(`Page ${p} of ${totalPages}`, pageW - margin, 291, {
          size: 7,
          color: [148, 163, 184],
          align: "right",
        });
      }

      const fileName = `${(formData.startupName || "startup").replace(/\s+/g, "_")}_financial_report.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Could not export PDF. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const getMockData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let currentRev =
      Number(formData.expectedCustomers) * Number(formData.avgPrice);
    const forecast = months.map((m) => {
      const rev = currentRev;
      currentRev *= 1 + formData.growthRate / 100;
      return {
        month: m,
        revenue: Math.round(rev),
        profit: Math.round(rev * 0.2),
      };
    });
    return {
      viabilityScore: 78,
      status: "Financially Viable (Simulated)",
      capex: [
        { category: "Product Development", cost: 15000 },
        { category: "Legal & Registry", cost: 2000 },
      ],
      opex: [
        { category: "Cloud Hosting", cost: 500 },
        { category: "Marketing", cost: 1200 },
        { category: "Team Salaries", cost: 5000 },
      ],
      revenueForecast: forecast,
      breakEven: { months: 8, minCustomers: 450, revenueRequired: 25000 },
      cashFlow: { runway: 14, burnRate: 6700, positiveMonth: 9 },
      risks: [
        {
          risk: "Customer Acquisition Cost (CAC) Spike",
          mitigation: "Focus on organic SEO and referral loops early.",
        },
        {
          risk: "High Initial Burn Rate",
          mitigation: "Utilize cloud credits and part-time contractors.",
        },
      ],
      recommendations: [
        "Optimize marketing spend in Q1",
        "Consider a tiered pricing model to increase LTV",
        "Maintain 6 months of cash reserves",
      ],
    };
  };

  const generateFinancePlan = async () => {
    if (!formData.startupName) {
      setError("Please enter a Startup Name.");
      return;
    }
    if (!formData.avgPrice || !formData.expectedCustomers) {
      setError("Please enter average price and expected customers.");
      return;
    }

    setStep("loading");
    setLoadingStep(0);
    setError(null);

    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev,
      );
    }, 1200);

    const startTime = Date.now();
    try {
      const response = await fetch(`${API_BASE}/finance/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName: formData.startupName,
          avgPrice: Number(formData.avgPrice),
          expectedCustomers: Number(formData.expectedCustomers),
          growthRate: Number(formData.growthRate),
          businessModel: formData.businessModel,
          industry: formData.industry,
          marketSize: formData.marketSize,
          operationalScale: formData.operationalScale,
          stage: formData.stage,
        }),
      });
      if (!response.ok) throw new Error("Backend API error");
      const parsedData = await response.json();
      const elapsed = Date.now() - startTime;
      setTimeout(
        () => {
          setFinanceData(parsedData);
          setStep("results");
          clearInterval(interval);
        },
        Math.max(0, 2500 - elapsed),
      );
    } catch (err) {
      console.error("Finance API error:", err);
      setTimeout(() => {
        setFinanceData(getMockData());
        setStep("results");
        clearInterval(interval);
      }, 3000);
    }
  };

  const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navItems = [
      { name: "Home", icon: <LayoutDashboard size={18} />, path: "/" },
      {
        name: "IdeaValidation",
        icon: <BrainCircuit size={18} />,
        path: "/ideavalidation",
      },
      {
        name: "Finance&Budget",
        icon: <BarChart3 size={18} />,
        path: "/finance",
      },
      {
        name: "Pitch Deck",
        icon: <Presentation size={18} />,
        path: "/pitch-ppt",
      },
      {
        name: "Venture Capitalists",
        icon: <Scale size={18} />,
        path: "/venture-capitalists",
      },
      {
        name: "Name&Slogan Generator",
        icon: <Target size={18} />,
        path: "/name-slogangenerator",
      },
      {
        name: "Social Media Management",
        icon: <BarChart3 size={18} />,
        path: "/socialmedia",
      },
    ];

    return (
      <nav className="w-full bg-slate-900 border-b border-indigo-500/20 shadow-2xl sticky top-0 z-[50]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-black text-white tracking-tighter text-xl leading-none">
            Finance&<span className="text-blue-400">Budget</span>
          </span>
          <div className="hidden lg:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            {navItems.map((item) => (
              <a key={item.name} href={item.path}>
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${item.name === "Finance&Budget" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"}`}
                >
                  {React.cloneElement(item.icon, { size: 14 })}
                  {item.name}
                </button>
              </a>
            ))}
          </div>
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
            >
              {isOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="lg:hidden w-full bg-slate-900 border-t border-slate-800">
            <div className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm border transition-all ${item.name === "Finance&Budget" ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-800/40 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      <Navigation />
      <nav className="bg-[#0F172A] border-b border-slate-800 sticky z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setStep("input")}
          >
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Finance<span className="text-indigo-400">Planner</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setStep("input")}
              className={`cursor-pointer text-sm font-bold flex items-center gap-2 transition-colors ${step === "input" ? "text-indigo-400" : "text-slate-400 hover:text-white"}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Forecast Input
            </button>
            <button
              onClick={() => financeData && setStep("results")}
              disabled={!financeData}
              className={`cursor-pointer text-sm font-bold flex items-center gap-2 transition-colors ${step === "results" ? "text-indigo-400" : financeData ? "text-slate-400 hover:text-white" : "text-slate-600 cursor-not-allowed"}`}
            >
              <BarChart3 className="w-4 h-4" /> Financial Analysis
            </button>
            <button
              onClick={handleTrendsTab}
              className={`cursor-pointer text-sm font-bold flex items-center gap-2 transition-colors ${step === "trends" ? "text-indigo-400" : "text-slate-400 hover:text-white"}`}
            >
              <LineChart className="w-4 h-4" /> Market Trends
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={exportPDF}
              disabled={!financeData || exportingPdf}
              className={`flex text-sm font-bold px-4 py-2 rounded-lg items-center gap-2 shadow-lg transition-all ${financeData && !exportingPdf ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/40 cursor-pointer" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
            >
              {exportingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-[#1E293B] border-b border-slate-800 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <button
              onClick={() => {
                setStep("input");
                setIsMenuOpen(false);
              }}
              className="w-full text-left text-slate-300 font-bold flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800"
            >
              <LayoutDashboard className="w-5 h-5" /> Forecast Input
            </button>
            <button
              onClick={() => {
                if (financeData) {
                  setStep("results");
                  setIsMenuOpen(false);
                }
              }}
              className={`w-full text-left font-bold flex items-center gap-3 p-2 rounded-lg ${financeData ? "text-slate-300 hover:bg-slate-800" : "text-slate-600"}`}
            >
              <BarChart3 className="w-5 h-5" /> Financial Analysis
            </button>
            <button
              onClick={() => {
                handleTrendsTab();
                setIsMenuOpen(false);
              }}
              className="w-full text-left text-slate-300 font-bold flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800"
            >
              <LineChart className="w-5 h-5" /> Market Trends
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        {/* ── INPUT ──────────────────────────────────────────────────────── */}
        {step === "input" && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-[#1E293B] mb-4">
                AI-Powered Finance & Budget Planner
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Estimate costs, forecast revenue, and evaluate financial
                feasibility with intelligent modeling tools.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
              <div className="p-10 space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Business Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Startup Name
                        </label>
                        <input
                          type="text"
                          name="startupName"
                          value={formData.startupName}
                          onChange={handleInputChange}
                          placeholder="e.g. EcoStream AI"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Business Model
                        </label>
                        <select
                          name="businessModel"
                          value={formData.businessModel}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          <option>SaaS</option>
                          <option>Marketplace</option>
                          <option>E-commerce</option>
                          <option>Service-based</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Scale & Stage
                    </h3>
                    <div className="space-y-4">
                      <select
                        name="marketSize"
                        value={formData.marketSize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="Small">Small Market</option>
                        <option value="Medium">Medium Market</option>
                        <option value="Large">Large / Global</option>
                      </select>
                      <select
                        name="stage"
                        value={formData.stage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option>Pre-revenue</option>
                        <option>MVP Phase</option>
                        <option>Early Revenue</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Revenue Drivers
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          name="avgPrice"
                          value={formData.avgPrice}
                          onChange={handleInputChange}
                          placeholder="Avg. price per user"
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <input
                        type="number"
                        name="expectedCustomers"
                        value={formData.expectedCustomers}
                        onChange={handleInputChange}
                        placeholder="Initial monthly customers"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Est. Monthly Growth
                    </span>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        name="growthRate"
                        value={formData.growthRate}
                        min="1"
                        max="50"
                        onChange={handleInputChange}
                        className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-lg font-bold text-slate-700">
                        {formData.growthRate}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={generateFinancePlan}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 flex items-center gap-3 transition-all transform hover:-translate-y-1"
                  >
                    Generate Financial Plan{" "}
                    <ChevronRight className="w-5 h-5 text-indigo-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING ────────────────────────────────────────────────────── */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <Wallet className="absolute inset-0 m-auto text-indigo-600 w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-2 min-h-[80px]">
              <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                {loadingMessages[loadingStep]}
              </h2>
              <p className="text-slate-400 font-medium">
                Crunching historical industry data and financial models...
              </p>
            </div>
          </div>
        )}

        {/* ── MARKET TRENDS (Groq-powered) ───────────────────────────────── */}
        {step === "trends" && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-8">
            {/* Hero banner */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black mb-2">
                  Industry Market Trends
                </h2>
                <p className="text-indigo-100">
                  AI-powered analysis for{" "}
                  <span className="font-bold">{formData.businessModel}</span>
                  {formData.startupName ? ` · ${formData.startupName}` : ""}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 text-center">
                  <p className="text-[10px] uppercase font-bold text-indigo-200">
                    Growth Index
                  </p>
                  <p className="text-xl font-bold">
                    {trendsData?.growthIndex ?? "—"}
                  </p>
                </div>
                <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 text-center">
                  <p className="text-[10px] uppercase font-bold text-indigo-200">
                    Market Saturation
                  </p>
                  <p className="text-xl font-bold">
                    {trendsData?.saturation ?? "—"}
                  </p>
                </div>
                <button
                  onClick={fetchMarketTrends}
                  disabled={trendsLoading}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-2 transition-all text-sm font-bold disabled:opacity-50"
                >
                  <RefreshCcw
                    className={`w-4 h-4 ${trendsLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Loading state */}
            {trendsLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold">
                  Generating AI market analysis...
                </p>
              </div>
            )}

            {/* Error state */}
            {trendsError && !trendsLoading && (
              <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-4">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-bold mb-1">{trendsError}</p>
                  <button
                    onClick={fetchMarketTrends}
                    className="text-sm underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Trend cards */}
            {trendsData && !trendsLoading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {trendsData.cards.map((card, i) => {
                    const c = colorMap[card.color] || colorMap.blue;
                    return (
                      <div
                        key={i}
                        className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
                      >
                        <div
                          className={`${c.bg} ${c.text} p-4 rounded-2xl mb-4`}
                        >
                          <TrendIcon name={card.icon} className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-3">
                          {card.title}
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {card.insight}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="font-black text-[#0F172A] text-lg mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-500" /> AI
                    Market Summary
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {trendsData.summary}
                  </p>
                </div>
              </>
            )}

            {/* Prompt to fill form if missing */}
            {!trendsLoading && !trendsError && !trendsData && (
              <div className="text-center py-12 text-slate-400 font-medium">
                Fill in your startup details and click{" "}
                <strong>Market Trends</strong> to get AI-powered analysis.
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS ───────────────────────────────────────────────────── */}
        {step === "results" && financeData && (
          <div
            ref={resultsRef}
            className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000"
          >
            <div className="bg-[#0F172A] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="flex items-center gap-8 relative z-10">
                <div
                  className={`p-6 rounded-[2rem] shadow-inner ${financeData.status.includes("Viable") ? "bg-green-500/10 border border-green-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}
                >
                  <ShieldCheck
                    className={`w-14 h-14 ${financeData.status.includes("Viable") ? "text-green-400" : "text-amber-400"}`}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">
                    Financial Viability Score
                  </h3>
                  <p className="text-4xl font-black mb-1">
                    {financeData.status}
                  </p>
                  <p className="text-slate-400 text-sm font-medium">
                    Based on burn rate vs. growth projections
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right relative z-10">
                <div className="flex items-baseline gap-2 justify-center md:justify-end">
                  <span className="text-8xl font-black text-indigo-400">
                    {financeData.viabilityScore}
                  </span>
                  <span className="text-2xl text-slate-600 font-bold">
                    /100
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Startup Runway",
                  value: `${financeData.cashFlow.runway} Months`,
                  icon: <Zap className="text-amber-500" />,
                  sub: `Burn: $${financeData.cashFlow.burnRate}/mo`,
                },
                {
                  label: "Break-Even",
                  value: `Month ${financeData.breakEven.months}`,
                  icon: <Scale className="text-indigo-500" />,
                  sub: `Req: ${financeData.breakEven.minCustomers} users`,
                },
                {
                  label: "Year 1 Revenue",
                  value: `$${Math.round(financeData.revenueForecast.reduce((a, b) => a + b.revenue, 0)).toLocaleString()}`,
                  icon: <TrendingUp className="text-green-500" />,
                  sub: "Aggressive Projection",
                },
                {
                  label: "Funding Needed",
                  value: `$${Math.round((financeData.capex || []).reduce((a, b) => a + b.cost, 0) + financeData.cashFlow.burnRate * 6).toLocaleString()}`,
                  icon: <DollarSign className="text-cyan-500" />,
                  sub: "6-Month Cushion",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg">{m.icon}</div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {m.label}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-[#0F172A] mb-1">
                    {m.value}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-black text-[#0F172A] text-xl">
                    12-Month Revenue & Profit Forecast
                  </h4>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeRevenue}>
                      <defs>
                        <linearGradient
                          id="colorRev"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#34d399"
                        strokeWidth={3}
                        fillOpacity={0}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="font-black text-[#0F172A] text-xl mb-6">
                  Budget Allocation
                </h4>
                <div className="h-[200px] mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={[
                          ...(financeData.capex || []),
                          ...(financeData.opex || []),
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="cost"
                      >
                        {[
                          ...(financeData.capex || []),
                          ...(financeData.opex || []),
                        ].map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index % 2 === 0 ? "#6366f1" : "#0F172A"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 text-xs">
                  {(financeData.opex || []).map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b border-slate-50 pb-2"
                    >
                      <span className="text-slate-600 font-medium">
                        {item.category}
                      </span>
                      <span className="text-slate-900 font-bold">
                        ${item.cost.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-[#0F172A] py-3 text-center text-[10px] text-slate-500 font-bold border-t border-slate-800 z-50">
        FYP MODULE: FINANCIAL VIABILITY ENGINE
      </footer>
    </div>
  );
};

export default App;
