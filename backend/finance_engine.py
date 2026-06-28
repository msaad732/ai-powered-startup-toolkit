import base64
from io import BytesIO

import matplotlib.pyplot as plt


MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

MARKET_MULTIPLIERS = {"Small": 0.7, "Medium": 1.0, "Large": 1.5}

CAPEX_TEMPLATES = {
    "SaaS": [
        ("Product Development", 15000),
        ("Legal & Registry", 2000),
        ("Cloud Infrastructure Setup", 3000),
    ],
    "Marketplace": [
        ("Platform Development", 20000),
        ("Legal & Compliance", 3500),
        ("Initial Vendor Onboarding", 5000),
    ],
    "E-commerce": [
        ("Store & Inventory Setup", 12000),
        ("Legal & Registry", 2000),
        ("Initial Stock", 8000),
    ],
    "Service-based": [
        ("Tools & Equipment", 5000),
        ("Legal & Registry", 1500),
        ("Branding & Website", 4000),
    ],
}

OPEX_TEMPLATES = {
    "SaaS": [
        ("Cloud Hosting", 500),
        ("Marketing", 1200),
        ("Team Salaries", 5000),
        ("Software Subscriptions", 300),
    ],
    "Marketplace": [
        ("Cloud Hosting", 800),
        ("Marketing", 2500),
        ("Team Salaries", 6000),
        ("Payment Processing", 400),
    ],
    "E-commerce": [
        ("Hosting & Fulfillment", 700),
        ("Marketing", 2000),
        ("Team Salaries", 4500),
        ("Inventory Restock", 1500),
    ],
    "Service-based": [
        ("Office & Utilities", 600),
        ("Marketing", 1000),
        ("Team Salaries", 4000),
        ("Tools & Subscriptions", 250),
    ],
}


def calculate_startup_cost(data):
    total = (
        data.get("office_cost", 0)
        + data.get("equipment_cost", 0)
        + data.get("marketing_cost", 0)
        + data.get("development_cost", 0)
        + data.get("legal_cost", 0)
        + data.get("misc_cost", 0)
    )
    return total


def calculate_monthly_expenses(data):
    total = (
        data.get("rent", 0)
        + data.get("salaries", 0)
        + data.get("marketing", 0)
        + data.get("utilities", 0)
        + data.get("subscriptions", 0)
    )
    return total


def forecast_revenue(price_per_user, customers_per_month, growth_rate=0, months=12):
    revenue = []
    current = price_per_user * customers_per_month
    for _ in range(months):
        revenue.append(round(current))
        current *= 1 + growth_rate / 100
    return revenue


def calculate_profit(revenue, monthly_expense, months=12):
    profit = []
    for i in range(months):
        profit.append(round(revenue[i] - monthly_expense))
    return profit


def break_even_point(fixed_costs, price, variable_cost):
    if price - variable_cost == 0:
        return None
    return fixed_costs / (price - variable_cost)


def runway(cash, monthly_burn):
    if monthly_burn == 0:
        return float("inf")
    return cash / monthly_burn


def generate_financial_chart(revenue, profit):
    months = list(range(1, len(revenue) + 1))

    plt.figure(figsize=(10, 5))
    plt.plot(months, revenue, label="Revenue", marker="o")
    plt.plot(months, profit, label="Profit", marker="o")

    plt.title("Startup Financial Projection")
    plt.xlabel("Months")
    plt.ylabel("Amount")
    plt.legend()
    plt.grid(True)

    buffer = BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)

    img_base64 = base64.b64encode(buffer.read()).decode("utf-8")
    plt.close()

    return img_base64


def _estimate_costs(business_model, market_size):
    multiplier = MARKET_MULTIPLIERS.get(market_size, 1.0)
    capex_template = CAPEX_TEMPLATES.get(business_model, CAPEX_TEMPLATES["SaaS"])
    opex_template = OPEX_TEMPLATES.get(business_model, OPEX_TEMPLATES["SaaS"])

    capex = [
        {"category": name, "cost": round(cost * multiplier)}
        for name, cost in capex_template
    ]
    opex = [
        {"category": name, "cost": round(cost * multiplier)}
        for name, cost in opex_template
    ]
    return capex, opex


