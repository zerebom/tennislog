from pathlib import Path

import toml
from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str


class Prompt(BaseModel):
    messages: list[Message]


class CoachingPromptConfig(BaseModel):
    coaching: Prompt

    @classmethod
    def load(cls, toml_path: str | Path) -> "CoachingPromptConfig":
        data = toml.load(toml_path)
        return cls.model_validate(data)


class DiagnosisPromptConfig(BaseModel):
    diagnosis: Prompt

    @classmethod
    def load(cls, toml_path: str | Path) -> "DiagnosisPromptConfig":
        data = toml.load(toml_path)
        return cls.model_validate(data)


def load_tennis_knowledge(contexts_dir: str | Path) -> str:
    path = Path(contexts_dir) / "tennis_knowledge.txt"
    return path.read_text(encoding="utf-8")


def build_messages(
    config: CoachingPromptConfig,
    *,
    tennis_knowledge: str,
    past_context: str,
    session_type: str,
    date: str,
    memo: str,
    score: str | None = None,
    result: str | None = None,
    opponent: str | None = None,
) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []
    for msg in config.coaching.messages:
        content = msg.content.format(
            tennis_knowledge=tennis_knowledge,
            past_context=past_context or "（初回のため過去データなし）",  # noqa: RUF001
            session_type=session_type,
            date=date,
            memo=memo,
            score=score or "なし",
            result=result or "不明",
            opponent=opponent or "不明",
        )
        messages.append({"role": msg.role, "content": content})
    return messages
