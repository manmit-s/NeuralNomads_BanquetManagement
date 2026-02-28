from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class Booking(BaseModel):
    branch_id: str
    branch_name: str
    revenue: float
    capacity: int
    booked: int

class ChatMessage(BaseModel):
    role: str
    content: str
    
class AIRequest(BaseModel):
    role: str = Field(..., description="'head' or 'branch'")
    message: str
    bookings: List[Booking]
    chat_history: Optional[List[ChatMessage]] = []

class BranchSummary(BaseModel):
    branch_name: str
    revenue: float
    revenue_share: float
    occupancy: float
    performance_score: float
    is_weak: bool
    is_dominant: bool
    suggestion: str

class AIResponse(BaseModel):
    total_revenue: float
    weak_branch: str
    strong_branch: str
    branch_summary: List[BranchSummary]
    ai_response: str
