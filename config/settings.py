import os
from dotenv import load_dotenv

load_dotenv()

AZURE_AI_PROJECT_ENDPOINT = os.environ["AZURE_AI_PROJECT_ENDPOINT"]
AZURE_AI_MODEL_DEPLOYMENT = os.getenv("AZURE_AI_MODEL_DEPLOYMENT", "gpt-4o")
