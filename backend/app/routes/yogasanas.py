"""
Yogasana search and filter endpoints
"""
from fastapi import APIRouter, Query
from typing import List, Optional
import json

router = APIRouter(prefix="/api/v1", tags=["yogasanas"])


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def load_yogasanas_data() -> List[dict]:
    """Load yogasanas data from JSON file"""
    try:
        with open("src/data/yogasanas.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"Error loading yogasanas: {e}")
        return []


def add_difficulty_metadata(yogasanas: List[dict]) -> List[dict]:
    """Add difficulty level and duration to yogasanas based on name"""
    difficulty_map = {
        "child pose": "beginner",
        "mountain pose": "beginner",
        "cat pose": "beginner",
        "cow pose": "beginner",
        "downward dog": "beginner",
        "warrior i": "intermediate",
        "warrior ii": "intermediate",
        "tree pose": "intermediate",
        "triangle pose": "intermediate",
        "headstand": "advanced",
        "handstand": "advanced",
        "scorpion pose": "advanced",
        "peacock pose": "advanced",
    }
    
    duration_map = {
        "child pose": 5,
        "mountain pose": 3,
        "cat pose": 5,
        "cow pose": 5,
        "downward dog": 5,
        "warrior i": 8,
        "warrior ii": 8,
        "tree pose": 6,
        "triangle pose": 8,
        "headstand": 10,
        "handstand": 10,
        "scorpion pose": 12,
        "peacock pose": 12,
    }

    body_focus_map = {
        "child pose": ["back", "shoulders", "neck"],
        "mountain pose": ["legs", "core", "posture"],
        "cat pose": ["back", "spine", "shoulders"],
        "cow pose": ["back", "abdomen", "chest"],
        "downward dog": ["legs", "arms", "shoulders", "back"],
        "warrior i": ["legs", "core", "balance"],
        "warrior ii": ["legs", "hips", "shoulders"],
        "tree pose": ["legs", "balance", "core"],
        "triangle pose": ["legs", "hamstring", "shoulders"],
        "headstand": ["core", "shoulders", "arms"],
        "handstand": ["arms", "shoulders", "core"],
        "scorpion pose": ["back", "spine", "shoulders"],
        "peacock pose": ["arms", "core", "wrists"],
    }

    for yoga in yogasanas:
        name = yoga.get("name", "").lower()
        yoga["difficulty"] = difficulty_map.get(name, "intermediate")
        yoga["duration"] = duration_map.get(name, 5)
        yoga["body_focus"] = body_focus_map.get(name, ["general"])

    return yogasanas


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class YogasanaResponse:
    """Response model for yogasana"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/yogasanas/all")
def get_all_yogasanas():
    """
    Get all available yogasanas
    """
    yogasanas = load_yogasanas_data()
    yogasanas = add_difficulty_metadata(yogasanas)
    return {
        "count": len(yogasanas),
        "yogasanas": yogasanas
    }


@router.get("/yogasanas/search")
def search_yogasanas(
    q: str = Query(..., min_length=1, description="Search query (name or benefits)"),
    limit: int = Query(50, ge=1, le=500)
):
    """
    Search yogasanas by name or benefits
    
    Query Parameters:
    - q: Search term (required)
    - limit: Maximum results to return (default: 50)
    """
    yogasanas = load_yogasanas_data()
    yogasanas = add_difficulty_metadata(yogasanas)

    search_term = q.lower()
    results = []

    for yoga in yogasanas:
        # Search in name
        if search_term in yoga.get("name", "").lower():
            results.append(yoga)
            continue

        # Search in benefits
        benefits = yoga.get("benefits", "").lower()
        if search_term in benefits:
            results.append(yoga)
            continue

        # Search in description if exists
        description = yoga.get("description", "").lower()
        if search_term in description:
            results.append(yoga)

    return {
        "query": q,
        "count": len(results[:limit]),
        "total_found": len(results),
        "results": results[:limit]
    }


@router.get("/yogasanas/filter")
def filter_yogasanas(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: beginner, intermediate, advanced"),
    duration: Optional[int] = Query(None, description="Filter by max duration in minutes"),
    body_focus: Optional[str] = Query(None, description="Filter by body focus area"),
    limit: int = Query(50, ge=1, le=500)
):
    """
    Filter yogasanas by various criteria
    
    Query Parameters:
    - difficulty: 'beginner', 'intermediate', 'advanced' (optional)
    - duration: Maximum duration in minutes (optional)
    - body_focus: Body focus area like 'legs', 'back', 'core' (optional)
    - limit: Maximum results to return (default: 50)
    """
    yogasanas = load_yogasanas_data()
    yogasanas = add_difficulty_metadata(yogasanas)

    results = yogasanas

    # Filter by difficulty
    if difficulty:
        difficulty = difficulty.lower()
        if difficulty in ["beginner", "intermediate", "advanced"]:
            results = [y for y in results if y.get("difficulty") == difficulty]

    # Filter by duration
    if duration:
        results = [y for y in results if y.get("duration", 0) <= duration]

    # Filter by body focus
    if body_focus:
        body_focus = body_focus.lower()
        results = [y for y in results if body_focus in [f.lower() for f in y.get("body_focus", [])]]

    return {
        "filters": {
            "difficulty": difficulty,
            "duration": duration,
            "body_focus": body_focus
        },
        "count": len(results[:limit]),
        "total_found": len(results),
        "results": results[:limit]
    }


@router.get("/yogasanas/by-difficulty")
def get_by_difficulty(
    difficulty: str = Query(..., regex="^(beginner|intermediate|advanced)$")
):
    """
    Get all yogasanas of a specific difficulty level
    """
    yogasanas = load_yogasanas_data()
    yogasanas = add_difficulty_metadata(yogasanas)

    results = [y for y in yogasanas if y.get("difficulty") == difficulty]

    return {
        "difficulty": difficulty,
        "count": len(results),
        "yogasanas": results
    }
