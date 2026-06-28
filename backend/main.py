# ── stdlib ────────────────────────────────────────────────────────────────────
import os
import logging
 
# ── third-party ───────────────────────────────────────────────────────────────
import uvicorn
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional

# ── local modules ─────────────────────────────────────────────────────────────
from scraper import validate_idea, build_validation_response
from finance_engine import analyze_financials
from pitch import (
    generate_pitch   as _ai_generate,
    health           as _pitch_health,
    GenerateRequest  as AIPitchRequest,
    GenerateResponse as AIPitchResponse,
    SlideModel,
    SYSTEM_PROMPT,
    build_user_prompt,
    extract_json,
    client           as anthropic_client,
)
from venture import (
    VentureAssessRequest,
    VentureAssessResponse,
    assess_venture,
)
from smm import (
    CampaignRequest,
    PostRequest,
    ContentCalendarRequest,
    AnalysisRequest,
    generate_campaign   as _smm_campaign,
    generate_post       as _smm_post,
    generate_calendar   as _smm_calendar,
    analyse_post        as _smm_analyse,
    generate_hashtags   as _smm_hashtags,
    competitor_gap      as _smm_gap,
)
from naming import (
    BrandRequest,
    BrandListResponse,
    FinalizeBrandRequest,
    FinalizeBrandResponse,
    generate_brands     as _naming_generate,
    finalize_brand      as _naming_finalize,
    health              as _naming_health,
)

# ── logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("main")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PitchGen AI – Full Stack Backend",
    description=(
        "Single server for Idea Validation, Finance Analysis, "
        "AI-powered Pitch Deck generation, Venture Readiness, "
        "Social Media Management, and Name & Slogan Generation."
    ),
    version="3.1.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."},
    )


# ═════════════════════════════════════════════════════════════════════════════
#  META
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/health", tags=["Meta"], summary="Liveness probe")
def health():
    return {
        "status": "ok",
        "modules": ["validate", "finance", "pitch-ai", "venture", "smm", "naming"],
    }


# ═════════════════════════════════════════════════════════════════════════════
#  IDEA VALIDATION  –  /validate
# ═════════════════════════════════════════════════════════════════════════════

class IdeaRequest(BaseModel):
    idea:            str
    title:           str = ""
    problem:         str = ""
    solution:        str = ""
    industry:        str = ""
    targetCustomers: str = ""


@app.post("/validate", tags=["Idea Validation"])
def validate(data: IdeaRequest):
    log.info("Validating idea: %r", data.idea[:80])
    raw = validate_idea(data.idea)
    if "error" in raw:
        return raw
    return build_validation_response(raw, data.model_dump())


# ═════════════════════════════════════════════════════════════════════════════
#  FINANCE  –  /finance/analyze
# ═════════════════════════════════════════════════════════════════════════════

class FinanceRequest(BaseModel):
    startupName:       str
    avgPrice:          float = 0
    expectedCustomers: int   = 0
    growthRate:        float = 15
    businessModel:     str   = "SaaS"
    industry:          str   = "Technology"
    marketSize:        str   = "Medium"
    operationalScale:  str   = "Local"
    stage:             str   = "Pre-revenue"


@app.post("/finance/analyze", tags=["Finance"])
def finance_analyze(data: FinanceRequest):
    log.info("Finance analysis for: %r", data.startupName)
    return analyze_financials(data.model_dump())

@app.post("/finance/market-trends")
async def market_trends(data: dict):
    prompt = f"""You are a startup market analyst. Analyze market trends for a {data.get('businessModel')} startup in the {data.get('industry')} industry targeting a {data.get('marketSize')} market at the {data.get('stage')} stage.

Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation. Use this exact structure:
{{
  "growthIndex": "<e.g. +14.2%>",
  "saturation": "<Low | Medium | High>",
  "cards": [
    {{"title": "<short title>", "icon": "<one of: Globe|Users|Target|TrendingUp|Zap|ShieldCheck>", "color": "<one of: blue|purple|amber|green|cyan|rose>", "insight": "<2-3 sentence specific insight>"}},
    {{"title": "<short title>", "icon": "<icon name>", "color": "<color>", "insight": "<insight>"}},
    {{"title": "<short title>", "icon": "<icon name>", "color": "<color>", "insight": "<insight>"}}
  ],
  "summary": "<One paragraph summarizing the overall market landscape, key risks, and opportunities for this specific startup profile.>"
}}"""

    from groq import Groq
    client = Groq()  # picks up GROQ_API_KEY from environment
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    import json
    raw = response.choices[0].message.content.strip()
    clean = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)

# ═════════════════════════════════════════════════════════════════════════════
#  AI PITCH DECK  –  /api/*
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/api/health", tags=["Pitch – AI"], summary="AI module liveness")
def api_health():
    return {"status": "ok", "model": "claude-sonnet-4-20250514"}


