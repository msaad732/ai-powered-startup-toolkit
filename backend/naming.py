# ── stdlib ────────────────────────────────────────────────────────────────────
import os
import json
import logging
from typing import List, Optional

# ── third-party ───────────────────────────────────────────────────────────────
from fastapi import HTTPException
from pydantic import BaseModel, Field
from groq import AsyncGroq

# ── logging ───────────────────────────────────────────────────────────────────
log = logging.getLogger("naming")

# ── Groq client ───────────────────────────────────────────────────────────────
# pip install groq
# export GROQ_API_KEY="gsk_..."   (get a free key at https://console.groq.com/keys)
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY", ""))


# ═════════════════════════════════════════════════════════════════════════════
#  Models
# ═════════════════════════════════════════════════════════════════════════════

class BrandRequest(BaseModel):
    description:  str
    industry:      str = ""
    audience:      str = ""
    valueProp:     str = ""
    tone:          str = "Modern"
    style:         str = "Descriptive"
    avoidedWords:  str = ""


class BrandOption(BaseModel):
    name:              str
    rationale:         str
    style:             str
    pronunciation:     str
    slogans:           List[str]
    brandFitScore:     int
    justification:     str
    domainLikelihood:  str
    culturalFlags:     Optional[List[str]] = None


class BrandListResponse(BaseModel):
    brands: List[BrandOption]


class FinalizeBrandRequest(BaseModel):
    brand:        BrandOption
    description:  str = ""
    industry:      str = ""


class FinalizeBrandResponse(BaseModel):
    name:              str
    rationale:         Optional[str] = None
    style:             Optional[str] = None
    pronunciation:     Optional[str] = None
    slogans:           List[str]
    brandFitScore:     Optional[int] = None
    justification:     Optional[str] = None
    domainLikelihood:  Optional[str] = None
    culturalFlags:     Optional[List[str]] = None
    brandStory:        str
    traits:            List[str]
    logoDirection:     str
    colors:            List[str]
    typography:        str
    voice:             str
    strengthScore:     int
    status:            str
    improvements:      List[str]


# ═════════════════════════════════════════════════════════════════════════════
#  Prompts
# ═════════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT_BRANDS = (
    "You are an expert Brand Strategist and Naming Consultant. Generate "
    "brand identity options based on specific constraints. "
    'Return ONLY a JSON object (no markdown, no commentary) with a key '
    '"brands" containing an array of exactly 10 objects. Each object must '
    'have these exact keys: "name" (string), "rationale" (string), '
    '"style" (one of: Professional, Creative, Tech-focused, Premium), '
    '"pronunciation" (string), "slogans" (array of exactly 3 strings), '
    '"brandFitScore" (integer 1-10), "justification" (string), '
    '"domainLikelihood" (one of: High, Med, Low), "culturalFlags" '
    "(array of short strings, or null if none)."
)

SYSTEM_PROMPT_FINALIZE = (
    "You are an expert Brand Strategist. Analyze a specific brand choice "
    "and provide visual/strategic recommendations. Return ONLY a JSON "
    'object (no markdown, no commentary) with these exact keys: '
    '"brandStory" (string, 2-3 sentences), "traits" (array of 4-6 short '
    'adjectives), "logoDirection" (string), "colors" (array of 3-4 hex '
    'color strings like "#1A2B3C"), "typography" (string), "voice" '
    '(string), "strengthScore" (integer 0-100), "status" (one of: '
    'Strong, Refinement, Weak), "improvements" (array of 3-4 short '
    "actionable suggestions)."
)


# ═════════════════════════════════════════════════════════════════════════════
#  Groq call helper
# ═════════════════════════════════════════════════════════════════════════════

async def _call_groq(prompt: str, system_prompt: str, temperature: float = 0.9) -> dict:
    if not os.environ.get("GROQ_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured on the server.",
        )
    try:
        completion = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        content = completion.choices[0].message.content
        return json.loads(content)
    except json.JSONDecodeError:
        log.exception("Groq returned non-JSON content")
        raise HTTPException(status_code=502, detail="Model returned malformed JSON.")
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Groq API call failed")
        raise HTTPException(status_code=502, detail=f"Groq API error: {e}")


# ═════════════════════════════════════════════════════════════════════════════
#  Public functions (called from main.py)
# ═════════════════════════════════════════════════════════════════════════════

async def generate_brands(payload: BrandRequest) -> BrandListResponse:
    prompt = (
        "Generate 10 brand names for:\n"
        f"Description: {payload.description}\n"
        f"Industry: {payload.industry}\n"
        f"Audience: {payload.audience}\n"
        f"Value Proposition: {payload.valueProp}\n"
        f"Tone: {payload.tone}\n"
        f"Style Preference: {payload.style}\n"
        f"Avoid: {payload.avoidedWords}\n"
    )

    result = await _call_groq(prompt, SYSTEM_PROMPT_BRANDS)

    if "brands" not in result:
        raise HTTPException(
            status_code=502,
            detail="Malformed model response: missing 'brands' key.",
        )

    return BrandListResponse(**result)


async def finalize_brand(payload: FinalizeBrandRequest) -> FinalizeBrandResponse:
    brand = payload.brand
    top_slogan = brand.slogans[0] if brand.slogans else ""

    prompt = (
        f'Develop a full brand identity for "{brand.name}".\n'
        f"Context: {payload.description} in {payload.industry}.\n"
        f"Slogan selected: {top_slogan}.\n"
    )

    result = await _call_groq(prompt, SYSTEM_PROMPT_FINALIZE)

    merged = {**brand.model_dump(), **result}
    return FinalizeBrandResponse(**merged)


def health() -> dict:
    return {
        "status": "ok",
        "model": GROQ_MODEL,
        "key_configured": bool(os.environ.get("GROQ_API_KEY")),
    }