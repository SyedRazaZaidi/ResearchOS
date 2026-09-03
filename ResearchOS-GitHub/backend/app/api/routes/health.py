from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def api_status() -> dict[str, str]:
    return {
        "status": "operational",
        "message": "ResearchOS API — evidence before generation.",
    }
