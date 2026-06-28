# ── stdlib
import os
import json
import logging
import re
from typing import Any, Dict, List, Optional

# ── third-party
from fastapi import HTTPException
from pydantic import BaseModel, Field
from groq import Groq, AuthenticationError, RateLimitError, APIStatusError

# ── logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("venture")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


class VentureAssessRequest(BaseModel):
    startupName: str = Field(..., min_length=1)
    industry: str = "SaaS"
    stage: str = "Seed"
    bizModel: str = "B2B SaaS"
    months: str = ""
    teamSize: str = ""
    teamBg: str = "Mixed technical + business"
    productStage: str = "Live product — early traction"
    geo: str = "National"
    arr: str = ""
    momGrowth: str = ""
    burnRate: str = ""
    runway: str = ""
    tam: str = ""
    customers: str = ""
    priorFunding: str = ""
    targetRaise: str = ""
    dilution: int = Field(ge=0, le=100, default=15)


class RiskScores(BaseModel):
    teamRisk: int = Field(ge=1, le=10)
    marketRisk: int = Field(ge=1, le=10)
    productRisk: int = Field(ge=1, le=10)
    financialRisk: int = Field(ge=1, le=10)


class VcArchetype(BaseModel):
    type: str
    matchPct: int = Field(ge=0, le=100)
    why: str


class VentureAssessResponse(BaseModel):
    vcScore: int = Field(ge=0, le=100)
    vcVerdict: str
    oneLiner: str
    impliedValuation: str
    stageFit: str
    strengths: List[str]
    redFlags: List[str]
    riskScores: RiskScores
    vcArchetypes: List[VcArchetype]
    termSignals: List[str]
    exitPaths: List[str]
    roadmap: List[str]


SYSTEM_PROMPT = (
    "You are a Partner-level VC analyst at a top-tier venture capital firm. "
    "Analyze this startup for VC investment readiness. "
    "Return ONLY a valid JSON object (no markdown, no backticks) with exactly these fields:\n"
    "{\n"
    '  "vcScore": number 0-100,\n'
    '  "vcVerdict": "Hot Deal" | "Fundable" | "Too Early" | "Not VC-Suitable",\n'
    '  "oneLiner": "1-sentence investment thesis",\n'
    '  "impliedValuation": "e.g. $8M–$12M pre-money",\n'
    '  "stageFit": "which stage this company truly maps to",\n'
    '  "strengths": ["string","string","string","string"],\n'
    '  "redFlags": ["string","string","string"],\n'
    '  "riskScores": { "teamRisk": 1-10, "marketRisk": 1-10, "productRisk": 1-10, "financialRisk": 1-10 },\n'
    '  "vcArchetypes": [\n'
    '    {"type": "VC archetype name", "matchPct": number, "why": "1 sentence"},\n'
    '    {"type": "string", "matchPct": number, "why": "string"},\n'
    '    {"type": "string", "matchPct": number, "why": "string"}\n'
    '  ],\n'
    '  "termSignals": ["likely term sheet condition","string","string"],\n'
    '  "exitPaths": ["string","string","string"],\n'
    '  "roadmap": ["action step 1","step 2","step 3","step 4","step 5"]\n'
    "}\n"
    "Make sure JSON conforms exactly to this schema."
)

