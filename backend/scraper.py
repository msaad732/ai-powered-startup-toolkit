import re
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)
DEFAULT_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml",
}

DEMAND_KEYWORDS = [
    "market",
    "growth",
    "demand",
    "trend",
    "startup",
    "business",
    "opportunity",
    "scale",
    "increase",
    "industry",
    "investment",
    "funding",
    "innovation",
]

def _search_duckduckgo(query, max_results=8):
    titles = []
    descriptions = []

    response = requests.post(
        "https://html.duckduckgo.com/html/",
        headers=DEFAULT_HEADERS,
        data={"q": query},
        timeout=15,
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    for result in soup.select(".result")[:max_results]:
        title_el = result.select_one(".result__a")
        desc_el = result.select_one(".result__snippet")
        if title_el:
            titles.append(title_el.get_text(strip=True))
        if desc_el:
            descriptions.append(desc_el.get_text(strip=True))

    return titles, descriptions


def _search_bing(query, max_results=8):
    titles = []
    descriptions = []

    url = f"https://www.bing.com/search?q={quote_plus(query)}"
    response = requests.get(url, headers=DEFAULT_HEADERS, timeout=15)
    response.raise_for_status()

    if "captcha" in response.text.lower():
        return titles, descriptions

    soup = BeautifulSoup(response.text, "html.parser")
    results = soup.select("li.b_algo")
    if not results:
        results = soup.select("#b_results > li")

    for result in results[:max_results]:
        title_el = result.find("h2") or result.find("a")
        desc_el = result.find("p")
        if title_el:
            titles.append(title_el.get_text(strip=True))
        if desc_el:
            descriptions.append(desc_el.get_text(strip=True))

    return titles, descriptions


def _keyword_hits(texts):
    hits = 0
    for text in texts:
        lower = text.lower()
        for word in DEMAND_KEYWORDS:
            if re.search(rf"\b{re.escape(word)}\b", lower):
                hits += 1
    return hits


def _relevance_hits(idea, titles, descriptions):
    tokens = {t for t in re.findall(r"\w{4,}", idea.lower()) if len(t) >= 4}
    if not tokens:
        return 0

    hits = 0
    for text in titles + descriptions:
        lower = text.lower()
        if any(token in lower for token in tokens):
            hits += 1
    return hits


def _offline_fallback(idea):
    idea_lower = idea.lower()
    keyword_hits = sum(1 for word in DEMAND_KEYWORDS if word in idea_lower)
    competition = 4

    titles = [f"Offline estimate for: {idea[:100]}"]
    descriptions = [
        "Live web search was unavailable — scores are based on your idea text.",
        "Run customer interviews and check industry reports for stronger validation.",
    ]

    if keyword_hits >= 3:
        descriptions.append("Your idea description includes strong business/market language.")
    else:
        descriptions.append("Add more market context to improve offline scoring accuracy.")

    return titles, descriptions, competition, keyword_hits, "offline"


def scrape_search_results(idea, max_results=8):
    query = idea.strip()
    if not query:
        return [], [], 0, 0, "empty"

    for search_fn, source in ((_search_duckduckgo, "duckduckgo"), (_search_bing, "bing")):
        try:
            titles, descriptions = search_fn(query, max_results)
            if titles or descriptions:
                competition = max(len(titles), len(descriptions))
                keyword_hits = _keyword_hits(descriptions)
                return titles, descriptions, competition, keyword_hits, source
        except requests.RequestException:
            continue

    titles, descriptions, competition, keyword_hits, source = _offline_fallback(query)
    return titles, descriptions, competition, keyword_hits, source


def validate_idea(idea):
    try:
        titles, descriptions, competition, keyword_hits, source = scrape_search_results(idea)
        relevance = _relevance_hits(idea, titles, descriptions)

        market_score = min(
            100,
            (competition * 4)
            + (keyword_hits * 3)
            + (relevance * 5),
        )

        if market_score > 70:
            status = "High Potential Market"
        elif market_score > 40:
            status = "Moderate Market"
        else:
            status = "Low Market Interest"

        insights = []

        if competition >= 8:
            insights.append("High number of related results found online")
        elif competition >= 4:
            insights.append("Moderate competition detected in search results")
        else:
            insights.append("Low competition detected — niche opportunity possible")

        if keyword_hits >= 6:
            insights.append("Strong demand signals in market content")
        elif keyword_hits >= 3:
            insights.append("Some demand signals found in search snippets")
        else:
            insights.append("Weak demand signals — validate with real customers")

        if relevance >= 4:
            insights.append("Search results closely match your startup idea")
        elif relevance >= 2:
            insights.append("Partial overlap between your idea and search results")
        else:
            insights.append("Search results have limited overlap — refine your positioning")

        if source == "offline":
            insights.append("Used offline fallback because live search was blocked")

        return {
            "idea": idea,
            "competition_score": competition,
            "market_score": market_score,
            "status": status,
            "insights": insights,
            "sample_results": titles[:5],
            "source": source,
        }

    except Exception as e:
        return {"error": str(e)}


def build_validation_response(raw, metadata=None):
    metadata = metadata or {}
    title = metadata.get("title") or "Your startup"
    problem = metadata.get("problem") or "a key market problem"
    industry = metadata.get("industry") or "General"
    target = metadata.get("targetCustomers") or "your target audience"
    solution = metadata.get("solution") or ""

    market_score = raw.get("market_score", 50)
    competition = raw.get("competition_score", 0)
    insights = list(raw.get("insights", []))

    for sample in raw.get("sample_results", [])[:2]:
        insights.append(f"Related search finding: {sample[:120]}")

    validation_score = min(
        100,
        round(
            market_score * 0.6
            + min(competition * 2, 20)
            + (10 if solution.strip() else 0)
            + (10 if metadata.get("targetCustomers", "").strip() else 0)
        ),
    )

    return {
        "validationScore": validation_score,
        "marketStrength": {
            "score": market_score,
            "scrapedInsights": insights or ["Limited public data found for this idea"],
            "currentTrends": raw.get("status", "Market analysis complete"),
        },
        "suggestions": {
            "captions": [
                f"{title}: Tackling {problem[:70]}{'...' if len(problem) > 70 else ''}",
                f"Built for {target} — {title} makes {industry} simpler",
                f"The future of {industry} starts with {title}",
            ],
            "strategicPivots": [
                "Start with a narrow niche before expanding to adjacent markets",
                "Validate pricing with 10–15 early customer interviews",
                f"Differentiate from competitors found in {industry} search results",
            ],
            "brandingTips": [
                f"Highlight the problem first, then position {title} as the solution",
                f"Use language that resonates with {target}",
                "Add social proof from beta users before a full launch",
            ],
        },
    }
