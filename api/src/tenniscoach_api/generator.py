import logging

from tenniscoach_api.config import Settings
from tenniscoach_api.llm_provider import GeminiLLMProvider
from tenniscoach_api.prompt_loader import CoachingPromptConfig, DiagnosisPromptConfig, load_tennis_knowledge
from tenniscoach_api.schemas import (
    CoachingOutput,
    DiagnosisInput,
    DiagnosisOutput,
    PastContext,
    SessionInput,
    UserProfileContext,
)

logger = logging.getLogger(__name__)


def _format_past_context(past_sessions: list[PastContext]) -> str:
    if not past_sessions:
        return "（初回のため過去データなし）"  # noqa: RUF001
    lines: list[str] = []
    for i, ctx in enumerate(past_sessions, 1):
        s = ctx.session
        lines.append(f"### セッション {i}")
        lines.append(f"- 日付: {s.date}")
        lines.append(f"- 種別: {s.session_type}")
        if s.score:
            lines.append(f"- スコア: {s.score}")
        if s.result:
            lines.append(f"- 結果: {s.result}")
        lines.append(f"- メモ: {s.memo}")
        if ctx.coaching:
            lines.append(f"- AIコーチング要約: {ctx.coaching.summary}")
            if ctx.coaching.suggestions:
                lines.append("- 前回の提案:")
                for sug in ctx.coaching.suggestions:
                    lines.append(f"  - {sug}")
        lines.append("")
    return "\n".join(lines)


def _format_diagnosis(user_profile: UserProfileContext) -> str:
    if not user_profile.diagnosis:
        return ""
    d = user_profile.diagnosis
    return f"""## ユーザープロフィール
- テニス歴: {d.experience}
- 得意ショット: {d.strength}
- 負けパターン: {d.loss_pattern}
- プレー頻度: {d.play_style}
- 伸ばしたいこと: {d.goal}"""


async def generate_coaching_async(
    session: SessionInput,
    past_sessions: list[PastContext],
    user_profile: UserProfileContext | None,
    *,
    settings: Settings,
) -> CoachingOutput:
    config = CoachingPromptConfig.load(settings.prompts_dir / "coaching.toml")
    knowledge = load_tennis_knowledge(settings.contexts_dir)
    past_text = _format_past_context(past_sessions)
    diagnosis_text = _format_diagnosis(user_profile) if user_profile else ""

    system_msg = config.coaching.messages[0]
    system_prompt = system_msg.content.format(
        tennis_knowledge=knowledge,
        past_context=past_text,
    )
    if diagnosis_text:
        system_prompt += "\n\n" + diagnosis_text

    user_msg = config.coaching.messages[1]
    user_prompt = user_msg.content.format(
        session_type=session.session_type,
        date=session.date,
        memo=session.memo,
        score=session.score or "なし",
        result=session.result or "不明",
        opponent=session.opponent or session.partner or "不明",
    )

    full_prompt = system_prompt + "\n\n" + user_prompt

    provider = GeminiLLMProvider(
        model=settings.gemini_model,
        prompt=full_prompt,
        output_schema=CoachingOutput,
    )
    return await provider.async_invoke({})


async def generate_diagnosis_async(
    diagnosis_input: DiagnosisInput,
    *,
    settings: Settings,
) -> DiagnosisOutput:
    config = DiagnosisPromptConfig.load(settings.prompts_dir / "diagnosis.toml")
    knowledge = load_tennis_knowledge(settings.contexts_dir)

    system_msg = config.diagnosis.messages[0]
    system_prompt = system_msg.content.format(tennis_knowledge=knowledge)

    user_msg = config.diagnosis.messages[1]
    user_prompt = user_msg.content.format(
        experience=diagnosis_input.experience,
        strength=diagnosis_input.strength,
        loss_pattern=diagnosis_input.loss_pattern,
        play_style=diagnosis_input.play_style,
        goal=diagnosis_input.goal,
    )

    full_prompt = system_prompt + "\n\n" + user_prompt

    provider = GeminiLLMProvider(
        model=settings.gemini_model,
        prompt=full_prompt,
        output_schema=DiagnosisOutput,
    )
    return await provider.async_invoke({})