FALLBACK_RESPONSE = {
    "vcScore": 58,
    "vcVerdict": "Fundable",
    "oneLiner": "A traction-backed product in a well-defined market with a credible path to scale and durable unit economics.",
    "impliedValuation": "$6M–$10M pre-money",
    "stageFit": "Seed (early traction / repeatable growth signals)",
    "strengths": [
        "Clear value proposition with early customer pull",
        "Leadership team mixes technical execution with market understanding",
        "Market appears large enough for venture-scale outcomes",
        "Financial signals suggest controllable burn relative to growth",
    ],
    "redFlags": [
        "Need stronger proof of retention and durable monetization",
        "Revenue composition and growth drivers must be clarified",
        "Governance and reporting readiness may lag for institutional investors",
    ],
    "riskScores": {"teamRisk": 4, "marketRisk": 5, "productRisk": 4, "financialRisk": 6},
    "vcArchetypes": [
        {"type": "Seed-stage B2B SaaS VCs", "matchPct": 70, "why": "Strong fit for repeatable GTM and early ARR trajectory."},
        {"type": "Growth-at-Seed / Series A transition funds", "matchPct": 62, "why": "Likely to support scale-up once KPI baselines are proven."},
        {"type": "Domain specialists", "matchPct": 55, "why": "Market narrative and traction can translate well with niche expertise."},
    ],
    "termSignals": [
        "Prefer board/investor reporting cadence aligned with KPI milestones",
        "Downside protection via liquidation preference and/or pro-rata rights",
        "Milestone-based follow-on tied to retention + expansion metrics",
    ],
    "exitPaths": [
        "Strategic acquisition by category leaders",
        "Primary/secondary sale to growth investors",
        "Roll-up or platform expansion leading to IPO",
    ],
    "roadmap": [
        "Define KPI baseline: retention, CAC/LTV, expansion, and payback period",
        "Strengthen go-to-market: target ICP, channel mix, and sales motion",
        "Improve financial rigor: cohort reporting, unit economics, and cash conversion",
        "Harden product: roadmap tied to measurable outcomes and reliability",
        "Prepare for diligence: data room + clear use of funds and milestones",
    ],
}


def _extract_json(raw: str) -> Dict[str, Any]:
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found")
    return json.loads(cleaned[start : end + 1])


def build_user_prompt(data: VentureAssessRequest) -> str:
    return (
        f"Startup: {data.startupName}\n"
        f"Industry: {data.industry}\n"
        f"Stage sought: {data.stage}\n"
        f"Business model: {data.bizModel}\n"
        f"Months operating: {data.months}\n"
        f"Team size: {data.teamSize} people\n"
        f"Team background: {data.teamBg}\n"
        f"Product stage: {data.productStage}\n"
        f"Geography: {data.geo}\n\n"
        "Financials:\n"
        f"- ARR: {data.arr}\n"
        f"- MoM growth: {data.momGrowth}%\n"
        f"- Monthly burn: {data.burnRate}\n"
        f"- Runway: {data.runway} months\n"
        f"- TAM: {data.tam}\n"
        f"- Paying customers: {data.customers}\n"
        f"- Prior funding: {data.priorFunding}\n"
        f"- Target raise: {data.targetRaise}\n"
        f"- Equity offered: {data.dilution}%\n"
    )


async def _call_groq(prompt: str) -> Optional[Dict[str, Any]]:
    if not GROQ_API_KEY or not client:
        log.warning("GROQ_API_KEY not set. Returning deterministic fallback VC analysis.")
        return FALLBACK_RESPONSE

    try:
        message = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1500,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": prompt},
            ],
        )
        raw_text = message.choices[0].message.content
        log.debug("Raw Groq output: %s", raw_text[:200])
        return _extract_json(raw_text)

    except AuthenticationError:
        log.error("Invalid Groq API key.")
        raise HTTPException(status_code=401, detail="Invalid Groq API key.")
    except RateLimitError:
        log.warning("Groq rate limit hit.")
        raise HTTPException(status_code=429, detail="Rate limit reached. Please try again shortly.")
    except APIStatusError as exc:
        log.error("Groq API error: %s", exc)
        raise HTTPException(status_code=502, detail=f"Upstream API error: {exc.message}")
    except (json.JSONDecodeError, ValueError) as exc:
        log.error("JSON parse failed: %s", exc)
        raise HTTPException(status_code=500, detail="Model returned malformed JSON. Please try again.")


async def assess_venture(payload: VentureAssessRequest) -> VentureAssessResponse:
    prompt = build_user_prompt(payload)
    result = await _call_groq(prompt)
    if not result:
        raise HTTPException(status_code=502, detail="Venture assessment failed")

    try:
        return VentureAssessResponse.model_validate(result)
    except Exception as e:
        log.exception("Validation error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="LLM returned unexpected data shape for venture assessment.",
        )