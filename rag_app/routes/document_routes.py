from fastapi import APIRouter, UploadFile, File
from rag_app.handlers.document_handler import ingest_document

router = APIRouter()

@router.post("/ingest")
async def ingest_route(file: UploadFile = File(...)):
    return await ingest_document(file)
