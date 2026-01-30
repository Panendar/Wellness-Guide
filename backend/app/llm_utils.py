"""
LLM Utilities for AI-powered recommendations
Handles interaction with Google Gemini API
"""

import os
from typing import List

async def get_gemini_recommendations(goal: str, yogasana_ids: List[str]) -> List[str]:
    """
    Get yoga recommendations from Gemini API based on user goal.
    
    Args:
        goal: User's yoga goal/intention
        yogasana_ids: List of available yogasana IDs to choose from
        
    Returns:
        List of recommended yogasana IDs
    """
    import aiohttp
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment variables")
    
    # Build the prompt
    prompt = f"""Based on the user's goal: "{goal}", recommend 5–6 suitable yogasanas ONLY from the following list of IDs: {', '.join(yogasana_ids)}.

Return ONLY the IDs of the recommended yogasanas as a comma-separated list (no explanations)."""
    
    # Try different model versions
    models = [
        "gemini-2.5-flash",
        "gemini-1.5-pro",
        "gemini-pro"
    ]
    
    url = "https://generativelanguage.googleapis.com/v1beta/models"
    headers = {"Content-Type": "application/json"}
    
    for model in models:
        try:
            async with aiohttp.ClientSession() as session:
                api_url = f"{url}/{model}:generateContent?key={api_key}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": prompt}
                            ]
                        }
                    ]
                }
                
                async with session.post(api_url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        
                        # Parse response to extract yogasana IDs
                        recommendations = extract_recommendations(text, yogasana_ids)
                        if recommendations:
                            return recommendations
                    elif response.status == 404:
                        # Model not found, try next one
                        continue
                    elif response.status == 403:
                        # API key issue, try next model or raise
                        raise ValueError("API key invalid or has insufficient permissions")
                    else:
                        error_data = await response.json()
                        error_msg = error_data.get("error", {}).get("message", f"HTTP {response.status}")
                        raise ValueError(error_msg)
        except Exception as e:
            print(f"Error with {model}: {str(e)}")
            continue
    
    raise ValueError("Could not get recommendations from any Gemini model")

def extract_recommendations(text: str, allowed_ids: List[str]) -> List[str]:
    """
    Extract recommended yogasana IDs from Gemini response.
    
    Args:
        text: Response text from Gemini
        allowed_ids: List of valid yogasana IDs
        
    Returns:
        List of extracted yogasana IDs
    """
    if not text or not allowed_ids:
        return []
    
    allowed_set = set(allowed_ids)
    
    # Clean the text
    cleaned = text.replace("```", " ").replace("\n", " ").replace("\r", " ")
    
    # Split by comma, semicolon, or space
    parts = [p.strip() for p in cleaned.replace(";", ",").split(",")]
    
    recommendations = []
    for part in parts:
        part = part.strip()
        # Remove common prefixes
        part = part.lstrip("-* ")
        
        if part in allowed_set and part not in recommendations:
            recommendations.append(part)
    
    return recommendations
