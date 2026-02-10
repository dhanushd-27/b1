from fastapi.testclient import TestClient
from rag_app.main import app
import os

client = TestClient(app)

def test_rag_flow():
    # 1. Ingest
    # Use the existing file if available, otherwise we might need to create a dummy one.
    file_path = "rag_app/files/Full_Stack_Feb_26.pdf"
    
    # Check if file exists, if not create a dummy pdf or skip
    if not os.path.exists(file_path):
        print(f"File {file_path} not found. Please provide a valid PDF path.")
        return

    print(f"Testing ingestion with {file_path}...")
    with open(file_path, "rb") as f:
        # We send the file. filename in the tuple is important.
        response = client.post("/api/v1/ingest", files={"file": ("Full_Stack_Feb_26.pdf", f, "application/pdf")})
    
    print("Ingest Response:", response.json())
    if response.status_code != 200:
        print("Ingest Error:", response.text)
    assert response.status_code == 200
    
    # 2. Chat
    question = "What is the name of the candidate?"
    print(f"Testing chat with question: '{question}'...")
    response = client.post("/api/v1/chat", json={"question": question})
    print("Chat Response:", response.json())
    if response.status_code != 200:
        print("Chat Error:", response.text)
    assert response.status_code == 200
    assert "answer" in response.json()
    print("Test passed successfully!")

if __name__ == "__main__":
    test_rag_flow()
