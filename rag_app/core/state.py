from langchain_core.vectorstores import InMemoryVectorStore

class AppState:
    vectorstore: InMemoryVectorStore | None = None

# Global instance
app_state = AppState()
