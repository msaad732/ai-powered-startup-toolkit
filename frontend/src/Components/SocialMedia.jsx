import React, { useState } from "react";
import {
  LayoutDashboard,
  Globe,
  Sparkles,
  Calendar,
  BarChart3,
  MessageSquare,
  Share2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Youtube,
  Plus,
  Menu,
  X,
  RefreshCcw,
  CheckCircle2,
  TrendingUp,
  Download,
  Zap,
  Target,
  ShieldAlert,
  Edit3,
  Eye,
  MousePointer2,
  PieChart,
  Megaphone,
  Palette,
  BarChart,
  Scale,
  BrainCircuit,
} from "lucide-react";
import { API_BASE } from "../config/api";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// All AI calls go through your FastAPI backend — Groq key stays server-side.
// ─────────────────────────────────────────────────────────────────────────────

// Lazy-loads a <script> tag once and caches the promise so repeated exports
// don't re-fetch the library.
const loadScript = (src) => {
  if (window.__loadedScripts && window.__loadedScripts[src]) {
    return window.__loadedScripts[src];
  }
  window.__loadedScripts = window.__loadedScripts || {};
  const p = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  window.__loadedScripts[src] = p;
  return p;
};

const App = () => {
  const [step, setStep] = useState("input");
  const [activeTab, setActiveTab] = useState("Campaigns");
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    campaignName: "",
    goal: "Awareness",
    platforms: ["Instagram", "Facebook"],
    tone: "Professional",
    budget: "1000",
    audience: "Young Professionals, 25-35",
  });

  const loadingMessages = [
    "Analyzing target audience demographics...",
    "Synthesizing high-converting ad copies...",
    "Developing visual style guidelines...",
    "Calculating estimated reach and CTR...",
    "Structuring multi-platform campaign roadmap...",
    "Finalizing effectiveness scoring...",
  ];

  // ── API helper ───────────────────────────────────────────────────────────
  const apiPost = async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.detail || `Server error ${res.status}`);
    }
    return data;
  };

  // ── Campaign generator ───────────────────────────────────────────────────
  const generateCampaign = async () => {
    setStep("loading");
    setLoadingStep(0);
    setError(null);

    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev,
      );
    }, 1500);

    try {
      // Maps camelCase form fields → snake_case expected by CampaignRequest
      const result = await apiPost("/api/smm/campaign/generate", {
        campaign_name: campaignForm.campaignName,
        goal: campaignForm.goal,
        platforms: campaignForm.platforms,
        tone: campaignForm.tone,
        budget: parseFloat(campaignForm.budget),
        audience: campaignForm.audience,
      });

      // Backend returns { success: true, campaign: { ... } }
      setCampaignData(result.campaign);
      setStep("results");
    } catch (err) {
      console.error("Campaign generation failed:", err);
      setError(
        err.message || "Failed to generate campaign. Is the backend running?",
      );
      setStep("input");
    } finally {
      clearInterval(interval);
    }
  };

  // ── Export PDF ───────────────────────────────────────────────────────────
  // Renders the report into an off-screen container, rasterizes it with
  // html2canvas, and saves it as a real .pdf file via jsPDF — triggers a
  // normal browser download, no new tab and no print dialog.
  const exportCampaignPDF = async () => {
    if (!campaignData || exportingPdf) return;
    setExportingPdf(true);

    const escapeHtml = (str) =>
      String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const scheduleHtml = (campaignData.schedule || [])
      .map(
        (day) => `
          <div class="timeline-item">
            <div class="timeline-meta">${escapeHtml(day.day)} &middot; ${escapeHtml(day.time)}</div>
            <div class="timeline-content">${escapeHtml(day.content)}</div>
          </div>`,
      )
      .join("");

    const adsHtml = (campaignData.adCopies || [])
      .map(
        (ad) => `
          <div class="ad-card">
            <div class="ad-platform">${escapeHtml(ad.platform)} Ad Creative</div>
            <div class="ad-block ad-headline">
              <div class="ad-label">Headline</div>
              <div class="ad-value">${escapeHtml(ad.headline)}</div>
            </div>
            <div class="ad-block">
              <div class="ad-label">Primary Text</div>
              <div class="ad-value">${escapeHtml(ad.body)}</div>
            </div>
            ${
              ad.hashtags
                ? `<div class="ad-hashtags">${escapeHtml(ad.hashtags)}</div>`
                : ""
            }
            <div class="ad-cta">CTA: ${escapeHtml(ad.cta)}</div>
          </div>`,
      )
      .join("");

    const colorsHtml = (campaignData.visualGuide?.colors || [])
      .map(
        (c) => `
          <div class="color-chip">
            <div class="color-swatch" style="background:${escapeHtml(c)};"></div>
            <span>${escapeHtml(c)}</span>
          </div>`,
      )
      .join("");

    const recsHtml = (campaignData.recommendations || [])
      .map(
        (rec, i) => `
          <div class="rec-row">
            <span class="rec-num">${i + 1}</span>
            <span>${escapeHtml(rec)}</span>
          </div>`,
      )
      .join("");

    const reportInnerHtml = `
      <div class="header-row">
        <div>
          <h1>${escapeHtml(campaignForm.campaignName || "Untitled Campaign")}</h1>
          <div class="meta">Campaign Effectiveness Report &middot; Generated ${escapeHtml(new Date().toLocaleDateString())}</div>
          <div class="tags">
            <span class="tag">Goal: ${escapeHtml(campaignForm.goal)}</span>
            <span class="tag">Budget: $${escapeHtml(campaignForm.budget)}</span>
            <span class="tag">Tone: ${escapeHtml(campaignForm.tone)}</span>
          </div>
        </div>
        <div>
          <div class="score">${escapeHtml(campaignData.score)}<span style="font-size:14px;">/100</span></div>
          <div class="score-label">Effectiveness Score</div>
        </div>
      </div>

      ${campaignData.summary ? `<p class="summary">${escapeHtml(campaignData.summary)}</p>` : ""}

      <section>
        <h2>Target Segmentation</h2>
        <div class="kpi-grid">
          <div class="kpi">
            <div class="kpi-label">Primary Persona</div>
            <div class="kpi-value">${escapeHtml(campaignForm.audience)}</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Tone Analysis</div>
            <div class="kpi-value">${escapeHtml(campaignForm.tone)} &amp; Persuasive</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Active Platforms</div>
            <div class="kpi-value">${escapeHtml(campaignForm.platforms.join(", "))}</div>
          </div>
        </div>
      </section>

      ${
        campaignData.kpis
          ? `<section>
              <h2>Predicted KPIs</h2>
              <div class="kpi-grid">
                <div class="kpi">
                  <div class="kpi-label">Est. Reach</div>
                  <div class="kpi-value">${escapeHtml(campaignData.kpis.reach || "—")}</div>
                </div>
                <div class="kpi">
                  <div class="kpi-label">Predicted CTR</div>
                  <div class="kpi-value">${escapeHtml(campaignData.kpis.ctr || "—")}</div>
                </div>
                <div class="kpi">
                  <div class="kpi-label">Conversions</div>
                  <div class="kpi-value">${escapeHtml(campaignData.kpis.conversions || "—")}</div>
                </div>
              </div>
            </section>`
          : ""
      }

      ${
        scheduleHtml
          ? `<section>
              <h2>Campaign Timeline</h2>
              ${scheduleHtml}
            </section>`
          : ""
      }

      ${
        adsHtml
          ? `<section>
              <h2>Content &amp; Ad Copies</h2>
              ${adsHtml}
            </section>`
          : ""
      }

      ${
        campaignData.visualGuide
          ? `<section>
              <h2>Visual Identity Guide</h2>
              <p style="color:#64748b; margin-bottom:10px;">${escapeHtml(campaignData.visualGuide.concept || "")}</p>
              <div class="visual-cols">
                <div>
                  <div class="ad-label" style="margin-bottom:8px;">Color Palette</div>
                  <div>${colorsHtml}</div>
                </div>
                <div>
                  <div class="ad-label" style="margin-bottom:8px;">Aesthetic Style</div>
                  <div style="font-weight:bold; color:#4f46e5;">${escapeHtml(campaignData.visualGuide.style || "")}</div>
                </div>
              </div>
            </section>`
          : ""
      }

      ${
        recsHtml
          ? `<section>
              <h2>Optimization Checklist</h2>
              ${recsHtml}
            </section>`
          : ""
      }

      <footer>Confidential &middot; ${escapeHtml(campaignForm.campaignName || "Campaign")}</footer>
    `;

    // Off-screen container, styled the same way as before, fixed to a
    // letter-width pixel size so html2canvas produces a clean raster.
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "-99999px";
    container.style.width = "816px"; // 8.5in @ 96dpi
    container.style.background = "#ffffff";
    container.innerHTML = `
      <style>
        #pdf-report * { box-sizing: border-box; }
        #pdf-report {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          color: #1e293b;
          padding: 32px 40px;
          font-size: 12px;
          background: #ffffff;
        }
        #pdf-report h1 { font-size: 22px; margin: 0 0 4px 0; }
        #pdf-report .meta { color: #64748b; font-size: 11px; margin-bottom: 18px; }
        #pdf-report .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #1e293b;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }
        #pdf-report .tags { margin-top: 8px; }
        #pdf-report .tag {
          display: inline-block;
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 999px;
          margin-right: 6px;
        }
        #pdf-report .score { font-size: 28px; font-weight: 900; text-align: right; }
        #pdf-report .score-label {
          font-size: 9px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: right;
        }
        #pdf-report .summary { font-style: italic; color: #475569; margin: 10px 0 20px 0; }
        #pdf-report section { margin-bottom: 22px; }
        #pdf-report h2 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          margin: 0 0 10px 0;
        }
        #pdf-report .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        #pdf-report .kpi { background: #f8fafc; border-radius: 8px; padding: 10px 12px; text-align: center; }
        #pdf-report .kpi-label {
          font-size: 9px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        #pdf-report .kpi-value { font-weight: bold; font-size: 14px; }
        #pdf-report .timeline-item { border-left: 2px solid #e2e8f0; padding-left: 12px; margin-bottom: 12px; }
        #pdf-report .timeline-meta {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          color: #4f46e5;
          margin-bottom: 3px;
        }
        #pdf-report .timeline-content { background: #f8fafc; border-radius: 6px; padding: 8px 10px; font-size: 11px; }
        #pdf-report .ad-card { background: #f8fafc; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
        #pdf-report .ad-platform { font-weight: bold; margin-bottom: 8px; }
        #pdf-report .ad-block { margin-bottom: 8px; }
        #pdf-report .ad-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          margin-bottom: 2px;
        }
        #pdf-report .ad-value { font-size: 11px; }
        #pdf-report .ad-headline .ad-value { font-weight: bold; }
        #pdf-report .ad-hashtags { font-size: 10px; color: #2563eb; margin-bottom: 8px; }
        #pdf-report .ad-cta {
          display: inline-block;
          background: #1e293b;
          color: white;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 6px;
        }
        #pdf-report .visual-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        #pdf-report .color-chip {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          margin-right: 14px;
          font-size: 9px;
          color: #64748b;
        }
        #pdf-report .color-swatch { width: 32px; height: 32px; border-radius: 8px; margin-bottom: 4px; border: 1px solid #e2e8f0; }
        #pdf-report .rec-row { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 6px; font-size: 11px; }
        #pdf-report .rec-num {
          background: #4f46e5;
          color: white;
          font-weight: bold;
          font-size: 9px;
          width: 16px;
          height: 16px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        #pdf-report footer {
          border-top: 1px solid #e2e8f0;
          margin-top: 24px;
          padding-top: 12px;
          font-size: 9px;
          color: #94a3b8;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      </style>
      <div id="pdf-report">${reportInnerHtml}</div>
    `;
    document.body.appendChild(container);

    try {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
      );

      const target = container.querySelector("#pdf-report");
      const canvas = await window.html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${(campaignForm.campaignName || "campaign").replace(/\s+/g, "_")}_Report.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
      setError("Could not generate PDF. Please try again.");
    } finally {
      document.body.removeChild(container);
      setExportingPdf(false);
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────
  const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navItems = [
      { name: "Home", icon: <LayoutDashboard size={14} />, path: "/" },
      {
        name: "IdeaValidation",
        icon: <BrainCircuit size={14} />,
        path: "/ideavalidation",
      },
      {
        name: "Finance&Budget",
        icon: <BarChart3 size={14} />,
        path: "/finance",
      },
      { name: "Pitch Deck", icon: <Globe size={14} />, path: "/pitch-ppt" },
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
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-indigo-500/20 px-4 md:px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <BarChart size={22} />
            </div>
            <span className="font-black text-white tracking-tighter text-xl leading-none">
              SM<span className="text-blue-400">M</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            {navItems.map((item) => (
              <a key={item.name} href={item.path} className="contents">
                <button
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all
                  ${
                    item.name === "Social Media Management"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              </a>
            ))}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            {navItems.map((item) => (
              <a key={item.name} href={item.path} className="contents">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-xl transition-all
                  ${
                    item.name === "Social Media Management"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <span className="opacity-70">{item.icon}</span>
                  {item.name}
                </button>
              </a>
            ))}
          </div>
        </div>
      </nav>
    );
  };

  // ── Platform icon helper ─────────────────────────────────────────────────
  const PlatformIcon = ({ platform }) => {
    const map = {
      Instagram,
      Facebook,
      LinkedIn: Linkedin,
      X: Twitter,
      YouTube: Youtube,
      TikTok: Share2,
    };
    const Icon = map[platform] || Share2;
    return <Icon className="w-5 h-5" />;
  };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navigation />

      <main className="max-w-6xl mx-auto px-6 pt-2 pb-20">
        {/* ── Error Banner ──────────────────────────────────────────────── */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-red-700 uppercase tracking-wide mb-1">
                Error
              </p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── INPUT STEP ────────────────────────────────────────────────── */}
        {step === "input" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-3xl mb-12 pt-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100">
                <Sparkles className="w-3 h-3" /> Next-Gen Marketing Engine
              </div>
              <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                AI-Powered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-400">
                  Social Media & Campaign Builder
                </span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                Generate engaging posts, ad copies, and campaign strategies
                optimized for maximum reach — powered by Groq via your backend.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                  {/* Row 1: Name + Goal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                        placeholder="e.g., Summer Growth"
                        value={campaignForm.campaignName}
                        onChange={(e) =>
                          setCampaignForm({
                            ...campaignForm,
                            campaignName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Primary Goal
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                        value={campaignForm.goal}
                        onChange={(e) =>
                          setCampaignForm({
                            ...campaignForm,
                            goal: e.target.value,
                          })
                        }
                      >
                        <option>Awareness</option>
                        <option>Engagement</option>
                        <option>Leads</option>
                        <option>Conversions</option>
                      </select>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Select Channels
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        {
                          id: "Instagram",
                          icon: <Instagram className="w-4 h-4" />,
                        },
                        {
                          id: "Facebook",
                          icon: <Facebook className="w-4 h-4" />,
                        },
                        {
                          id: "LinkedIn",
                          icon: <Linkedin className="w-4 h-4" />,
                        },
                        { id: "TikTok", icon: <Share2 className="w-4 h-4" /> },
                        {
                          id: "YouTube",
                          icon: <Youtube className="w-4 h-4" />,
                        },
                        { id: "X", icon: <Twitter className="w-4 h-4" /> },
                      ].map((plat) => (
                        <button
                          key={plat.id}
                          onClick={() => {
                            const exists = campaignForm.platforms.includes(
                              plat.id,
                            );
                            setCampaignForm({
                              ...campaignForm,
                              platforms: exists
                                ? campaignForm.platforms.filter(
                                    (p) => p !== plat.id,
                                  )
                                : [...campaignForm.platforms, plat.id],
                            });
                          }}
                          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-bold text-xs transition-all
                            ${
                              campaignForm.platforms.includes(plat.id)
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                        >
                          {plat.icon}
                          {plat.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Tone + Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Content Tone
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                        value={campaignForm.tone}
                        onChange={(e) =>
                          setCampaignForm({
                            ...campaignForm,
                            tone: e.target.value,
                          })
                        }
                      >
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Humorous</option>
                        <option>Inspirational</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Ad Budget ($)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                        value={campaignForm.budget}
                        onChange={(e) =>
                          setCampaignForm({
                            ...campaignForm,
                            budget: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Audience */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:border-indigo-500 transition-all"
                      placeholder="e.g., Tech Founders, 30-45"
                      value={campaignForm.audience}
                      onChange={(e) =>
                        setCampaignForm({
                          ...campaignForm,
                          audience: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    onClick={generateCampaign}
                    disabled={
                      !campaignForm.campaignName ||
                      campaignForm.platforms.length === 0
                    }
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 active:scale-95 group"
                  >
                    Generate Multi-Platform Campaign
                    <Zap className="w-5 h-5 group-hover:animate-pulse" />
                  </button>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Target className="w-24 h-24" />
                  </div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-indigo-400 mb-6">
                    Core Capabilities
                  </h4>
                  <ul className="space-y-5">
                    {[
                      {
                        t: "Marketing Planning",
                        d: "Strategic segmentation & targeting logic.",
                        i: <PieChart className="w-5 h-5" />,
                      },
                      {
                        t: "NLP Content Gen",
                        d: "AI-driven ad copies & persuasive CTAs.",
                        i: <MessageSquare className="w-5 h-5" />,
                      },
                      {
                        t: "Quantified Score",
                        d: "Evidence-based decision support system.",
                        i: <BarChart3 className="w-5 h-5" />,
                      },
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-4 group">
                        <div className="shrink-0 p-2 bg-white/5 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          {item.i}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white leading-none mb-1">
                            {item.t}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            {item.d}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Architecture
                    </span>
                  </div>
                  <p className="text-xs font-bold text-blue-800 leading-relaxed">
                    Frontend → FastAPI backend → Groq AI. Your API key stays{" "}
                    <strong>server-side only</strong>.
                  </p>
                  <p className="text-[10px] text-blue-600 font-bold">
                    Backend:{" "}
                    <code className="bg-blue-100 px-1 rounded">{API_BASE}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING STEP ──────────────────────────────────────────────── */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-40 space-y-10 text-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <Megaphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900">
                {loadingMessages[loadingStep]}
              </h2>
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS STEP ──────────────────────────────────────────────── */}
        {step === "results" && campaignData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pt-6">
            {/* Score Header */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-8">
                <div className="relative flex items-center justify-center">
                  <svg
                    className="w-32 h-32 transform -rotate-90"
                    viewBox="0 0 128 128"
                  >
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={
                        364.4 - (364.4 * campaignData.score) / 100
                      }
                      className="text-indigo-600 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">
                      {campaignData.score}
                    </span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Score
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Effectiveness Report
                  </h3>
                  <p className="text-3xl font-black text-slate-900 mb-3">
                    {campaignForm.campaignName}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg">
                      Goal: {campaignForm.goal}
                    </span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg">
                      Budget: ${campaignForm.budget}
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg">
                      Groq ⚡
                    </span>
                  </div>
                  {campaignData.summary && (
                    <p className="mt-3 text-sm text-slate-500 font-medium max-w-md">
                      {campaignData.summary}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={exportCampaignPDF}
                  disabled={exportingPdf}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  {exportingPdf ? "Exporting…" : "Export PDF"}
                </button>
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100">
                  Launch Campaign
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
              {["Campaigns", "Content & Ads", "Visual Guide", "Analytics"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap
                    ${activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>
                    )}
                  </button>
                ),
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* CAMPAIGNS TAB */}
                {activeTab === "Campaigns" && (
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-black flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-indigo-600" />{" "}
                        Campaign Timeline
                      </h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        30-Day Execution
                      </span>
                    </div>
                    <div className="space-y-6">
                      {(campaignData.schedule || []).map((day, idx) => (
                        <div
                          key={idx}
                          className="relative pl-8 border-l-2 border-slate-100 pb-8 last:pb-0 group"
                        >
                          <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full group-hover:bg-indigo-600 transition-colors"></div>
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                              {day.day} • {day.time}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Automated Post
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                            {day.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTENT & ADS TAB */}
                {activeTab === "Content & Ads" && (
                  <div className="space-y-6">
                    {(campaignData.adCopies || []).map((ad, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                              <PlatformIcon platform={ad.platform} />
                            </div>
                            <h5 className="font-black text-lg">
                              {ad.platform} Ad Creative
                            </h5>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-indigo-600">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-indigo-600">
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-600">
                            <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">
                              Headline
                            </p>
                            <p className="text-sm font-black text-slate-800">
                              {ad.headline}
                            </p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                              Primary Text
                            </p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                              {ad.body}
                            </p>
                          </div>
                          {ad.hashtags && (
                            <div className="flex flex-wrap gap-2 py-2">
                              {ad.hashtags
                                .split(/\s+/)
                                .filter(Boolean)
                                .map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                          )}
                          <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                            CTA: {ad.cta}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* VISUAL GUIDE TAB */}
                {activeTab === "Visual Guide" && campaignData.visualGuide && (
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Palette className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h4 className="text-2xl font-black mb-2">
                      Campaign Visual Identity
                    </h4>
                    <p className="text-slate-500 text-sm mb-10 max-w-md mx-auto">
                      {campaignData.visualGuide.concept}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                          Color Palette
                        </h5>
                        <div className="flex flex-wrap gap-4">
                          {(campaignData.visualGuide.colors || []).map(
                            (c, i) => (
                              <div
                                key={i}
                                className="flex flex-col items-center gap-2"
                              >
                                <div
                                  className="w-12 h-12 rounded-xl shadow-sm border border-white"
                                  style={{ backgroundColor: c }}
                                ></div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                  {c}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                          Aesthetic Style
                        </h5>
                        <p className="text-sm font-black text-indigo-600">
                          {campaignData.visualGuide.style}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === "Analytics" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Est. Reach",
                          val: campaignData.kpis?.reach,
                          icon: <Eye className="w-5 h-5" />,
                          color: "blue",
                        },
                        {
                          label: "Predicted CTR",
                          val: campaignData.kpis?.ctr,
                          icon: <MousePointer2 className="w-5 h-5" />,
                          color: "indigo",
                        },
                        {
                          label: "Conversions",
                          val: campaignData.kpis?.conversions,
                          icon: <Target className="w-5 h-5" />,
                          color: "green",
                        },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center"
                        >
                          <div
                            className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center
                            ${stat.color === "blue" ? "bg-blue-50 text-blue-600" : stat.color === "green" ? "bg-green-50 text-green-600" : "bg-indigo-50 text-indigo-600"}`}
                          >
                            {stat.icon}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                            {stat.label}
                          </p>
                          <p className="text-xl font-black text-slate-900">
                            {stat.val || "—"}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <h4 className="text-lg font-black mb-6">
                        Optimization Checklist
                      </h4>
                      <div className="space-y-3">
                        {(campaignData.recommendations || []).map((rec, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all"
                          >
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-xs font-bold text-slate-700">
                              {rec}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">
                    System Health
                  </h4>
                  <div className="space-y-6">
                    {[
                      {
                        label: "Brand Consistency",
                        pct: 94,
                        color: "bg-indigo-500",
                      },
                      {
                        label: "Tone Alignment",
                        pct: 88,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Platform Fit",
                        pct: Math.min(100, campaignData.score),
                        color: "bg-purple-500",
                      },
                    ].map((bar, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                          <span>{bar.label}</span>
                          <span>{bar.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bar.color}`}
                            style={{ width: `${bar.pct}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                      <p className="text-[10px] font-medium text-slate-300 italic">
                        Strategy complies with all target platform policies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                    Target Segmentation
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">
                        Primary Persona
                      </p>
                      <p className="text-xs font-bold text-indigo-900">
                        {campaignForm.audience}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                        Tone Analysis
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {campaignForm.tone} & Persuasive
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                        Active Platforms
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {campaignForm.platforms.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 group transition-all text-center">
                  <Plus className="w-8 h-8 text-slate-300 group-hover:text-indigo-600 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-indigo-600">
                    Add Campaign Module
                  </p>
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-10">
              <button
                onClick={() => {
                  setStep("input");
                  setCampaignData(null);
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
              >
                <RefreshCcw className="w-4 h-4" /> Reset Campaign Builder
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md py-3 text-center text-[10px] text-slate-400 font-black tracking-[0.2em] border-t border-slate-100 z-40">
        SMM CAMPAIGN MODULE • GROQ AI STRATEGIST
      </footer>
    </div>
  );
};

export default App;
