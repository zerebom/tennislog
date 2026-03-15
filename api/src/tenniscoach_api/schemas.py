from __future__ import annotations

from pydantic import BaseModel, Field


class VideoSuggestion(BaseModel):
    title: str
    reason: str


class CoachingOutput(BaseModel):
    summary: str
    analysis: str
    suggestions: list[str]
    video_suggestions: list[VideoSuggestion] = Field(default_factory=list)
    pattern_insights: str | None = None


class SessionInput(BaseModel):
    date: str
    session_type: str
    memo: str
    score: str | None = None
    result: str | None = None
    opponent: str | None = None
    partner: str | None = None


class PastContext(BaseModel):
    session: SessionInput
    coaching: CoachingOutput | None = None


class DiagnosisInput(BaseModel):
    experience: str
    strength: str
    loss_pattern: str
    play_style: str
    goal: str


class DiagnosisOutput(BaseModel):
    type_name: str
    summary: str
    strengths: str
    challenge: str
    first_suggestion: str


class UserProfileContext(BaseModel):
    diagnosis: DiagnosisInput | None = None


class CoachingRequest(BaseModel):
    session: SessionInput
    past_sessions: list[PastContext] = Field(default_factory=list)
    user_profile: UserProfileContext | None = None


class CoachingApiResponse(BaseModel):
    coaching: CoachingOutput


class DiagnosisRequest(BaseModel):
    diagnosis: DiagnosisInput


class DiagnosisApiResponse(BaseModel):
    result: DiagnosisOutput
