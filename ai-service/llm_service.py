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
        self.model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
        self.fallback_model = "openai/gpt-oss-20b"

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

WHEN INITIAL TRIAGE ASSESSMENT IS REACHED (FIRST TIME):

Return:
- status = triage_complete
- question_type = null
- next_question = null
- an appropriate risk level (low, moderate, urgent, emergency)
- a clear recommendation summarizing the primary triage action
- a concise reason explaining the clinical rationale
- only evidence-supported possible conditions with evidence IDs
- only sources present in medical_context

WHEN HANDLING FOLLOW-UP QUESTIONS (TRIAGE ALREADY COMPLETED):

If triage is already completed (triage_state.is_completed is true or previous_recommendation exists) and the user sends a follow-up query, clarification, update, or question:
Return:
- status = follow_up
- question_type = null
- next_question = null
- an appropriate risk level (escalate to urgent/emergency if new warning signs or red flags are reported)
- recommendation = directly, helpfully, and empathetically answer the user's specific follow-up question or comment. NEVER repeat the previous recommendation verbatim.
- reason = concise clinical explanation addressing their inquiry
- possible_conditions = []
- sources = []

MEDICAL SCOPE AND DOMAIN BOUNDARIES (CRITICAL):
- You are exclusively Medora AI, an evidence-based clinical symptom triage and medical guidance assistant.
- You must ONLY assist with physical symptoms, health concerns, medical triage, and clinical follow-up guidance.
- You must NEVER answer questions about non-medical or off-topic subjects, including but not limited to:
  * Computer programming, writing code, software development, debugging (e.g. Python, JavaScript, HTML).
  * Sports, matches, athletes, scores, tournaments (e.g. cricket, Kohli, football, basketball).
  * Entertainment, movies, celebrities, pop culture, music, games.
  * Mathematics, homework, science, history, finance, travel, recipes, or general knowledge trivia.
- When the user asks a non-medical or off-topic question:
  * You MUST politely refuse to answer the non-medical topic.
  * State clearly that you are Medora AI, a clinical symptom triage assistant, and are restricted to medical and health guidance only.
  * If the user previously reported severe/emergency symptoms (such as chest pain, shortness of breath, etc.), remind them that their medical situation is serious and urge them to remain focused on receiving professional medical attention.
  * If post-triage: status = "follow_up", risk_level = current risk level, recommendation = polite refusal and redirection back to health/triage, reason = "Non-medical inquiry declined; redirected to clinical health triage.", possible_conditions = [], sources = [].
  * If initial intake: status = "needs_more_information", question_type = "symptom", next_question = "I am Medora AI, a clinical symptom triage assistant. I can only assist with physical symptoms and medical concerns. Please describe what health symptoms you are experiencing.", recommendation = null, possible_conditions = [], sources = [].

CRITICAL RULE FOR FOLLOW-UP QUESTIONS:
1. When status is "follow_up", answer the user's question directly in the "recommendation" field like an expert clinical assistant.
2. Never regenerate a new formal triage assessment or condition checklist for simple follow-up dialogue.
3. If the user reports new or worsening emergency red flags (e.g. loss of consciousness, severe chest pressure, severe shortness of breath), escalate risk_level to "emergency" and urge immediate emergency care.

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

Instructions:
1. DOMAIN CHECK: Is the user's message non-medical (e.g. sports like cricket/Kohli, programming/coding like Python, math, trivia, general non-health chat)?
   - If NON-MEDICAL post-triage: return status: "follow_up", decline the off-topic request politely, remind them you are Medora AI (a medical symptom triage assistant), and redirect them back to their medical care/symptoms in "recommendation". Set possible_conditions: [].
   - If NON-MEDICAL at initial intake: return status: "needs_more_information", question_type: "symptom", and ask them to describe their medical symptoms in "next_question".
2. If MEDICAL and triage is in progress: ask ONE focused question if missing information could materially change urgency (status: needs_more_information). Otherwise complete the initial triage (status: triage_complete).
3. If MEDICAL and triage was ALREADY completed: return status: "follow_up". Directly and conversationally answer their health-related question in the "recommendation" field. Do NOT repeat the previous recommendation verbatim. Set possible_conditions: [].
4. If new severe symptoms or emergency red flags are mentioned, escalate the risk level.

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

        models_to_try = [self.model, self.fallback_model] if self.model != self.fallback_model else [self.model]

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
                                                "triage_complete",
                                                "follow_up"
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

                    if current_model == self.fallback_model or attempt == 1:
                        break

                    time.sleep(0.5)

                except BadRequestError as error:

                    message = str(error)

                    if "json_validate_failed" not in message:
                        raise

                    if attempt == 1:
                        break

                    time.sleep(0.5)

        raise RuntimeError(
            "Groq request failed on all available models."
        )