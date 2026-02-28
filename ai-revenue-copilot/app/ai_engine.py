from groq import Groq
from .schemas import AIRequest
from .config import GROQ_API_KEY


def get_ai_response(request: AIRequest, analytics_data: dict) -> str:
    if not GROQ_API_KEY:
        return "GROQ_API_KEY not configured. Cannot generate AI response."

    client = Groq(api_key=GROQ_API_KEY)

    if request.role == "head":
        role_description = (
            "You are an Executive AI Revenue Intelligence Copilot for a multi-branch banquet management SaaS. "
            "Provide executive-level strategic advice, identify the focus branch, "
            "and offer pricing, operational, and marketing suggestions based on the provided analytics."
        )
    else:  # branch
        role_description = (
            "You are an Operational AI Revenue Intelligence Copilot for a single branch of a banquet management SaaS. "
            "Provide operational advice only for that branch, and practical revenue improvement suggestions."
        )

    system_prompt = (
        f"{role_description}\n"
        "IMPORTANT RULES:\n"
        "1. DO NOT calculate any numbers yourself. Only interpret the structured analytics provided.\n"
        "2. Base all your advice strictly on the provided data and analytics."
    )

    # Prepare context
    context = (
        f"Analytics Data:\n"
        f"Total Revenue: ${analytics_data['total_revenue']:.2f}\n"
        f"Strongest Branch: {analytics_data['strong_branch']}\n"
        f"Weakest Branch: {analytics_data['weak_branch']}\n\n"
        "Branch Summaries:\n"
    )
    for b in analytics_data['branch_summary']:
        context += (
            f"- {b.branch_name}: Revenue Share: {b.revenue_share:.1f}%, Occupancy: {b.occupancy:.1f}%, "
            f"Score: {b.performance_score:.1f}. "
            f"Flags: Weak={'Yes' if b.is_weak else 'No'}, Dominant={'Yes' if b.is_dominant else 'No'}. "
            f"System Suggestion: {b.suggestion}\n"
        )



    messages = [{"role": "system", "content": system_prompt}]

    if request.chat_history:
        for msg in request.chat_history:
            messages.append({"role": msg.role, "content": msg.content})

    user_content = f"User Message: {request.message}\n\n{context}"
    messages.append({"role": "user", "content": user_content})

    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error communicating with Groq API: {str(e)}"