def _find_break_even_month(revenue, monthly_expense, startup_cost):
    cumulative_revenue = 0
    cumulative_cost = startup_cost
    for i, rev in enumerate(revenue):
        cumulative_revenue += rev
        cumulative_cost += monthly_expense
        if cumulative_revenue >= cumulative_cost:
            return i + 1
    return 12


def _viability_score(runway_months, break_even_month, growth_rate):
    score = 50
    if runway_months >= 12:
        score += 20
    elif runway_months >= 6:
        score += 10

    if break_even_month <= 6:
        score += 20
    elif break_even_month <= 10:
        score += 10

    if growth_rate >= 20:
        score += 10
    elif growth_rate >= 10:
        score += 5

    return min(100, max(0, score))


def analyze_financials(data):
    startup_name = data.get("startupName", "Startup")
    avg_price = float(data.get("avgPrice", 0) or 0)
    expected_customers = int(data.get("expectedCustomers", 0) or 0)
    growth_rate = float(data.get("growthRate", 15) or 15)
    business_model = data.get("businessModel", "SaaS")
    market_size = data.get("marketSize", "Medium")
    stage = data.get("stage", "Pre-revenue")

    capex, opex = _estimate_costs(business_model, market_size)
    startup_cost = sum(item["cost"] for item in capex)
    monthly_expense = sum(item["cost"] for item in opex)

    revenue = forecast_revenue(avg_price, expected_customers, growth_rate)
    profit = calculate_profit(revenue, monthly_expense)

    break_even_month = _find_break_even_month(revenue, monthly_expense, startup_cost)
    min_customers = break_even_point(startup_cost, avg_price, monthly_expense * 0.3)
    if min_customers is None:
        min_customers = expected_customers
    else:
        min_customers = round(min_customers)

    initial_cash = startup_cost * 1.5
    runway_months = runway(initial_cash, monthly_expense)
    if runway_months == float("inf"):
        runway_months = 24
    else:
        runway_months = round(runway_months, 1)

    positive_month = next(
        (i + 1 for i, p in enumerate(profit) if p > 0),
        break_even_month,
    )

    viability = _viability_score(runway_months, break_even_month, growth_rate)
    status = (
        "Financially Viable"
        if viability >= 65
        else "Moderate Risk — Review Costs"
    )

    revenue_forecast = [
        {
            "month": MONTH_LABELS[i],
            "revenue": revenue[i],
            "profit": profit[i],
        }
        for i in range(len(revenue))
    ]

    chart_base64 = generate_financial_chart(revenue, profit)

    return {
        "startupName": startup_name,
        "viabilityScore": viability,
        "status": status,
        "capex": capex,
        "opex": opex,
        "revenueForecast": revenue_forecast,
        "breakEven": {
            "months": break_even_month,
            "minCustomers": min_customers,
            "revenueRequired": round(revenue[break_even_month - 1] if break_even_month <= 12 else revenue[-1]),
        },
        "cashFlow": {
            "runway": runway_months,
            "burnRate": monthly_expense,
            "positiveMonth": positive_month,
        },
        "risks": [
            {
                "risk": "Customer Acquisition Cost (CAC) Spike",
                "mitigation": "Focus on organic SEO and referral loops early.",
            },
            {
                "risk": "High Initial Burn Rate",
                "mitigation": "Utilize cloud credits and part-time contractors.",
            },
        ],
        "recommendations": [
            f"Optimize marketing spend during {stage} phase",
            "Consider a tiered pricing model to increase LTV",
            "Maintain at least 6 months of cash reserves",
        ],
        "chart": chart_base64,
    }
