# ── stdlib ──────────────────────────────────────────────────────────────────
import os
import json
import logging
import re
from typing import Optional

# ── third-party ─────────────────────────────────────────────────────────────
# pip install fastapi uvicorn python-multipart groq python-dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from groq import Groq, AuthenticationError, RateLimitError, APIStatusError
from dotenv import load_dotenv
import uvicorn

# ── load .env ────────────────────────────────────────────────────────────────
load_dotenv()

# ── logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("pitch")

# ── Groq client ───────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    log.warning(
        "GROQ_API_KEY not set. "
        "Add it to your .env file:\n"
        "  GROQ_API_KEY=your-key-here"
    )

client = Groq(api_key=GROQ_API_KEY)

# ── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="PitchGen AI – Backend",
    description="Generates investor-ready pitch deck slides from a problem + solution.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response models ────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    problem:  str = Field(..., min_length=10, description="The problem the startup solves")
    solution: str = Field(..., min_length=10, description="How the startup solves it")
    theme_id: Optional[str] = Field(
        default="midnight",
        description="Theme ID selected by the user (stored for future use)"
    )


class SlideModel(BaseModel):
    title:    str
    headline: str
    body:     str
    stat:     Optional[str] = None


class GenerateResponse(BaseModel):
    startupName: str
    tagline:     str
    slides:      list[SlideModel]


# ── Prompt builder ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = (
    "You are a world-class startup pitch deck writer who has helped companies "
    "raise over $500M in venture funding. You write compelling, data-driven, "
    "investor-ready content. You always respond with valid JSON and nothing else."
)

def build_user_prompt(problem: str, solution: str) -> str:
    return f"""
Generate a complete 11-slide investor pitch deck based on the following inputs.

Problem: "{problem}"
Solution: "{solution}"

Return ONLY a single valid JSON object — no markdown fences, no preamble, no explanation.
The JSON must match this exact structure:

{{
  "startupName": "short punchy startup name derived from the solution",
  "tagline": "one compelling tagline (max 12 words)",
  "slides": [
    {{
      "title": "Title",
      "headline": "<startup name> — <tagline>",
      "body": "One powerful sentence that captures the company's mission.",
      "stat": null
    }},
    {{
      "title": "The Problem",
      "headline": "A pain worth solving",
      "body": "2-3 sentences on the problem, its scale, and why now.",
      "stat": "e.g. $X billion lost annually"
    }},
    {{
      "title": "Our Solution",
      "headline": "Introducing <startup name>",
      "body": "2 crisp sentences describing the product and how it solves the problem.",
      "stat": null
    }},
    {{
      "title": "Market Opportunity",
      "headline": "A massive, underserved market",
      "body": "TAM / SAM / SOM narrative in 2 sentences.",
      "stat": "TAM: $X billion"
    }},
    {{
      "title": "Business Model",
      "headline": "How we make money",
      "body": "Revenue streams and pricing model in 2 sentences.",
      "stat": "e.g. $X ARPU"
    }},
    {{
      "title": "Traction",
      "headline": "Early proof it works",
      "body": "Key traction metrics, pilot results, or early validation in 2 sentences.",
      "stat": "e.g. X paying customers"
    }},
    {{
      "title": "Competitive Edge",
      "headline": "Why we win",
      "body": "3 unique advantages over existing alternatives.",
      "stat": null
    }},
    {{
      "title": "Go-To-Market",
      "headline": "How we reach customers",
      "body": "Channel strategy and first 12-month plan in 2 sentences.",
      "stat": null
    }},
    {{
      "title": "Financial Outlook",
      "headline": "The path to scale",
      "body": "Revenue projections and key milestones for 3 years in 2 sentences.",
      "stat": "Projected $XM ARR by Y3"
    }},
    {{
      "title": "The Team",
      "headline": "Built for this moment",
      "body": "2 sentences on why this founding team is uniquely positioned to win.",
      "stat": null
    }},
    {{
      "title": "The Ask",
      "headline": "Join us",
      "body": "Funding ask, use of funds, and the vision in 2-3 sentences.",
      "stat": "Raising $XM Seed"
    }}
  ]
}}
""".strip()


# ── Helper: strip markdown fences if model adds them anyway ──────────────────
def extract_json(raw: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", raw).strip()
    start = cleaned.find("{")
    end   = cleaned.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("No JSON object found in model response.")
    return json.loads(cleaned[start:end])


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Meta"])
def health():
    return {"status": "ok", "model": "llama-3.3-70b-versatile"}


@app.post("/api/generate", response_model=GenerateResponse, tags=["Pitch"])
async def generate_pitch(payload: GenerateRequest):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured on the server."
        )

    log.info("Generating pitch for: %r / %r", payload.problem[:60], payload.solution[:60])

    try:
        message = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1500,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": build_user_prompt(payload.problem, payload.solution)},
            ],
        )
        raw_text = message.choices[0].message.content

    except AuthenticationError:
        log.error("Invalid Groq API key.")
        raise HTTPException(status_code=401, detail="Invalid Groq API key.")
    except RateLimitError:
        log.warning("Groq rate limit hit.")
        raise HTTPException(status_code=429, detail="Rate limit reached. Please try again shortly.")
    except APIStatusError as exc:
        log.error("Groq API error: %s", exc)
        raise HTTPException(status_code=502, detail=f"Upstream API error: {exc.message}")

    log.debug("Raw model output: %s", raw_text[:200])

    try:
        data = extract_json(raw_text)
    except (json.JSONDecodeError, ValueError) as exc:
        log.error("JSON parse failed: %s\nRaw: %s", exc, raw_text[:500])
        raise HTTPException(
            status_code=500,
            detail="Model returned malformed JSON. Please try again."
        )

    for key in ("startupName", "tagline", "slides"):
        if key not in data:
            raise HTTPException(
                status_code=500,
                detail=f"Model response missing required field: '{key}'"
            )

    if len(data["slides"]) < 11:
        log.warning("Only %d slides returned (expected 11).", len(data["slides"]))

    log.info("✓ Pitch generated: %r (%d slides)", data["startupName"], len(data["slides"]))
    return data


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled exception on %s", request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."},
    )


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "pitch:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )