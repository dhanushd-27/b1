from fastapi import APIRouter
from rag_app.handlers.chat_handler import chat_with_doc, ChatRequest

router = APIRouter()

@router.post("/chat")
async def chat_route(request: ChatRequest):
    return await chat_with_doc(request)
