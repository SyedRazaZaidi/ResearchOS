from fastapi import APIRouter

from app.api.routes import auth, documents, evaluation, health, research

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(research.router, prefix="/research", tags=["research"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["evaluation"])
