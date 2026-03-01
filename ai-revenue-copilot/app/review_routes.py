from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from .review_fetcher import fetch_reviews
from .review_analyzer import analyze_reviews

router = APIRouter()


class ReviewRequest(BaseModel):
    branch_name: str
    review_url: Optional[str] = ""


@router.post("/ai-reviews")
def review_intelligence(payload: ReviewRequest):
    """Reputation Intelligence endpoint — separate from revenue AI."""

    reviews = fetch_reviews(payload.review_url, payload.branch_name)

    if not reviews:
        return {
            "branch": payload.branch_name,
            "review_count": 0,
            "analysis": "No reviews could be extracted from the provided URL. Please verify the URL points to a page with customer reviews.",
            "message": "No reviews found."
        }

    analysis = analyze_reviews(payload.branch_name, reviews)

    return {
        "branch": payload.branch_name,
        "review_count": len(reviews),
        "analysis": analysis
    }


@router.get("/ai-reviews/demo")
def review_demo():
    """Demo endpoint — uses built-in sample reviews for instant analysis."""
    from .demo_reviews import DEMO_REVIEWS, DEMO_BRANCH_NAME

    analysis = analyze_reviews(DEMO_BRANCH_NAME, DEMO_REVIEWS)

    return {
        "branch": DEMO_BRANCH_NAME,
        "review_count": len(DEMO_REVIEWS),
        "analysis": analysis
    }
