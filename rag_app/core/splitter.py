from langchain_core.vectorstores import InMemoryVectorStore
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from rag_app.core.config import GOOGLE_API_KEY

def load_and_split_file(path: str) -> list[Document]:
  loader = PyPDFLoader(path)

  docs = loader.load()
  text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, chunk_overlap=200, add_start_index=True
  )

  all_splits = text_splitter.split_documents(docs)
  return all_splits

def get_embeddings():
  return GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GOOGLE_API_KEY,
  )


def retrieve_from_vectorstore(vectorstore: InMemoryVectorStore) -> any:
  retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}
  )
  return retriever