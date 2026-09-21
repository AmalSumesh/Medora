# Medora

### AI-Powered Health Triage

> Understand your symptoms. Know your next step.

Medora is an AI-powered health triage application designed to help users understand the potential urgency of their symptoms through a conversational assessment.

Instead of forcing users through a fixed questionnaire, Medora progressively asks relevant questions based on the information already provided. The system continuously reassesses the case and provides a structured triage recommendation when enough information has been collected.

Medora is designed for **health triage support, not medical diagnosis**.

---

## ✨ Features

- 🩺 Conversational symptom triage
- 🧠 Progressive questioning based on previous answers
- 🔄 Continuous reassessment after each answer
- 📚 Retrieval-Augmented Generation (RAG)
- 🔎 Semantic medical-context retrieval
- 🗃️ Qdrant vector database
- 🤖 Groq-powered LLM
- 📖 MedlinePlus medical knowledge base
- ⚠️ Risk-level assessment
- 🚨 Emergency warning-sign detection
- ✅ AI-powered answer validation
- 🔗 Evidence and medical source references
- 💬 Persistent conversations
- 🔐 JWT authentication
- 🗄️ MongoDB persistence
- ⚡ React + TypeScript frontend
- 🐍 Python + FastAPI AI service
- 🟢 Node.js + Express backend
- 📱 Responsive chat interface

---

# 🏗️ System Architecture

Medora consists of three major applications:

```text
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  │
                                  ▼
                     ┌──────────────────────┐
                     │ React + TypeScript   │
                     │      Frontend        │
                     └──────────┬───────────┘
                                │
                                │ REST API
                                ▼
                     ┌──────────────────────┐
                     │ Node.js + Express    │
                     │      Backend         │
                     └──────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
             ┌─────────────┐       ┌────────────────┐
             │   MongoDB   │       │ Python FastAPI │
             │             │       │   AI Service   │
             │ Users       │       └───────┬────────┘
             │ Conversations│               │
             │ Messages    │                ▼
             └─────────────┘       ┌─────────────────┐
                                   │  TriageFacade   │
                                   │  Facade Pattern │
                                   └────────┬────────┘
                                            │
                       ┌────────────────────┼────────────────────┐
                       │                    │                    │
                       ▼                    ▼                    ▼
                ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                │ Conversation│     │ RAG Service │     │ LLM Service │
                │   Service   │     │             │     │             │
                └─────────────┘     └──────┬──────┘     └──────┬──────┘
                                           │                    │
                                           ▼                    ▼
                                       Qdrant                 Groq
                                           │
                                           ▼
                                     MedlinePlus
