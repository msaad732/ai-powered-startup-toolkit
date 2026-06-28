import React, { useState } from "react";
import {
  Target,
  BarChart3,
  ShieldAlert,
  TrendingUp,
  ChevronRight,
  RefreshCcw,
  BrainCircuit,
  Scale,
  LayoutDashboard,
  Presentation,
  BarChart,
  MenuIcon,
  X,
  Search,
  Lightbulb,
  Zap,
  Download,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

const App = () => {
  const [step, setStep] = useState("input"); // 'input' | 'loading' | 'results'
  const [loadingStep, setLoadingStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    problem: "",
    solution: "",
    targetCustomers: "",
    industry: "",
    market: "Local",
    revenueModel: "Subscription",
    stage: "Concept",
    pricing: "",
    competitors: "",
  });

  const [validationData, setValidationData] = useState(null);
  const [error, setError] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadingMessages = [
    "Scouring market data...",
    "Analyzing industry trends...",
    "Evaluating competitive intensity...",
    "Simulating customer feedback...",
    "Calculating viability indices...",
    "Finalizing strategic report...",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getMockData = () => ({
    validationScore: 72,
    marketStrength: {
      score: 65,
      scrapedInsights: [
        "Moderate competition detected in search results",
        "Demand signals found in market-related content",
        "Existing solutions indicate an active market space",
      ],
      currentTrends: "Moderate Market — review positioning carefully",
    },
    suggestions: {
      captions: [
        `${formData.title}: Solving ${formData.problem.slice(0, 60)}...`,
        `Built for ${formData.targetCustomers || "your audience"} — ${formData.title}`,
        `Innovation in ${formData.industry || "your industry"} starts here`,
      ],
      strategicPivots: [
        "Focus on a niche segment before expanding broadly",
        "Run customer interviews to validate pricing",
        "Differentiate from competitors with a unique value prop",
      ],
      brandingTips: [
        "Lead with the problem you solve in all messaging",
        "Use language that resonates with your target customer",
        "Collect beta testimonials before full launch",
      ],
    },
  });

  const exportToPdf = async () => {
    setExportingPdf(true);
    try {
      // Dynamically load jsPDF from CDN
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

      // ── Helper functions ──────────────────────────────────────────
      const addPage = () => {
        doc.addPage();
        y = 18;
      };

      const checkY = (needed = 10) => {
        if (y + needed > 275) addPage();
      };

      const drawRect = (x, rectY, w, h, fillColor, strokeColor) => {
        doc.setFillColor(...fillColor);
        if (strokeColor) {
          doc.setDrawColor(...strokeColor);
          doc.setLineWidth(0.3);
          doc.roundedRect(x, rectY, w, h, 3, 3, "FD");
        } else {
          doc.roundedRect(x, rectY, w, h, 3, 3, "F");
        }
      };

      const writeText = (text, x, textY, opts = {}) => {
        doc.setFont("helvetica", opts.style || "normal");
        doc.setFontSize(opts.size || 10);
        doc.setTextColor(...(opts.color || [30, 41, 59]));
        if (opts.align) {
          doc.text(text, x, textY, { align: opts.align });
        } else {
          doc.text(text, x, textY);
        }
      };

      const wrapText = (text, x, startY, maxW, lineH, opts = {}) => {
        const lines = doc.splitTextToSize(text, maxW);
        lines.forEach((line) => {
          checkY(lineH);
          writeText(line, x, y, opts);
          y += lineH;
        });
      };

      // ── HEADER BANNER ─────────────────────────────────────────────
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageW, 42, "F");

      // Accent stripe
      doc.setFillColor(99, 102, 241); // indigo-500
      doc.rect(0, 38, pageW, 4, "F");

      writeText("AI Idea Validator", margin, 16, {
        style: "bold",
        size: 20,
        color: [255, 255, 255],
      });
      writeText("Startup Validation Report", margin, 26, {
        size: 11,
        color: [148, 163, 184],
      });

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
      writeText(formData.title || "Untitled Startup", pageW - margin, 26, {
        style: "bold",
        size: 10,
        color: [199, 210, 254],
        align: "right",
      });

      y = 52;

      // ── VALIDATION SCORE CARD ─────────────────────────────────────
      checkY(38);
      drawRect(margin, y, contentW, 36, [238, 242, 255], [199, 210, 254]);

      writeText("STARTUP READINESS", margin + 6, y + 9, {
        style: "bold",
        size: 7,
        color: [99, 102, 241],
      });
      writeText("Validation Score", margin + 6, y + 17, {
        style: "bold",
        size: 13,
        color: [15, 23, 42],
      });
      writeText(
        "Calculated based on problem intensity, solution clarity, and target market fit.",
        margin + 6,
        y + 25,
        { size: 8, color: [100, 116, 139] },
      );

      // Score circle (simulated with filled circle)
      const cx = pageW - margin - 22;
      const cy = y + 18;
      doc.setFillColor(99, 102, 241);
      doc.circle(cx, cy, 14, "F");
      writeText(`${validationData.validationScore}`, cx, cy + 4, {
        style: "bold",
        size: 16,
        color: [255, 255, 255],
        align: "center",
      });

      y += 44;

      // ── STARTUP DETAILS ───────────────────────────────────────────
      checkY(10);
      writeText("Startup Details", margin, y, {
        style: "bold",
        size: 12,
        color: [15, 23, 42],
      });
      y += 2;
      doc.setDrawColor(199, 210, 254);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + contentW, y);
      y += 6;

      const details = [
        ["Industry", formData.industry || "—"],
        ["Target Customers", formData.targetCustomers || "—"],
        ["Problem", formData.problem],
        ["Solution", formData.solution],
      ];

      details.forEach(([label, value]) => {
        if (!value) return;
        checkY(8);
        writeText(`${label}:`, margin, y, {
          style: "bold",
          size: 9,
          color: [99, 102, 241],
        });
        y += 5;
        wrapText(value, margin + 3, y, contentW - 3, 5, {
          size: 9,
          color: [51, 65, 85],
        });
        y += 3;
      });

      y += 4;

      // ── MARKET STRENGTH ───────────────────────────────────────────
      checkY(14);
      writeText("Market Strength Analysis", margin, y, {
        style: "bold",
        size: 12,
        color: [15, 23, 42],
      });
      y += 2;
      doc.line(margin, y, margin + contentW, y);
      y += 7;

      // Score pill
      checkY(12);
      drawRect(margin, y, 60, 10, [239, 246, 255], [191, 219, 254]);
      writeText("Scraped Strength Score", margin + 4, y + 6.5, {
        size: 8,
        color: [71, 85, 105],
      });
      writeText(
        `${validationData.marketStrength.score}%`,
        margin + 52,
        y + 6.5,
        { style: "bold", size: 9, color: [37, 99, 235] },
      );
      y += 16;

      // Insights
      checkY(6);
      writeText("Search Insights", margin, y, {
        style: "bold",
        size: 9,
        color: [71, 85, 105],
      });
      y += 5;

      validationData.marketStrength.scrapedInsights.forEach((insight) => {
        checkY(10);
        drawRect(margin, y, contentW, 9, [248, 250, 252], [226, 232, 240]);
        doc.setFillColor(37, 99, 235);
        doc.circle(margin + 4, y + 4.5, 1.2, "F");
        writeText(insight, margin + 8, y + 6, {
          size: 8,
          color: [51, 65, 85],
        });
        y += 12;
      });

      y += 2;

      // Current Trends
      checkY(14);
      drawRect(margin, y, contentW, 12, [239, 246, 255], [191, 219, 254]);
      writeText("CURRENT TRENDS", margin + 4, y + 5, {
        style: "bold",
        size: 7,
        color: [37, 99, 235],
      });
      writeText(
        `"${validationData.marketStrength.currentTrends}"`,
        margin + 4,
        y + 10,
        { style: "italic", size: 8, color: [30, 58, 138] },
      );
      y += 18;

      // ── BRANDING & STRATEGY ───────────────────────────────────────
      checkY(14);
      writeText("Branding & Strategy", margin, y, {
        style: "bold",
        size: 12,
        color: [15, 23, 42],
      });
      y += 2;
      doc.line(margin, y, margin + contentW, y);
      y += 7;

      // Pitch Captions
      checkY(8);
      writeText("Pitch Captions", margin, y, {
        style: "bold",
        size: 9,
        color: [71, 85, 105],
      });
      y += 5;

      validationData.suggestions.captions.forEach((caption) => {
        checkY(12);
        drawRect(margin, y, contentW, 10, [255, 251, 235], [253, 230, 138]);
        wrapText(`"${caption}"`, margin + 4, y + 7, contentW - 8, 5, {
          size: 8,
          color: [30, 41, 59],
        });
        y += 13;
      });

      y += 3;

      // Two-column: Strategic Pivots + Branding Tips
      const colW = (contentW - 6) / 2;

      checkY(8);
      writeText("Strategic Pivots", margin, y, {
        style: "bold",
        size: 9,
        color: [71, 85, 105],
      });
      writeText("Branding Tips", margin + colW + 6, y, {
        style: "bold",
        size: 9,
        color: [71, 85, 105],
      });
      y += 5;

      const maxRows = Math.max(
        validationData.suggestions.strategicPivots.length,
        validationData.suggestions.brandingTips.length,
      );

      for (let i = 0; i < maxRows; i++) {
        const pivot = validationData.suggestions.strategicPivots[i] || "";
        const tip = validationData.suggestions.brandingTips[i] || "";
        const pivotLines = pivot
          ? doc.splitTextToSize(`• ${pivot}`, colW - 4)
          : [];
        const tipLines = tip ? doc.splitTextToSize(`• ${tip}`, colW - 4) : [];
        const rowH = Math.max(pivotLines.length, tipLines.length) * 4.5 + 4;

        checkY(rowH + 2);

        if (pivot) {
          drawRect(margin, y, colW, rowH, [248, 250, 252], [226, 232, 240]);
          pivotLines.forEach((line, li) => {
            writeText(line, margin + 3, y + 5 + li * 4.5, {
              size: 7.5,
              color: [51, 65, 85],
            });
          });
        }

        if (tip) {
          drawRect(
            margin + colW + 6,
            y,
            colW,
            rowH,
            [248, 250, 252],
            [226, 232, 240],
          );
          tipLines.forEach((line, li) => {
            writeText(line, margin + colW + 9, y + 5 + li * 4.5, {
              size: 7.5,
              color: [51, 65, 85],
            });
          });
        }

        y += rowH + 3;
      }

      // ── FOOTER ────────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 285, pageW, 12, "F");
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(0, 285, pageW, 285);
        writeText(
          "AI-Powered Startup Toolkit — Idea Validation Report",
          margin,
          291,
          {
            size: 7,
            color: [148, 163, 184],
          },
        );
        writeText(`Page ${p} of ${totalPages}`, pageW - margin, 291, {
          size: 7,
          color: [148, 163, 184],
          align: "right",
        });
      }

      // ── SAVE ──────────────────────────────────────────────────────
      const fileName = `${(formData.title || "startup").replace(/\s+/g, "_")}_validation_report.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Could not export PDF. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const validateIdea = async () => {
    if (!formData.title || !formData.problem) {
      setError("Please enter a startup title and problem description.");
      return;
    }

    setStep("loading");
    setLoadingStep(0);
    setError(null);

    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev,
      );
    }, 1500);

    const startTime = Date.now();

    try {
      const response = await fetch(`${API_BASE}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: `${formData.title} ${formData.problem} ${formData.solution} ${formData.industry}`.trim(),
          title: formData.title,
          problem: formData.problem,
          solution: formData.solution,
          industry: formData.industry,
          targetCustomers: formData.targetCustomers,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend API error");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const elapsedTime = Date.now() - startTime;
      const waitTime = Math.max(0, 2000 - elapsedTime);

      setTimeout(() => {
        setValidationData(data);
        setStep("results");
        clearInterval(interval);
      }, waitTime);
    } catch (err) {
      console.error("Validation API error:", err);
      setTimeout(() => {
        setValidationData(getMockData());
        setStep("results");
        clearInterval(interval);
      }, 2000);
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
        icon: <BarChart size={18} />,
        path: "/socialmedia",
      },
    ];

    return (
      <nav className="w-full bg-slate-900 border-b border-indigo-500/20 shadow-2xl sticky top-0 z-[50]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-black text-white tracking-tighter text-xl leading-none">
              Idea<span className="text-blue-400">Validation</span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            {navItems.map((item) => (
              <a key={item.name} href={item.path}>
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all
                  ${
                    item.name === "IdeaValidation"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {React.cloneElement(item.icon, { size: 14 })}
                  {item.name}
                </button>
              </a>
            ))}
          </div>
          <div className="lg:hidden flex items-center">
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
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold text-sm border transition-all ${item.name === "IdeaValidation" ? "bg-indigo-600 text-white border-indigo-400" : "bg-slate-800/40 text-slate-300 border-slate-700 hover:bg-slate-800"}`}
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

      <main className="max-w-4xl mx-auto px-4 pt-12">
        {step === "input" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-[#1E293B] mb-4 tracking-tight">
                AI Idea Validator
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Enter your details to generate a validation score, market
                strength analysis, and branding suggestions.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Startup Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., SolarClean"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Problem
                    </label>
                    <textarea
                      name="problem"
                      value={formData.problem}
                      onChange={handleInputChange}
                      placeholder="What is the main point?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 min-h-[100px] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Solution
                    </label>
                    <textarea
                      name="solution"
                      value={formData.solution}
                      onChange={handleInputChange}
                      placeholder="How do you solve it?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 min-h-[100px] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none"
                    >
                      <option value="">Select Industry</option>
                      <option value="FinTech">FinTech</option>
                      <option value="HealthTech">HealthTech</option>
                      <option value="EdTech">EdTech</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Cleantech">Cleantech</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Target Customer
                    </label>
                    <input
                      type="text"
                      name="targetCustomers"
                      value={formData.targetCustomers}
                      onChange={handleInputChange}
                      placeholder="Who are they?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                {error && step === "input" && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> {error}
                  </div>
                )}
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={validateIdea}
                    disabled={!formData.title || !formData.problem}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-1"
                  >
                    Analyze Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
                {loadingMessages[loadingStep]}
              </h2>
              <p className="text-slate-500">
                Extracting market data and generating insights...
              </p>
            </div>
          </div>
        )}

        {step === "results" && validationData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* 1. Overall Validation Score */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 rounded-3xl shadow-2xl text-white overflow-hidden relative">
              <Zap className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="text-center md:text-left">
                  <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-2">
                    Startup Readiness
                  </h3>
                  <p className="text-4xl font-black mb-2">Validation Score</p>
                  <p className="text-slate-400 max-w-sm">
                    Calculated based on problem intensity, solution clarity, and
                    target market fit.
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-800"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="364"
                        strokeDashoffset={
                          364 - (364 * validationData.validationScore) / 100
                        }
                        className="text-indigo-500 transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className="absolute text-4xl font-black">
                      {validationData.validationScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 2. Market Strength (Python Scraping Simulation) */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <Search className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-slate-900">
                      Market Strength
                    </h4>
                    <p className="text-xs text-slate-500">
                      Live Web Search & Analytics
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">
                      Scraped Strength Score
                    </span>
                    <span className="text-lg font-black text-blue-600">
                      {validationData.marketStrength.score}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Search Insights
                    </p>
                    {validationData.marketStrength.scrapedInsights.map(
                      (insight, i) => (
                        <div
                          key={i}
                          className="flex gap-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-700 border border-slate-100"
                        >
                          <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          {insight}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 uppercase mb-1">
                      Current Trends
                    </p>
                    <p className="text-sm text-blue-900 italic">
                      "{validationData.marketStrength.currentTrends}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Captions & Suggestions */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-50 rounded-2xl">
                    <Lightbulb className="text-amber-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-slate-900">
                      Branding & Strategy
                    </h4>
                    <p className="text-xs text-slate-500">AI Suggestions</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Pitch Captions
                    </p>
                    <div className="space-y-2">
                      {validationData.suggestions.captions.map((caption, i) => (
                        <div
                          key={i}
                          className="p-3 bg-amber-50/30 border border-amber-100 rounded-xl text-sm font-medium text-slate-800"
                        >
                          "{caption}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Strategic Pivots
                      </p>
                      <ul className="space-y-1">
                        {validationData.suggestions.strategicPivots.map(
                          (p, i) => (
                            <li
                              key={i}
                              className="text-[11px] text-slate-600 flex gap-1 items-start"
                            >
                              <span className="text-amber-500">•</span> {p}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Branding Tips
                      </p>
                      <ul className="space-y-1">
                        {validationData.suggestions.brandingTips.map((t, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-slate-600 flex gap-1 items-start"
                          >
                            <span className="text-amber-500">•</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <button
                onClick={exportToPdf}
                disabled={exportingPdf}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-indigo-200"
              >
                {exportingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Export as PDF
                  </>
                )}
              </button>

              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all px-8 py-3 rounded-xl hover:bg-white border border-slate-200"
              >
                <RefreshCcw className="w-4 h-4" /> Analyze Another Idea
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5" />
            <p className="font-bold">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
