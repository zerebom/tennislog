import logging
import time

from google import genai
from google.genai import types
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class GeminiLLMProvider[T: BaseModel]:
    def __init__(
        self,
        model: str,
        prompt: str,
        output_schema: type[T],
        temperature: float = 0.3,
    ):
        self.model = model
        self.prompt = prompt
        self.output_schema = output_schema
        self.client = genai.Client()
        self._config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=output_schema,
            temperature=temperature,
            max_output_tokens=4096,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        )

    def _format_prompt(self, prompt_args: dict[str, object]) -> str:
        if not prompt_args:
            return self.prompt
        return self.prompt.format_map(prompt_args)

    def _extract_parsed(self, response: types.GenerateContentResponse) -> T:
        if not response.candidates or len(response.candidates) == 0:
            msg = "No candidates in LLM response"
            raise ValueError(msg)
        candidate = response.candidates[0]
        if candidate.finish_reason not in (
            types.FinishReason.STOP,
            types.FinishReason.MAX_TOKENS,
            "STOP",
            "MAX_TOKENS",
        ):
            msg = f"LLM response finished with reason: {candidate.finish_reason}"
            raise ValueError(msg)
        if response.text is None:
            msg = "LLM response text is None"
            raise ValueError(msg)
        metadata = response.usage_metadata
        if metadata:
            logger.info(
                "tokens: in=%d out=%d",
                metadata.prompt_token_count or 0,
                metadata.candidates_token_count or 0,
            )
        return self.output_schema.model_validate_json(response.text)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def async_invoke(self, prompt_args: dict[str, object]) -> T:
        formatted = self._format_prompt(prompt_args)
        logger.info("LLM invoke: model=%s, prompt_chars=%d", self.model, len(formatted))
        t0 = time.perf_counter()
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=formatted,
            config=self._config,
        )
        elapsed = time.perf_counter() - t0
        logger.info("LLM invoke completed in %.1fs", elapsed)
        return self._extract_parsed(response)
