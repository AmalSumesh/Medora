import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams


load_dotenv()


QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

COLLECTION_NAME = "healthtriage_medlineplus"


if not QDRANT_URL:
    raise ValueError("QDRANT_URL is missing from .env")

if not QDRANT_API_KEY:
    raise ValueError("QDRANT_API_KEY is missing from .env")


print("Connecting to Qdrant...")

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)


print("Creating collection...")

# Delete the collection if it already exists.
# This makes rerunning the setup safe during development.
if client.collection_exists(COLLECTION_NAME):
    print("Collection already exists. Recreating it...")
    client.delete_collection(COLLECTION_NAME)


client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(
        size=384,
        distance=Distance.COSINE
    )
)


print()
print("=" * 60)
print("QDRANT COLLECTION CREATED")
print("=" * 60)

print("Collection:", COLLECTION_NAME)
print("Vector size:", 384)
print("Distance:", "COSINE")