from conversation_service import ConversationService
from rag_service import RAGService
from llm_service import LLMService
from answer_validator import AnswerValidator


class TriageFacade:

    def __init__(self):
        self.conversation_service = ConversationService()
        self.rag_service = RAGService()
        self.llm_service = LLMService()
        self.answer_validator = AnswerValidator()

    def create_session(self):
        return self.conversation_service.create_session()

    def chat(self, session_id, user_message):

        # Validate empty input
        if not user_message or not user_message.strip():
            return {
                "status": "needs_more_information",
                "risk_level": "unknown",
                "question_type": None,
                "next_question": "Please describe what symptoms you are experiencing.",
                "possible_conditions": [],
                "recommendation": None,
                "reason": "A symptom description is needed to begin triage.",
                "sources": []
            }

        user_message = user_message.strip()

        # Check whether the user is answering a previous question
        current_question = (
            self.conversation_service.get_current_question(session_id)
        )

        if current_question:

            validation = self.answer_validator.validate(
                question_type=current_question["type"],
                question=current_question["question"],
                user_answer=user_message
            )

            # Handle invalid answers
            if not validation["valid"]:

                self.conversation_service.add_message(
                    session_id,
                    "user",
                    user_message
                )

                clarification = validation.get("clarification")

                if not clarification:
                    clarification = (
                        f"Please answer this question directly: "
                        f"{current_question['question']}"
                    )

                self.conversation_service.add_message(
                    session_id,
                    "assistant",
                    clarification
                )

                return {
                    "status": "needs_more_information",
                    "risk_level": "unknown",
                    "question_type": current_question["type"],
                    "next_question": clarification,
                    "possible_conditions": [],
                    "recommendation": None,
                    "reason": (
                        "The previous response did not clearly answer "
                        "the current triage question."
                    ),
                    "sources": []
                }

            # Store the valid answer with question context so details are not lost
            normalized_answer = validation.get(
                "normalized_answer",
                user_message
            )
            info_key = f"{current_question['type']}: {current_question['question']}"
            self.conversation_service.add_answered_information(
                session_id,
                info_key,
                normalized_answer
            )

            self.conversation_service.clear_current_question(
                session_id
            )

        # Store the user's message
        self.conversation_service.add_message(
            session_id,
            "user",
            user_message
        )

        # Store the initial symptom
        initial_symptom = (
            self.conversation_service.get_initial_symptom(session_id)
        )

        if initial_symptom is None:

            initial_symptom = user_message

            self.conversation_service.set_initial_symptom(
                session_id,
                initial_symptom
            )

        # Get known information
        answered_information = (
            self.conversation_service.get_answered_information(
                session_id
            )
        )

        # Get questions already asked
        asked_questions = (
            self.conversation_service.get_asked_questions(
                session_id
            )
        )

        messages_history = self.conversation_service.get_messages(session_id)

        is_completed = self.conversation_service.is_completed(session_id)
        last_recommendation = self.conversation_service.get_last_recommendation(session_id)

        # Build compact triage state with full conversation history
        triage_state = {
            "initial_symptom": initial_symptom,
            "conversation_history": [
                {"role": m["role"], "content": m["content"]}
                for m in messages_history[-10:]
            ],
            "answered_information": answered_information,
            "asked_questions": [
                {
                    "type": item["type"],
                    "question": item["question"]
                }
                for item in asked_questions
            ],
            "current_question": None,
            "is_completed": is_completed,
            "previous_recommendation": last_recommendation
        }

        # Build a focused RAG query
        rag_query_parts = [
            f"Primary symptom: {initial_symptom}"
        ]

        for question_type, answer in answered_information.items():
            rag_query_parts.append(
                f"{question_type}: {answer}"
            )

        if is_completed:
            rag_query_parts.append(f"Follow-up inquiry: {user_message}")

        rag_query = " | ".join(rag_query_parts)

        # Retrieve relevant medical context
        medical_context = self.rag_service.retrieve_context(
            rag_query,
            limit=4
        )

        # Generate the next triage action
        result = self.llm_service.generate_triage_response(
            current_message=user_message,
            triage_state=triage_state,
            medical_context=medical_context
        )

        # Remove duplicate sources
        sources = result.get("sources", [])

        unique_sources = []
        seen = set()

        for source in sources:
            key = (
                source.get("title"),
                source.get("url")
            )

            if key not in seen:
                seen.add(key)
                unique_sources.append(source)

        result["sources"] = unique_sources

        # If triage was already completed, strictly ensure status is follow_up
        if is_completed:
            result["status"] = "follow_up"
            result["possible_conditions"] = []

        # Enforce question cap: if 7 questions were already asked, force triage completion
        if not is_completed and len(asked_questions) >= 7 and result.get("status") == "needs_more_information":
            result["status"] = "triage_complete"
            result["question_type"] = None
            result["next_question"] = None
            if not result.get("recommendation"):
                result["recommendation"] = f"Based on your symptoms and clinical history, please consult a healthcare professional for an in-person medical evaluation."
            if not result.get("reason"):
                result["reason"] = "Triage assessment completed based on reported symptoms, duration, and clinical screening."
            if result.get("risk_level") in ("unknown", None):
                result["risk_level"] = "moderate"

        # Handle follow-up question
        if result["status"] == "needs_more_information":

            question_type = result.get("question_type")
            next_question = result.get("next_question")

            # If initial input was non-medical and asking for symptoms, reset initial symptom
            if question_type == "symptom":
                self.conversation_service.set_initial_symptom(session_id, None)

            if question_type and next_question:

                self.conversation_service.set_current_question(
                    session_id,
                    question_type,
                    next_question
                )

                self.conversation_service.add_asked_question(
                    session_id,
                    question_type,
                    next_question
                )

                self.conversation_service.add_message(
                    session_id,
                    "assistant",
                    next_question
                )

            return result

        # Handle completed triage
        self.conversation_service.clear_current_question(
            session_id
        )

        recommendation = result.get("recommendation")

        # Mark session as completed and save recommendation
        self.conversation_service.set_completed(
            session_id,
            recommendation=recommendation
        )

        if recommendation:
            self.conversation_service.add_message(
                session_id,
                "assistant",
                recommendation
            )

        return result