from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import AIRequest, AIResponse
from .analytics_engine import calculate_analytics
from .ai_engine import get_ai_response

app = FastAPI(title="AI Revenue Copilot")

# Register review intelligence router (separate from revenue)
from .review_routes import router as review_router
app.include_router(review_router)

# Register branch health intelligence router
from .health_routes import router as health_router
app.include_router(health_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ai-revenue", response_model=AIResponse)
async def ai_revenue_endpoint(request: AIRequest):
    try:
        analytics_data = calculate_analytics(request.bookings)
        ai_response_text = get_ai_response(request, analytics_data)
        
        return AIResponse(
            total_revenue=analytics_data["total_revenue"],
            weak_branch=analytics_data["weak_branch"],
            strong_branch=analytics_data["strong_branch"],
            branch_summary=analytics_data["branch_summary"],
            ai_response=ai_response_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
