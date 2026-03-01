from typing import List, Optional, Dict, Any
from .schemas import Booking, BranchSummary

def calculate_analytics(bookings: List[Booking]) -> Dict[str, Any]:
    if not bookings:
        return {
            "total_revenue": 0.0,
            "weak_branch": "",
            "strong_branch": "",
            "branch_summary": []
        }

    total_revenue = sum(b.revenue for b in bookings)
    
    branch_summaries = []
    
    for b in bookings:
        occupancy = (b.booked / b.capacity) * 100 if b.capacity > 0 else 0
        revenue_share = (b.revenue / total_revenue) * 100 if total_revenue > 0 else 0
        performance_score = (revenue_share * 0.6) + (occupancy * 0.4)
        
        # Rules
        is_weak = revenue_share < 20
        is_dominant = revenue_share > 40
        
        suggestion = "Keep up the good work."
        if occupancy > 80:
            suggestion = "Suggest price increase."
        elif occupancy < 50:
            suggestion = "Suggest marketing push."
            
        branch_summaries.append(BranchSummary(
            branch_name=b.branch_name,
            revenue=b.revenue,
            revenue_share=revenue_share,
            occupancy=occupancy,
            performance_score=performance_score,
            is_weak=is_weak,
            is_dominant=is_dominant,
            suggestion=suggestion
        ))
    
    # Identify weak and strong branch based on performance score
    sorted_branches = sorted(branch_summaries, key=lambda x: x.performance_score)
    weak_branch = sorted_branches[0].branch_name if sorted_branches else ""
    strong_branch = sorted_branches[-1].branch_name if sorted_branches else ""
    
    return {
        "total_revenue": total_revenue,
        "weak_branch": weak_branch,
        "strong_branch": strong_branch,
        "branch_summary": branch_summaries
    }
