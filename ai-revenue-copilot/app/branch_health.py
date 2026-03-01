"""
Branch Health Intelligence — calculates combined Economic + Social scores
and generates an AI executive summary. Completely separate from revenue and review endpoints.
"""
import requests
import os

API_KEY = os.getenv("OPENROUTER_API_KEY")

# Configurable weights
ECONOMIC_WEIGHT = 0.6
SOCIAL_WEIGHT = 0.4


def calculate_economic_score(branch: dict) -> float:
    """Normalize revenue metrics to 0-100 scale."""
    revenue = branch.get("revenue", 0)
    capacity = branch.get("capacity", 1)
    booked = branch.get("booked", 0)

    # Occupancy percentage (0-100)
    occupancy = min((booked / max(capacity, 1)) * 100, 100)

    # Revenue score — normalized against a baseline of 500000
    baseline = 500000
    revenue_score = min((revenue / baseline) * 100, 100)

    # Booking density (higher is better) — cap at 100
    booking_density = min((booked / max(capacity, 1)) * 120, 100)

    # Weighted economic score
    score = (revenue_score * 0.5) + (occupancy * 0.3) + (booking_density * 0.2)
    return round(min(max(score, 0), 100), 1)


def calculate_social_score(review_data: dict) -> float:
    """Normalize review/reputation metrics to 0-100 scale."""
    sentiment = review_data.get("sentiment_score", 50)
    review_count = review_data.get("review_count", 0)
    risk_level = review_data.get("risk_level", "Unknown")

    # Risk penalty
    risk_penalties = {"Low": 0, "Moderate": 15, "High": 30, "Unknown": 10}
    penalty = risk_penalties.get(risk_level, 10)

    # Review volume bonus (more reviews = more reliable)
    volume_bonus = min(review_count * 0.5, 10)

    score = sentiment - penalty + volume_bonus
    return round(min(max(score, 0), 100), 1)


def calculate_health_index(economic: float, social: float) -> float:
    """Final combined health index."""
    return round((economic * ECONOMIC_WEIGHT) + (social * SOCIAL_WEIGHT), 1)


def get_status_label(health_index: float) -> str:
    if health_index >= 80:
        return "Strong"
    elif health_index >= 60:
        return "Stable"
    elif health_index >= 40:
        return "At Risk"
    else:
        return "Critical"


def generate_executive_summary(branches_data: list) -> str:
    """Use AI to generate a cumulative executive summary."""
    if not API_KEY:
        return "OPENROUTER_API_KEY not configured."

    # Build context from all branches
    context_lines = []
    for b in branches_data:
        context_lines.append(
            f"- {b['branch_name']}: Economic={b['economic_score']}, "
            f"Social={b['social_score']}, Health={b['health_index']}, "
            f"Status={b['status']}"
        )
    context = "\n".join(context_lines)

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost"
    }

    data = {
        "model": "meta-llama/llama-3-8b-instruct",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a strategic hospitality business consultant.\n"
                    "Analyze the following complete branch dataset.\n"
                    "Compare economic performance and social performance.\n"
                    "Identify systemic risks.\n"
                    "Identify which branch needs intervention.\n"
                    "Provide:\n"
                    "1. Executive Summary\n"
                    "2. Strategic Risk Areas\n"
                    "3. Growth Opportunities\n"
                    "4. Immediate Action Plan\n"
                    "Limit response to 8 bullet points.\n"
                    "Be concise and actionable."
                )
            },
            {
                "role": "user",
                "content": f"Branch Performance Data:\n{context}"
            }
        ],
        "temperature": 0.4,
        "max_tokens": 400
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )
        if response.status_code != 200:
            return f"AI service error: {response.text}"
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"AI service exception: {str(e)}"


def compute_branch_health(bookings: list, review_overrides: dict = None) -> dict:
    """
    Main entry point. Takes bookings array and optional review data overrides.
    Returns full health report JSON.
    """
    if review_overrides is None:
        review_overrides = {}

    branches_data = []
    for booking in bookings:
        branch_name = booking.get("branch_name", "Unknown")

        # Economic score from booking data
        economic = calculate_economic_score(booking)

        # Social score — use overrides if provided, else default
        review_info = review_overrides.get(branch_name, {
            "sentiment_score": 50,
            "review_count": 0,
            "risk_level": "Unknown"
        })
        social = calculate_social_score(review_info)

        health = calculate_health_index(economic, social)
        status = get_status_label(health)

        branches_data.append({
            "branch_name": branch_name,
            "economic_score": economic,
            "social_score": social,
            "health_index": health,
            "status": status
        })

    # Sort by health index descending
    branches_data.sort(key=lambda x: x["health_index"], reverse=True)

    # Overall metrics
    overall = round(
        sum(b["health_index"] for b in branches_data) / max(len(branches_data), 1), 1
    )
    strongest = branches_data[0]["branch_name"] if branches_data else "N/A"
    weakest = branches_data[-1]["branch_name"] if branches_data else "N/A"

    # AI executive summary
    ai_summary = generate_executive_summary(branches_data)

    return {
        "overall_health_score": overall,
        "strongest_branch": strongest,
        "weakest_branch": weakest,
        "branches": branches_data,
        "ai_executive_summary": ai_summary
    }
