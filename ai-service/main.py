from fastapi import FastAPI
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

from triage_facade import TriageFacade

app = FastAPI(
    title="HealthTriage API",
    description="API for HealthTriage RAG system",
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

facade = TriageFacade()

class TriageRequest(BaseModel):
    session_id: str
    message: str


@app.get("/")
def root():
    return {
        "message": "HealthTriage AI Service is running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.post("/session")
def create_session():
    session_id = facade.create_session()

    return {
        "session_id": session_id
    }



    
@app.post("/triage")
def triage(request: TriageRequest):

    result = facade.chat(
        session_id=request.session_id,
        user_message=request.message
    )

    return result