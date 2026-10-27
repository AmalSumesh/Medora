# Medora

### AI-Powered Health Triage

> Understand your symptoms. Know your next step.

Medora is an AI-powered health triage application designed to help users understand the potential urgency of their symptoms through a conversational assessment.

Instead of forcing users through a fixed questionnaire, Medora progressively asks relevant questions based on the information already provided. The system continuously reassesses the case and provides a structured triage recommendation when enough information has been collected.

Medora is designed for **health triage support only, not medical diagnosis**.

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
```

---

## ☁️ Cost-Engineered Multi-Cloud Deployment Architecture

Medora is deployed using a **Cost-Engineered Multi-Cloud Architecture** specifically designed to deliver low-latency medical triage and semantic RAG inference while maintaining **zero operational spend ($0.00 / mo)** under student and free-tier cloud limits:

- **Frontend Tier (Vercel)**: The React 19 SPA is hosted on [Vercel](https://vercel.com/) via automated continuous deployment from the `main` branch. Assets are distributed globally across Vercel's Edge Network with automated SSL/TLS certificates and SPA client-side rewrite rules defined in [`vercel.json`](file:///c:/Users/AMAL%20SUMESH/Desktop/healthTriageRAG/frontend/vercel.json).
- **Business API Tier (Render)**: The Node.js and Express backend is deployed as a managed Web Service on [Render](https://render.com/). It compiles TypeScript on deployment, manages stateless JWT sessions, and interfaces directly with a managed cloud cluster on MongoDB Atlas (M0 Shared Tier).
- **Machine Learning & RAG Tier (Azure Container Apps)**: The PyTorch and SentenceTransformers model runs as a containerized microservice on [Azure Container Apps](https://azure.microsoft.com/products/container-apps). The Docker container is pre-baked with the `all-MiniLM-L6-v2` transformer weights and lightweight CPU PyTorch binaries, enabling cold-starts in under 3 seconds.
- **Zero-Credit Burn Optimization**: By configuring Azure Container Apps on a Serverless Consumption profile with `min-replicas: 0`, the service automatically scales to zero when idle and only draws compute during active triage consultations. The entire workload operates within Azure's permanent monthly free grant (180,000 vCPU-seconds and 360,000 GiB-seconds free every month), which completely preserves the user's $100 Azure for Students credit ($0.00 spent, 100% credit retained).
