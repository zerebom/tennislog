import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable

from tenniscoach_api.auth import verify_token
from tenniscoach_api.config import Settings
from tenniscoach_api.generator import generate_coaching_async, generate_diagnosis_async
from tenniscoach_api.schemas import (
    CoachingApiResponse,
    CoachingRequest,
    DiagnosisApiResponse,
    DiagnosisRequest,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

settings = Settings.from_env()

app = FastAPI(title="TennisCoach API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/coaching", response_model=CoachingApiResponse)
async def coaching(req: CoachingRequest, _: None = Depends(verify_token)) -> CoachingApiResponse:
    try:
        result = await generate_coaching_async(req.session, req.past_sessions, req.user_profile, settings=settings)
        return CoachingApiResponse(coaching=result)
    except ResourceExhausted as err:
        raise HTTPException(429, detail="Gemini API rate limit exceeded. Please try again later.") from err
    except ServiceUnavailable as err:
        raise HTTPException(503, detail="Gemini API is temporarily unavailable.") from err
    except ValueError as e:
        logger.exception("Coaching generation failed")
        raise HTTPException(500, detail=f"Coaching generation failed: {e}") from e


@app.post("/api/diagnosis", response_model=DiagnosisApiResponse)
async def diagnosis(req: DiagnosisRequest, _: None = Depends(verify_token)) -> DiagnosisApiResponse:
    try:
        result = await generate_diagnosis_async(req.diagnosis, settings=settings)
        return DiagnosisApiResponse(result=result)
    except ResourceExhausted as err:
        raise HTTPException(429, detail="Gemini API rate limit exceeded. Please try again later.") from err
    except ServiceUnavailable as err:
        raise HTTPException(503, detail="Gemini API is temporarily unavailable.") from err
    except ValueError as e:
        logger.exception("Diagnosis generation failed")
        raise HTTPException(500, detail=f"Diagnosis generation failed: {e}") from e
