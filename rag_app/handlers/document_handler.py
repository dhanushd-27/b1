from fastapi import UploadFile, HTTPException
from rag_app.core.state import app_state
from rag_app.helpers.file_helper import save_uploaded_file
from rag_app.core.splitter import load_and_split_file, get_embeddings
from langchain_core.vectorstores import InMemoryVectorStore

async def ingest_document(file: UploadFile):
    try:
        file_path = save_uploaded_file(file)
        splits = load_and_split_file(file_path)
        
        embeddings = get_embeddings()
        
        if app_state.vectorstore is None:
            app_state.vectorstore = InMemoryVectorStore.from_documents(
                splits, embeddings
            )
        else:
            app_state.vectorstore.add_documents(splits)
            
        return {"status": "success", "message": f"Document {file.filename} processed and added to vector store.", "num_chunks": len(splits)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
