const rawApiBase = import.meta.env.VITE_API_BASE_URL || "https://ai-powered-startup-toolkit-1hui.onrender.com";

export const API_BASE = rawApiBase.replace(/\/$/, "");
