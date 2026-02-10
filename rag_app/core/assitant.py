from langchain_google_genai import ChatGoogleGenerativeAI
from rag_app.core.config import GOOGLE_API_KEY
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

model = ChatGoogleGenerativeAI(
  model="gemini-2.5-flash",
  temperature=0.0,
  google_api_key=GOOGLE_API_KEY,
)

def get_rag_chain(retriever):
    template = """Answer the question based only on the following context:
    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | model
        | StrOutputParser()
    )
    return chain

