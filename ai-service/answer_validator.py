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
        self.model = "openai/gpt-oss-20b"

    def validate(
        self,
        question_type,
        question,
        user_answer
    ):

        system_prompt = """
You validate whether a user's answer answers the current question.

Rules:
- Judge the answer using the question and question_type together.
- Accept concise, natural, synonymous, and colloquial answers.
- Accept short answers when they clearly provide the requested information.
- Accept partial answers if they answer the requested information.
- Do not require the same wording as the question.
- Do not infer facts that the user did not state.
- Do not medically interpret the answer.
- Do not reject an answer merely because it is brief.
- If the answer provides the requested information, valid=true.
- If it is unrelated or does not provide the requested information,
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

        response = self._call_groq(
            system_prompt,
            user_prompt
        )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError(
                "AnswerValidator received an empty response."
            )

        try:
            result = json.loads(content)

        except json.JSONDecodeError as error:
            raise RuntimeError(
                f"AnswerValidator returned invalid JSON: {content}"
            ) from error

        return result

    def _call_groq(self, system_prompt, user_prompt):

        for attempt in range(3):

            try:

                return self.client.chat.completions.create(
                    model=self.model,
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

                if attempt == 2:
                    raise

                time.sleep(1.5)

            except BadRequestError as error:

                message = str(error)

                if "json_validate_failed" not in message:
                    raise

                if attempt == 2:
                    raise

                time.sleep(0.5)

        raise RuntimeError(
            "AnswerValidator request failed."
        )