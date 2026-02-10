from fastapi import FastAPI
from rag_app.routes.document_routes import router as document_router
from rag_app.routes.chat_routes import router as chat_router
import uvicorn

app = FastAPI(title="RAG App", description="API for RAG application")

app.include_router(document_router, prefix="/api/v1", tags=["Documents"])
app.include_router(chat_router, prefix="/api/v1", tags=["Chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to RAG App API"}

if __name__ == "__main__":
    uvicorn.run("rag_app.main:app", host="0.0.0.0", port=8000, reload=True)
