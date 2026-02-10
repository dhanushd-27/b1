from pydantic import BaseModel
from fastapi import HTTPException
from rag_app.core.state import app_state
from rag_app.core.assitant import get_rag_chain
from rag_app.core.splitter import retrieve_from_vectorstore

class ChatRequest(BaseModel):
    question: str

async def chat_with_doc(request: ChatRequest):
    if app_state.vectorstore is None:
        raise HTTPException(status_code=400, detail="No documents successfully ingested yet. Please upload a document first.")
    
    retriever = retrieve_from_vectorstore(app_state.vectorstore)
    chain = get_rag_chain(retriever)
    
    response = chain.invoke(request.question)
    return {"answer": response}
