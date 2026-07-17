import os
import json
from google import genai
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FinPulse AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# NAYI LIBRARY KA SETUP
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are FinPulse AI, an expert financial analyst assistant powered by Gemini.
Analyze spending patterns, identify trends, calculate totals, and provide actionable insights.
Structure your response with:
📊 **Summary**
🔍 **Category Breakdown**
📈 **Trends & Patterns**
💡 **Key Insights**
✅ **Recommendations**
"""

async def generate_stream(data_text: str, query: str):
    full_prompt = f"{SYSTEM_PROMPT}\n\n--- Financial Data ---\n{data_text}\n\nUser Question: {query}"
    
    try:
        # NAYI LIBRARY KA ASYNC STREAMING CODE
        response = await client.aio.models.generate_content_stream(
            model='gemini-3.5-flash',
            contents=full_prompt
        )
        async for chunk in response:
            if chunk.text:
                yield f"data: {json.dumps({'text': chunk.text})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'text': f'API Error: {str(e)}'})}\n\n"

    yield "data: [DONE]\n\n"

@app.post("/api/analyze")
async def analyze(
    text_data: str = Form(default=""),
    query: str = Form(default=""),
    file: UploadFile = File(default=None),
):
    combined_data = text_data.strip()

    if file and file.filename:
        content = await file.read()
        if file.filename.endswith(".csv"):
            csv_text = content.decode("utf-8", errors="ignore")
            combined_data += f"\n\n[CSV File: {file.filename}]\n{csv_text}"
        else:
            combined_data += f"\n\n[File uploaded: {file.filename}]"

    if not combined_data:
        combined_data = "No data provided."

    return StreamingResponse(
        generate_stream(combined_data, query),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )

@app.get("/api/health")
async def health():
    return {"status": "ok", "model": "gemini-3.5-flash"}

if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")