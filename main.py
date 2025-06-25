from langchain_community.llms import Ollama
from langchain.agents import Tool,AgentExecutor
from langchain.agents import create_react_agent
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from PyPDF2 import PdfReader
from langchain_nomic import NomicEmbeddings
from pydantic import BaseModel, Field
from typing import Optional
from langchain_core.prompts import ChatPromptTemplate
import streamlit as st
from langchain_google_genai import GoogleGenerativeAI
import cv2
from dotenv import load_dotenv
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


load_dotenv()

internet_search = TavilySearchResults(tavily_api_key="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")
internet_search.name = "internet_search"
internet_search.description = "Returns a list of relevant document snippets for a textual query retrieved from the internet."



#llm=Ollama(model="llama3.1:latest")
llm=GoogleGenerativeAI(model="gemini-2.0-flash")

class rag:
    def __init__(self):
        
        self.llm=llm
        #self.pdf=pdf
    
    def context_rer(self):
        text=""
        reader=PdfReader("Jahan_Ravi_cv.pdf")
        for page in reader.pages:
            text+=page.extract_text()
        return text

    def text_splitter(self,text):
        splitter=CharacterTextSplitter(
            separator="\n",
            chunk_overlap=500,            
            chunk_size=500,
            length_function=len
        )
        return splitter.split_text(text)

    def vectorstore(self,chunk):
        embedding=NomicEmbeddings(model="nomic-embed-text-v1.5")
        vectorstore=FAISS.from_texts(embedding=embedding,texts=chunk)
        return vectorstore

    def converstational_chain(self,vectorstore):
        memory = ConversationBufferMemory(memory_key="chat_history", input_key="question", return_messages=True)
        llm=self.llm
        vectorstore=vectorstore
        conversational_chain=ConversationalRetrievalChain.from_llm(memory=memory,
                                                          llm=llm,
                                                          retriever=vectorstore.as_retriever())
        return conversational_chain
    
    def main(self,prompt : str) -> str:
        text = self.context_rer()
        chunk = self.text_splitter(text)
        vectorstore = self.vectorstore(chunk)
        model = self.converstational_chain(vectorstore)
        
        output = model.invoke({
            "question": prompt,
            "chat_history": []
        })
        
        return output['answer']
    
class ragger(BaseModel):
    prompt: str=Field(description="you are a summarizing tool")
    #pdf : str=Field(description="directory will be passed here")

class_rag=rag()

rag_tool=Tool(
    name="rag_tool",
    description="you are a summarizing tool ",
    func=class_rag.main,
    arg_schema=ragger
)

def agent_func(input_llm):
    prompt=ChatPromptTemplate.from_template("""
                                            
Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}
                                            
                                            """)
    
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    agent=create_react_agent(llm=llm,tools=[rag_tool,internet_search],prompt=prompt)
    agent_executor=AgentExecutor(agent=agent,tools=[rag_tool,internet_search],memory=memory,verbose=True,handle_parsing_errors=True)
    output=agent_executor.invoke({"input":input_llm})
    return output["output"]


@app.post("/chatbot")
def chatbot(textinput : dict) :
    text_input=textinput.get("input")
    output_func=agent_func(text_input)
    return {"output":output_func}



