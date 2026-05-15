from fastapi import FastAPI

app = FastAPI(title="AI Orchestrator")


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-orchestrator"}


@app.get("/")
def root():
    return {"message": "AI Orchestrator is running"}
