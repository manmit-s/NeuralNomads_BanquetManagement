import requests
import os

API_KEY = os.getenv("OPENROUTER_API_KEY")


def analyze_reviews(branch_name: str, reviews: list):
    """Analyze scraped reviews using the AI engine via OpenRouter (separate from revenue AI)."""

    combined_reviews = "\n".join(reviews[:30])

    prompt = f"""
Analyze the following customer reviews for branch: {branch_name}

Identify:
1. Overall sentiment score (0-100)
2. Risk level (Low / Moderate / High)
3. Top 3 strengths
4. Top 3 complaints
5. Operational weaknesses
6. 5 actionable improvement suggestions
7. A note mentioning "WEBSITES VISITED: Google Maps, Zomato, TripAdvisor"

Reviews:
{combined_reviews}
"""

    if not API_KEY:
        return "OPENROUTER_API_KEY not configured."

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
                    "You are a professional reputation intelligence analyst for banquet venues.\n"
                    "Analyze customer reviews and provide structured insights.\n"
                    "Format your response strictly as:\n"
                    "SENTIMENT_SCORE: <0-100>\n"
                    "RISK_LEVEL: <Low|Moderate|High>\n\n"
                    "WEBSITES_VISITED: Google Reviews, Zomato, TripAdvisor\n\n"
                    "STRENGTHS:\n• ...\n• ...\n• ...\n\n"
                    "COMPLAINTS:\n• ...\n• ...\n• ...\n\n"
                    "WEAKNESSES:\n• ...\n• ...\n\n"
                    "IMPROVEMENT_PLAN:\n1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n"
                    "Be concise and actionable."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.4,
        "max_tokens": 500
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
