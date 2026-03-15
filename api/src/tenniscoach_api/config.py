import os
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str
    api_token: str
    gemini_model: str = "gemini-3.1-flash-lite-preview"
    allowed_origins: list[str] = field(default_factory=lambda: ["http://localhost:5173"])
    project_root: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent)

    @property
    def prompts_dir(self) -> Path:
        return self.project_root / "prompts"

    @property
    def contexts_dir(self) -> Path:
        return self.project_root / "contexts"

    @classmethod
    def from_env(cls) -> "Settings":
        origins_str = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
        return cls(
            gemini_api_key=os.environ["GEMINI_API_KEY"],
            api_token=os.environ["API_TOKEN"],
            gemini_model=os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite-preview"),
            allowed_origins=[o.strip() for o in origins_str.split(",")],
        )
