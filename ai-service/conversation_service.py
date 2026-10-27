import uuid


class ConversationService:

    def __init__(self):
        self.sessions = {}

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

        if not question_type:
            return

        already_asked = any(
            item["type"] == question_type
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
                "last_recommendation": None
            }