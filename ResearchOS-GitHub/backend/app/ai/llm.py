"""Cloud LLM client. Never required — pipeline falls back if no key / errors."""

from __future__ import annotations

import json
from typing import Any

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("llm")


def llm_enabled() -> bool:
    return bool(settings.OPENAI_API_KEY)


async def complete_json(
    system: str,
    user: str,
    *,
    temperature: float = 0.2,
) -> tuple[dict[str, Any] | None, float]:
    """Return (parsed JSON, estimated USD cost). None on failure."""
    if not llm_enabled():
        return None, 0.0
    try:
        from openai import AsyncOpenAI
    except ImportError:
        return None, 0.0

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            temperature=temperature,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
    except Exception as exc:  # noqa: BLE001
        log.warning("llm.failed", error=str(exc))
        return None, 0.0

    usage = response.usage
    cost = 0.0
    if usage:
        # Approximate GPT-4o list pricing; honest estimate, not billing.
        cost = (usage.prompt_tokens * 2.5 + usage.completion_tokens * 10.0) / 1_000_000
    content = (response.choices[0].message.content or "").strip()
    try:
        return json.loads(content), cost
    except json.JSONDecodeError:
        log.warning("llm.invalid_json")
        return None, cost
