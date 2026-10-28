import uuid


class ConversationService:

    def __init__(self):
        self.sessions = {}

    def restore_from_history(self, session_id, history):
        if not history:
            return

        self._check_session(session_id)
        session = self.sessions[session_id]

        initial_symptom = None
        asked_questions = []
        answered_information = {}
        current_question = None
        is_completed = False
        last_recommendation = None
        messages = []

        for i, m in enumerate(history):
            role = m.get("role")
            content = m.get("content", "")
            messages.append({"role": role, "content": content})

            if role == "user" and initial_symptom is None:
                initial_symptom = content

            if role == "assistant":
                triage_meta = m.get("triage") or {}
                status = triage_meta.get("status")
                q_type = triage_meta.get("question_type") or "symptom"
                q_text = triage_meta.get("next_question")
                if not q_text and content and "?" in content:
                    q_text = content.strip()

                if status == "triage_complete":
                    is_completed = True
                    last_recommendation = triage_meta.get("recommendation") or content

                if q_text:
                    already_asked = any(
                        item["question"].strip().lower() == q_text.strip().lower()
                        for item in asked_questions
                    )
                    if not already_asked:
                        asked_questions.append({"type": q_type, "question": q_text})

                    # If next message in history is the user's answer, pair them
                    if i + 1 < len(history) and history[i + 1].get("role") == "user":
                        ans = history[i + 1].get("content", "")
                        answered_information[f"{q_type}: {q_text}"] = ans
                    elif i == len(history) - 1 and not is_completed:
                        current_question = {"type": q_type, "question": q_text, "attempts": 0}

        session["messages"] = messages
        session["initial_symptom"] = initial_symptom
        session["asked_questions"] = asked_questions
        session["answered_information"] = answered_information
        session["current_question"] = current_question
        session["is_completed"] = is_completed
        session["last_recommendation"] = last_recommendation

    def create_session(self):
        session_id = str(uuid.uuid4())

        self.sessions[session_id] = {
            "messages": [],
            "asked_questions": [],
            "current_question": None,
            "answered_information": {},
            "initial_symptom": None,
            "is_completed": False,
            "last_recommendation": None
        }

        return session_id

    def add_message(self, session_id, role, content):
        self._check_session(session_id)

        self.sessions[session_id]["messages"].append({
            "role": role,
            "content": content
        })

    def get_messages(self, session_id):
        self._check_session(session_id)

        return self.sessions[session_id]["messages"]

    def set_initial_symptom(self, session_id, symptom):
        self._check_session(session_id)

        self.sessions[session_id]["initial_symptom"] = symptom

    def get_initial_symptom(self, session_id):
        self._check_session(session_id)

        return self.sessions[session_id]["initial_symptom"]

    def set_current_question(self, session_id, question_type, question):
        self._check_session(session_id)

        self.sessions[session_id]["current_question"] = {
            "type": question_type,
            "question": question
        }

    def get_current_question(self, session_id):
        self._check_session(session_id)

        return self.sessions[session_id]["current_question"]

    def clear_current_question(self, session_id):
        self._check_session(session_id)

        self.sessions[session_id]["current_question"] = None

    def add_asked_question(self, session_id, question_type, question):
        self._check_session(session_id)

        if not question:
            return

        already_asked = any(
            item["question"].strip().lower() == question.strip().lower()
            for item in self.sessions[session_id]["asked_questions"]
        )

        if not already_asked:
            self.sessions[session_id]["asked_questions"].append({
                "type": question_type,
                "question": question
            })

    def get_asked_questions(self, session_id):
        self._check_session(session_id)

        return self.sessions[session_id]["asked_questions"]

    def add_answered_information(self, session_id, question_type, answer):
        self._check_session(session_id)

        if question_type:
            self.sessions[session_id]["answered_information"][question_type] = answer

    def get_answered_information(self, session_id):
        self._check_session(session_id)

        return self.sessions[session_id]["answered_information"]

    def set_completed(self, session_id, recommendation=None):
        self._check_session(session_id)
        self.sessions[session_id]["is_completed"] = True
        if recommendation:
            self.sessions[session_id]["last_recommendation"] = recommendation

    def is_completed(self, session_id):
        self._check_session(session_id)
        return self.sessions[session_id].get("is_completed", False)

    def get_last_recommendation(self, session_id):
        self._check_session(session_id)
        return self.sessions[session_id].get("last_recommendation")

    def get_cached_context(self, session_id):
        self._check_session(session_id)
        return self.sessions[session_id].get("cached_medical_context")

    def set_cached_context(self, session_id, context):
        self._check_session(session_id)
        self.sessions[session_id]["cached_medical_context"] = context

    def clear_session(self, session_id):
        if session_id in self.sessions:
            del self.sessions[session_id]

    def _check_session(self, session_id):
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "messages": [],
                "asked_questions": [],
                "current_question": None,
                "answered_information": {},
                "initial_symptom": None,
                "is_completed": False,
                "last_recommendation": None,
                "cached_medical_context": None
            }