

import os
import json
import re
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq

load_dotenv()

# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SMM Backend",
    description="Social Media Management API powered by Groq",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Groq Client ──────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

client = Groq(api_key=GROQ_API_KEY)


# ─── Request / Response Schemas ───────────────────────────────────────────────

class CampaignRequest(BaseModel):
    campaign_name: str = Field(..., example="Summer Growth 2025")
    goal:          str = Field("Awareness", example="Awareness")
    platforms:     list[str] = Field(["Instagram", "Facebook"])
    tone:          str = Field("Professional", example="Professional")
    budget:        float = Field(1000.0, example=1000.0)
    audience:      str = Field("Young Professionals, 25-35")


class PostRequest(BaseModel):
    platform:    str = Field(..., example="Instagram")
    topic:       str = Field(..., example="New product launch")
    tone:        str = Field("Professional")
    hashtags:    bool = Field(True)
    max_chars:   Optional[int] = Field(None, example=280)


class ContentCalendarRequest(BaseModel):
    brand_name:  str = Field(..., example="Acme Corp")
    niche:       str = Field(..., example="SaaS / Productivity")
    platforms:   list[str] = Field(["Instagram", "LinkedIn"])
    weeks:       int = Field(2, ge=1, le=8)
    tone:        str = Field("Professional")


class AnalysisRequest(BaseModel):
    content: str = Field(..., example="Our new feature is now live! 🚀 #startup #SaaS")
    platform: str = Field("Instagram")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _groq_chat(system: str, user: str, temperature: float = 0.7) -> str:
    """Send a chat request to Groq and return the assistant's text."""
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set in environment.")

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
    )
    return completion.choices[0].message.content


def _parse_json(raw: str) -> dict | list:
    """Strip markdown fences and parse JSON."""
    clean = re.sub(r"```(?:json)?|```", "", raw, flags=re.IGNORECASE).strip()
    try:
        return json.loads(clean)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Model returned invalid JSON: {e}")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "model": GROQ_MODEL}


@app.get("/health")
def health():
    return {"status": "healthy", "groq_key_set": bool(GROQ_API_KEY)}


# 1. Full campaign generator
@app.post("/campaign/generate")
def generate_campaign(req: CampaignRequest):
    """
    Generate a complete multi-platform marketing campaign strategy.
    """
    system = """You are an expert AI Marketing Strategist.
Return ONLY a valid JSON object — no markdown, no explanation, no code fences.
Schema:
{
  "score": number (0-100),
  "summary": "string",
  "adCopies": [
    { "platform": "string", "headline": "string", "body": "string", "cta": "string", "hashtags": "string" }
  ],
  "visualGuide": { "style": "string", "colors": ["#hex"], "concept": "string" },
  "kpis": { "reach": "string", "ctr": "string", "conversions": "string" },
  "schedule": [
    { "day": "string", "time": "string", "content": "string" }
  ],
  "recommendations": ["string"]
}"""

    user = f"""Build a campaign:
Name: {req.campaign_name}
Goal: {req.goal}
Target Audience: {req.audience}
Platforms: {', '.join(req.platforms)}
Tone: {req.tone}
Budget: ${req.budget}

Generate at least one ad copy per platform. Schedule should have 5-7 entries.
Provide 3-5 actionable recommendations."""

    raw  = _groq_chat(system, user)
    data = _parse_json(raw)
    return {"success": True, "campaign": data}


# 2. Single post generator
@app.post("/post/generate")
def generate_post(req: PostRequest):
    """
    Generate a single social media post for a given platform and topic.
    """
    char_note = f" Keep it under {req.max_chars} characters." if req.max_chars else ""
    hashtag_note = "Include relevant hashtags." if req.hashtags else "Do NOT include hashtags."

    system = """You are a social media copywriter.
Return ONLY a valid JSON object with this schema:
{ "post": "string", "hashtags": ["string"], "estimated_engagement": "string" }"""

    user = f"""Write a {req.tone} {req.platform} post about: {req.topic}.
{hashtag_note}{char_note}"""

    raw  = _groq_chat(system, user)
    data = _parse_json(raw)
    return {"success": True, "result": data}


# 3. Content calendar
@app.post("/calendar/generate")
def generate_calendar(req: ContentCalendarRequest):
    """
    Generate a weekly content calendar with post ideas.
    """
    system = """You are a social media strategist.
Return ONLY valid JSON. No markdown, no explanation.
Schema:
{
  "calendar": [
    {
      "week": number,
      "days": [
        {
          "day": "string",
          "platform": "string",
          "type": "string",
          "topic": "string",
          "caption_idea": "string",
          "best_time": "string"
        }
      ]
    }
  ]
}"""

    user = f"""Create a {req.weeks}-week content calendar for:
Brand: {req.brand_name}
Niche: {req.niche}
Platforms: {', '.join(req.platforms)}
Tone: {req.tone}

Include a variety of content types (educational, promotional, engagement, behind-the-scenes)."""

    raw  = _groq_chat(system, user)
    data = _parse_json(raw)
    return {"success": True, "result": data}


# 4. Post performance analyser
@app.post("/post/analyse")
def analyse_post(req: AnalysisRequest):
    """
    Analyse an existing post for clarity, engagement potential, and improvements.
    """
    system = """You are a social media performance analyst.
Return ONLY valid JSON with this schema:
{
  "score": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improved_version": "string",
  "emoji_usage": "string",
  "cta_present": boolean,
  "estimated_reach_category": "Low | Medium | High"
}"""

    user = f"""Analyse this {req.platform} post:

\"\"\"{req.content}\"\"\"

Be specific and actionable."""

    raw  = _groq_chat(system, user, temperature=0.3)
    data = _parse_json(raw)
    return {"success": True, "analysis": data}


# 5. Hashtag generator
@app.get("/hashtags/generate")
def generate_hashtags(topic: str, platform: str = "Instagram", count: int = 20):
    """
    Generate optimised hashtags for a topic and platform.
    """
    system = """You are a hashtag strategy expert.
Return ONLY valid JSON:
{ "hashtags": ["string"], "strategy_note": "string" }"""

    user = f"Generate {count} effective {platform} hashtags for: {topic}. Mix popular and niche tags."

    raw  = _groq_chat(system, user, temperature=0.5)
    data = _parse_json(raw)
    return {"success": True, "result": data}


# 6. Competitor gap analysis (conceptual — no live scraping)
@app.post("/competitor/gap-analysis")
def competitor_gap(
    your_brand: str,
    competitor: str,
    niche: str,
    platforms: list[str] = ["Instagram", "LinkedIn"],
):
    """
    Generate a strategic gap analysis between your brand and a competitor.
    """
    system = """You are a competitive intelligence strategist.
Return ONLY valid JSON:
{
  "gaps": ["string"],
  "opportunities": ["string"],
  "content_angles_to_steal": ["string"],
  "differentiators": ["string"],
  "recommended_actions": ["string"]
}"""

    user = f"""Analyse the social media positioning gap between:
Your Brand: {your_brand}
Competitor: {competitor}
Niche: {niche}
Platforms: {', '.join(platforms)}

Focus on content strategy, tone, and audience engagement gaps."""

    raw  = _groq_chat(system, user)
    data = _parse_json(raw)
    return {"success": True, "analysis": data}


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("smm:app", host="0.0.0.0", port=8000, reload=True)