@app.post(
    "/api/generate",
    response_model=AIPitchResponse,
    tags=["Pitch – AI"],
    summary="Generate AI pitch deck slides",
)
async def api_generate(payload: AIPitchRequest, request: Request):
    return await _ai_generate(payload)


# ═════════════════════════════════════════════════════════════════════════════
#  VENTURE / VC READINESS  –  /api/venture/assess
# ═════════════════════════════════════════════════════════════════════════════

@app.post(
    "/api/venture/assess",
    response_model=VentureAssessResponse,
    tags=["Private Equity"],
    summary="Assess VC readiness and suggest suitable investor archetypes",
)
async def venture_assess(payload: VentureAssessRequest, request: Request):
    log.info("Venture assessment for: %r", payload.startupName)
    return await assess_venture(payload)


# ═════════════════════════════════════════════════════════════════════════════
#  SOCIAL MEDIA MANAGEMENT  –  /api/smm/*
# ═════════════════════════════════════════════════════════════════════════════

@app.post(
    "/api/smm/campaign/generate",
    tags=["Social Media Management"],
    summary="Generate a full multi-platform marketing campaign",
)
def smm_campaign(payload: CampaignRequest):
    log.info("SMM campaign generation: %r", payload.campaign_name)
    return _smm_campaign(payload)


@app.post(
    "/api/smm/post/generate",
    tags=["Social Media Management"],
    summary="Generate a single social media post",
)
def smm_post(payload: PostRequest):
    log.info("SMM post generation for platform: %r", payload.platform)
    return _smm_post(payload)


@app.post(
    "/api/smm/calendar/generate",
    tags=["Social Media Management"],
    summary="Generate a weekly content calendar",
)
def smm_calendar(payload: ContentCalendarRequest):
    log.info("SMM calendar generation for brand: %r", payload.brand_name)
    return _smm_calendar(payload)


@app.post(
    "/api/smm/post/analyse",
    tags=["Social Media Management"],
    summary="Analyse and score an existing social media post",
)
def smm_analyse(payload: AnalysisRequest):
    log.info("SMM post analysis for platform: %r", payload.platform)
    return _smm_analyse(payload)


@app.get(
    "/api/smm/hashtags/generate",
    tags=["Social Media Management"],
    summary="Generate optimised hashtags for a topic",
)
def smm_hashtags(
    topic:    str = Query(..., description="Topic to generate hashtags for"),
    platform: str = Query("Instagram", description="Target platform"),
    count:    int = Query(20, ge=5, le=50, description="Number of hashtags"),
):
    log.info("SMM hashtag generation: topic=%r platform=%r", topic, platform)
    return _smm_hashtags(topic=topic, platform=platform, count=count)


class CompetitorGapRequest(BaseModel):
    your_brand:  str = Field(..., json_schema_extra={"example": "Acme Corp"})
    competitor:  str = Field(..., json_schema_extra={"example": "RivalCo"})
    niche:       str = Field(..., json_schema_extra={"example": "SaaS / Productivity"})
    platforms:   List[str] = Field(["Instagram", "LinkedIn"])


@app.post(
    "/api/smm/competitor/gap-analysis",
    tags=["Social Media Management"],
    summary="Strategic social media gap analysis vs a competitor",
)
def smm_competitor_gap(payload: CompetitorGapRequest):
    log.info(
        "SMM gap analysis: %r vs %r", payload.your_brand, payload.competitor
    )
    return _smm_gap(
        your_brand=payload.your_brand,
        competitor=payload.competitor,
        niche=payload.niche,
        platforms=payload.platforms,
    )


# ═════════════════════════════════════════════════════════════════════════════
#  NAME & SLOGAN GENERATOR  –  /api/naming/*
# ═════════════════════════════════════════════════════════════════════════════

@app.get(
    "/api/naming/health",
    tags=["Name & Slogan"],
    summary="Naming module liveness (Groq)",
)
def naming_health():
    return _naming_health()


@app.post(
    "/api/naming/generate",
    response_model=BrandListResponse,
    tags=["Name & Slogan"],
    summary="Generate 10 brand name & slogan candidates",
)
async def naming_generate(payload: BrandRequest):
    log.info(
        "Naming generation: industry=%r tone=%r style=%r",
        payload.industry, payload.tone, payload.style,
    )
    return await _naming_generate(payload)


@app.post(
    "/api/naming/finalize",
    response_model=FinalizeBrandResponse,
    tags=["Name & Slogan"],
    summary="Build out full brand identity for a chosen name",
)
async def naming_finalize(payload: FinalizeBrandRequest):
    log.info("Naming finalize: %r", payload.brand.name)
    return await _naming_finalize(payload)


# ═════════════════════════════════════════════════════════════════════════════
#  Entry point
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )