from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict
from .branch_health import compute_branch_health

router = APIRouter()


class BranchBooking(BaseModel):
    branch_id: str
    branch_name: str
    revenue: float
    capacity: int
    booked: int


class ReviewOverride(BaseModel):
    sentiment_score: float = 50
    review_count: int = 0
    risk_level: str = "Unknown"


class BranchHealthRequest(BaseModel):
    bookings: List[BranchBooking]
    review_overrides: Optional[Dict[str, ReviewOverride]] = None


@router.post("/ai-branch-health")
def branch_health_endpoint(request: BranchHealthRequest):
    """Branch Health Intelligence — combined Economic + Social scoring."""

    bookings_dicts = [b.dict() for b in request.bookings]

    # Convert review overrides to plain dicts
    review_dict = {}
    if request.review_overrides:
        for name, data in request.review_overrides.items():
            review_dict[name] = data.dict()

    result = compute_branch_health(bookings_dicts, review_dict)
    return result
