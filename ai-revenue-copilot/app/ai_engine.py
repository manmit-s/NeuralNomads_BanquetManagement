import requests
import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

API_KEY = os.getenv("OPENROUTER_API_KEY")

def get_ai_response(request, analytics_data):
    """Accepts the request object and analytics dict from main.py"""
    prompt = request.message
    role = request.role

    if not API_KEY:
        return "OPENROUTER_API_KEY not configured."

    # Build analytics context
    context = (
        f"Total Revenue: ${analytics_data.get('total_revenue', 0):.2f}\n"
        f"Strongest Branch: {analytics_data.get('strong_branch', 'N/A')}\n"
        f"Weakest Branch: {analytics_data.get('weak_branch', 'N/A')}\n"
    )

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
                    "You are a professional banquet revenue strategist.\n"
                    "Respond concisely and only relevant to the user query.\n"
                    "Limit output to maximum 6 bullet points.\n"
                    "Format strictly as:\n"
                    "• Executive Insight\n"
                    "• Key Branch Focus\n"
                    "• Immediate Actions\n"
                    "• Growth Opportunity\n"
                    "Do not repeat numbers already provided unless necessary."
                )
            },
            {
                "role": "user",
                "content": f"User Role: {role}\nAnalytics Data:\n{context}\n\n{prompt}"
            }
        ],
        "temperature": 0.5,
        "max_tokens": 300
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