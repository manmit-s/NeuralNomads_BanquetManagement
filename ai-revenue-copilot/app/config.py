import os
from dotenv import load_dotenv
from pathlib import Path

# Get root directory of project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env explicitly from root
load_dotenv(dotenv_path=BASE_DIR / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")