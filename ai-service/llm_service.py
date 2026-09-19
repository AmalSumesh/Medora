import json
import os
import time

from dotenv import load_dotenv
from groq import Groq
from groq import RateLimitError
from groq import BadRequestError


class LLMService:

    def __init__(self):
        load_dotenv()

        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("GROQ_API_KEY is missing from .env")

        self.client = Groq(api_key=api_key)
        self.model = "openai/gpt-oss-120b"

    def generate_triage_response(
        self,
        current_message,
        triage_state,
        medical_context
    ):

        system_prompt = """
You are HealthTriage, a dynamic symptom triage assistant.

Your purpose is to progressively collect the minimum amount of
high-value information needed to assess the urgency of the user's
symptoms and provide an appropriate triage recommendation.

You are not a doctor and must not claim to diagnose the user.

CORE TRIAGE BEHAVIOR:

- There is no fixed questionnaire or predetermined question order.
- Reassess the entire case after every user answer.
- Treat the initial symptom as the primary problem.
- Treat all validated answers as established facts.
- Use established facts when deciding what information is still missing.
- Never ask for information that is already known.
- Never repeat a question that has already been asked.
- Ask exactly ONE question at a time.
- Each question must request ONE specific piece of information.
- Do not combine multiple questions into one question.
- Prefer questions whose answers could meaningfully change the urgency
  or next triage decision.
- Avoid low-value questions that are unlikely to affect the decision.
- Do not continue questioning once enough information is available
  for a reasonable triage recommendation.
- If an emergency warning sign is already established, prioritize
  appropriate urgent guidance rather than unnecessary questioning.

QUESTION SELECTION:

At every turn, consider:

1. The initial symptom.
2. All established answers.
3. Questions already asked.
4. Retrieved medical evidence.
5. Potential serious warning signs relevant to the case.
6. Which missing piece of information could most change the triage.

Choose the single highest-value missing piece of information.

The next question should be specific to the user's actual presentation,
not selected from a generic checklist.

Do not ask questions simply because they are commonly asked for a
symptom. Ask them only when they are relevant to this case and could
materially affect the triage decision.

If several questions could be useful, ask the one with the greatest
potential to change the urgency first.

DEMOGRAPHIC CONTEXT:

- Establish the user's age early when it has not already been provided,
  because age can materially affect triage decisions.
- Establish sex early when it could materially affect the triage of the
  presenting symptom.
- Do not ask for age or sex if that information is already established.
- Do not delay an important emergency-warning-sign question merely to
  collect age or sex.
- Do not ask demographic questions that are unlikely to affect the
  current triage.
- Once age or sex is established, treat it as known information and do
  not ask for it again.

SEX AND REPRODUCTIVE CONTEXT:

- Do not ask reproductive or sex-specific questions unless they are
  relevant to the user's presentation.
- If a sex-specific question could materially affect triage and sex is
  unknown, establish the relevant sex information before relying on
  sex-specific assumptions.
- Once the user establishes their sex or reproductive context, use that
  information consistently.
- Do not infer sex or reproductive status from names, symptoms, or
  unrelated information.

ANSWER INTERPRETATION:

- A concise answer can still be a complete answer.
- Interpret the user's response as an answer to the current question
  when it provides the requested information.
- Do not require a full sentence or specific wording.
- Do not add facts that the user did not provide.
- Do not reinterpret an answer as a new symptom unless the user clearly
  introduces new information.

MEDICAL GROUNDING:

- Use the retrieved medical evidence as the medical evidence available
  to you for this response.
- Possible conditions and medical explanations must be supported by the
  actual retrieved evidence, not merely by general medical knowledge.
- Do not include a condition solely because it is medically plausible.
- The content of the retrieved evidence must support the condition or
  explanation.
- A related source title alone is not sufficient evidence.
- If the retrieved evidence does not clearly support a possible
  condition, leave that condition out.
- If there is insufficient evidence to name possible conditions,
  return an empty possible_conditions array.
- Do not invent medical sources or cite sources that were not provided
  in medical_context.

EVIDENCE LINKING:

- Every possible condition must include one or more supporting
  evidence IDs.
- Use the evidence labels exactly as they appear in medical_context.
- In this system, valid evidence IDs are labeled "EVIDENCE 1",
  "EVIDENCE 2", "EVIDENCE 3", etc.
- Never use labels such as "SOURCE 1", "SOURCE 2", "SOURCE 3",
  "DOCUMENT 1", or any other invented label.
- Never invent, guess, rename, or modify an evidence ID.
- The cited evidence must directly support the associated condition.
- Do not associate a condition with evidence merely because the source
  title appears relevant.
- Do not include a possible condition if no retrieved evidence directly
  supports it.

WHEN MORE INFORMATION IS NEEDED:

Return:
- status = needs_more_information
- risk_level = unknown
- question_type = the ONE missing information category
- next_question = exactly ONE focused question
- possible_conditions = []
- recommendation = null
- sources = []

WHEN TRIAGE IS COMPLETE:

Return:
- status = triage_complete
- question_type = null
- next_question = null
- an appropriate risk level
- a clear recommendation
- a concise reason explaining the triage decision
- only evidence-supported possible conditions
- only sources present in medical_context
- evidence IDs for every possible condition

OUTPUT:

Return exactly ONE valid JSON object matching the required schema.

Do not return markdown.
Do not return explanations outside the JSON object.
"""
        state_text = json.dumps(
            triage_state,
            ensure_ascii=False
        )

        context_text = medical_context or "No medical context."

        user_prompt = f"""
USER MESSAGE:
{current_message}

TRIAGE STATE:
{state_text}

MEDICAL CONTEXT:
{context_text}

Reassess the case from the beginning using all established
information.

Ask exactly ONE focused question only if that information could
materially affect the triage.

Otherwise complete the triage.

Before asking any question, check:
1. Is this information already known?
2. Has this question already been asked?
3. Is this question relevant to the primary symptom?
4. Could the answer materially change the triage?
5. Is the question appropriate for the user's established sex?
6. Can the question be asked as ONE specific question?

Before including each possible condition, check:
1. Is the condition supported by the actual content of the retrieved evidence?
2. Which exact EVIDENCE label supports it?
3. Does that exact label exist in medical_context?
4. Use the label exactly as provided. Never replace "EVIDENCE" with
   any otherlabel.
5. If no evidence directly supports the condition, leave it out.

Do not include a condition simply because it is medically plausible.

Return exactly ONE valid JSON object matching the required schema.
"""

        response = self._call_groq(
            system_prompt,
            user_prompt
        )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError(
                "Groq returned an empty response."
            )

        try:
            return json.loads(content)

        except json.JSONDecodeError as error:
            raise RuntimeError(
                f"Groq returned invalid JSON: {content}"
            ) from error

    def _call_groq(
        self,
        system_prompt,
        user_prompt
    ):

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
                    max_tokens=1200,
                    response_format={
                        "type": "json_schema",
                        "json_schema": {
                            "name": "triage_response",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "status": {
                                        "type": "string",
                                        "enum": [
                                            "needs_more_information",
                                            "triage_complete"
                                        ]
                                    },
                                    "risk_level": {
                                        "type": "string",
                                        "enum": [
                                            "unknown",
                                            "low",
                                            "moderate",
                                            "urgent",
                                            "emergency"
                                        ]
                                    },
                                    "question_type": {
                                        "type": [
                                            "string",
                                            "null"
                                        ]
                                    },
                                    "next_question": {
                                        "type": [
                                            "string",
                                            "null"
                                        ]
                                    },
                                    "possible_conditions": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {
                                                    "type": "string"
                                                },
                                                "evidence_ids": {
                                                    "type": "array",
                                                    "items": {
                                                        "type": "string"
                                                    },
                                                    "minItems": 1
                                                }
                                            },
                                            "required": [
                                                "name",
                                                "evidence_ids"
                                            ],
                                            "additionalProperties": False
                                        },
                                        "maxItems": 5
                                    },
                                    "recommendation": {
                                        "type": [
                                            "string",
                                            "null"
                                        ]
                                    },
                                    "reason": {
                                        "type": "string"
                                    },
                                    "sources": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "title": {
                                                    "type": "string"
                                                },
                                                "url": {
                                                    "type": "string"
                                                }
                                            },
                                            "required": [
                                                "title",
                                                "url"
                                            ],
                                            "additionalProperties": False
                                        },
                                        "maxItems": 4
                                    }
                                },
                                "required": [
                                    "status",
                                    "risk_level",
                                    "question_type",
                                    "next_question",
                                    "possible_conditions",
                                    "recommendation",
                                    "reason",
                                    "sources"
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
            "Groq request failed."
        )