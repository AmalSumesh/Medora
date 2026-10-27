import json
import os
import time

from dotenv import load_dotenv
from groq import Groq
from groq import RateLimitError
from groq import BadRequestError


class AnswerValidator:

    def __init__(self):
        load_dotenv()

        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("GROQ_API_KEY is missing from .env")

        self.client = Groq(api_key=api_key)
        self.model = "qwen/qwen3.8-27b"
        self.fallback_models = [
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b"
        ]
        self._model_cooldowns = {}

    def validate(
        self,
        question_type,
        question,
        user_answer
    ):

        fast_result = self._fast_validate(
            question_type,
            question,
            user_answer
        )
        if fast_result is not None:
            return fast_result

        system_prompt = """
You validate whether a user's answer answers the current question.

Rules:
- Judge the answer using the question and question_type together.
- Accept concise, natural, synonymous, and colloquial answers.
- Accept short answers when they clearly provide the requested information.
- CRITICAL: If a question asked multiple things, and the user answers ANY of them, valid=true. NEVER reject an answer merely because it answered only one part of a multi-part question.
- Accept partial answers if they answer any of the requested information.
- Do not require the same wording as the question.
- Do not infer facts that the user did not state.
- Do not medically interpret the answer.
- Do not reject an answer merely because it is brief.
- If the answer provides the requested information, valid=true.
- If it is completely unrelated or does not provide the requested information,
  valid=false.
- normalized_answer must preserve the user's meaning and add no facts.
- For a valid answer, clarification must be empty.
- For an invalid answer, clarification must ask only for the missing
  information.

Return exactly one JSON object.
"""

        user_prompt = f"""
QUESTION TYPE: {question_type}

QUESTION: {question}

USER ANSWER: {user_answer}

Determine whether the answer directly provides the information
requested by the question.

Return:
- valid
- normalized_answer
- clarification
"""

        try:
            response = self._call_groq(
                system_prompt,
                user_prompt
            )

            content = response.choices[0].message.content

            if not content:
                return {
                    "valid": True,
                    "normalized_answer": user_answer.strip(),
                    "clarification": ""
                }

            result = json.loads(content)
            return result

        except Exception:
            # Fallback safely rather than failing the entire triage request
            return {
                "valid": True,
                "normalized_answer": user_answer.strip(),
                "clarification": ""
            }

    def _fast_validate(self, question_type, question, user_answer):
        import re
        cleaned = user_answer.strip().lower()
        if not cleaned:
            return None

        # Guard against known non-medical off-topic inputs
        off_topic_words = [
            "kohli", "cricket", "python", "code", "programming", "movie",
            "football", "trump", "biden", "song", "weather", "game", "score"
        ]
        if any(w in cleaned for w in off_topic_words):
            return None

        q_lower = (question or "").lower()
        q_type_lower = (question_type or "").lower()

        # 1. Direct Yes/No or presence/absence answers
        yes_patterns = {
            "yes", "yeah", "yep", "i do", "yes i do", "yes slightly",
            "slightly", "a bit", "a little", "positive", "i have",
            "yes severe", "severe", "moderate", "mild", "a lot"
        }
        no_patterns = {
            "no", "nope", "nah", "negative", "not really", "none",
            "no fever", "no cough", "no pain", "no headache",
            "dont have", "never", "nothing", "no stiffness", "no rash"
        }
        if cleaned in yes_patterns or cleaned in no_patterns:
            return {
                "valid": True,
                "normalized_answer": user_answer.strip(),
                "clarification": ""
            }

        # 2. Demographic / Age / Sex answers (handles "22M", "22 male", "22", "30f")
        if (
            q_type_lower == "demographic"
            or "how old" in q_lower
            or "age" in q_lower
            or "sex" in q_lower
        ):
            # Matches 22m, 22f, 22 male, 22 female, 22 years old, 22
            if re.match(r"^(\d{1,3})\s*(m|f|male|female|years?(\s*old)?|yo|y/o)?$", cleaned):
                return {
                    "valid": True,
                    "normalized_answer": user_answer.strip(),
                    "clarification": ""
                }
            if cleaned in {"male", "female", "man", "woman", "boy", "girl", "m", "f"}:
                return {
                    "valid": True,
                    "normalized_answer": user_answer.strip(),
                    "clarification": ""
                }

        # 3. Pain Character or Description (e.g. constant pressure, throbbing, sharp, dull)
        pain_types = {
            "constant pressure", "throbbing", "pressure", "sharp", "dull",
            "stabbing", "burning", "aching", "tight", "tightness", "sore",
            "pounding", "splitting"
        }
        if any(pt in cleaned for pt in pain_types):
            return {
                "valid": True,
                "normalized_answer": user_answer.strip(),
                "clarification": ""
            }

        # 4. Severity scale (1 to 10 or 1-10 rating)
        if "scale" in q_lower or "severe" in q_lower or "1 to 10" in q_lower or "1-10" in q_lower:
            if re.match(r"^([0-9]|10)(\s*/\s*10)?$", cleaned):
                return {
                    "valid": True,
                    "normalized_answer": user_answer.strip(),
                    "clarification": ""
                }

        # 5. Duration answers
        if q_type_lower == "duration" or "how long" in q_lower:
            duration_indicators = [
                "day", "days", "week", "weeks", "month", "months",
                "hour", "hours", "yesterday", "today", "since",
                "for", "about", "around"
            ]
            if any(ind in cleaned for ind in duration_indicators):
                return {
                    "valid": True,
                    "normalized_answer": user_answer.strip(),
                    "clarification": ""
                }

        # 6. Temperature / Numeric measurements
        if "temperature" in q_lower or "fever" in q_lower:
            if re.match(r"^(\d{2,3}(\.\d+)?)\s*(f|c|degrees|deg|°f|°c)?$", cleaned):
                return {
                    "valid": True,
                    "normalized_answer": user_answer.strip(),
                    "clarification": ""
                }

        return None

    def _call_groq(self, system_prompt, user_prompt):
        now = time.time()
        candidates = [self.model] + [m for m in self.fallback_models if m != self.model]
        models_to_try = [m for m in candidates if now >= self._model_cooldowns.get(m, 0)]
        if not models_to_try:
            models_to_try = candidates

        for current_model in models_to_try:

            for attempt in range(2):

                try:

                    return self.client.chat.completions.create(
                        model=current_model,
                        messages=[
                            {
                                "role": "system",
                                "content": system_prompt
                            },
                            {
                                "role": "user",
                                "content": user_prompt
                            }
                        ],
                        temperature=0,
                        max_tokens=300,
                        response_format={
                            "type": "json_schema",
                            "json_schema": {
                                "name": "answer_validation",
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "valid": {
                                            "type": "boolean"
                                        },
                                        "normalized_answer": {
                                            "type": "string"
                                        },
                                        "clarification": {
                                            "type": "string"
                                        }
                                    },
                                    "required": [
                                        "valid",
                                        "normalized_answer",
                                        "clarification"
                                    ],
                                    "additionalProperties": False
                                }
                            }
                        }
                    )

                except RateLimitError:

                    self._model_cooldowns[current_model] = time.time() + 300
                    break

                except BadRequestError as error:

                    message = str(error)

                    if "json_validate_failed" not in message:
                        raise

                    if attempt == 1:
                        break

                    time.sleep(0.2)

        raise RuntimeError(
            "AnswerValidator request failed."
        )