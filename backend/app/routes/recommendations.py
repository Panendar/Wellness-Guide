from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
import os

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

class RecommendationRequest(BaseModel):
    goal: str
    yogasana_ids: List[str]

class RecommendationResponse(BaseModel):
    recommendations: List[str]

@router.post("/", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get AI-powered yoga recommendations based on user goal.
    
    This endpoint requires a GEMINI_API_KEY environment variable.
    If not available, returns a basic recommendation based on the provided yogasana_ids.
    """
    from ..llm_utils import get_gemini_recommendations
    
    try:
        # Try to get recommendations from Gemini API
        recommendations = await get_gemini_recommendations(
            goal=request.goal,
            yogasana_ids=request.yogasana_ids
        )
        return RecommendationResponse(recommendations=recommendations)
    except Exception as e:
        # Fallback: return first few yogasanas
        print(f"Warning: Could not get Gemini recommendations: {str(e)}")
        fallback_recommendations = request.yogasana_ids[:3] if request.yogasana_ids else []
        return RecommendationResponse(recommendations=fallback_recommendations)
