import os
import shutil
from fastapi import UploadFile

def save_uploaded_file(upload_file: UploadFile, directory: str = "rag_app/files") -> str:
    os.makedirs(directory, exist_ok=True)
    file_path = os.path.join(directory, upload_file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path
