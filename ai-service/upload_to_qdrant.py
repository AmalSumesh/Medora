import json
import os
import uuid

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct


load_dotenv()


# --------------------------------------------------
# Configuration
# --------------------------------------------------

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

COLLECTION_NAME = "healthtriage_medlineplus"

INPUT_FILE = "data/medlineplus_embeddings.json"

BATCH_SIZE = 100


# --------------------------------------------------
# Validate environment variables
# --------------------------------------------------

if not QDRANT_URL:
    raise ValueError("QDRANT_URL is missing from .env")

if not QDRANT_API_KEY:
    raise ValueError("QDRANT_API_KEY is missing from .env")


# --------------------------------------------------
# Load embeddings
# --------------------------------------------------

print("Loading embeddings...")

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:
    data = json.load(file)

chunks = data["chunks"]

print("Embeddings loaded:", len(chunks))


# --------------------------------------------------
# Connect to Qdrant
# --------------------------------------------------

print("Connecting to Qdrant...")

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)


# --------------------------------------------------
# Upload in batches
# --------------------------------------------------

print("Uploading vectors...")

total = len(chunks)

for start in range(0, total, BATCH_SIZE):

    end = min(
        start + BATCH_SIZE,
        total
    )

    batch = chunks[start:end]

    points = []

    for chunk in batch:

        # Qdrant requires an integer or UUID as point ID.
        # UUID5 gives us a deterministic ID from our chunk_id.
        point_id = str(
            uuid.uuid5(
                uuid.NAMESPACE_URL,
                chunk["chunk_id"]
            )
        )

        point = PointStruct(
            id=point_id,

            vector=chunk["embedding"],

            payload={
                "chunk_id": chunk["chunk_id"],
                "document_id": chunk["document_id"],
                "title": chunk["title"],
                "url": chunk["url"],
                "language": chunk["language"],
                "groups": chunk["groups"],
                "also_called": chunk["also_called"],
                "mesh_headings": chunk["mesh_headings"],
                "chunk_index": chunk["chunk_index"],
                "total_chunks": chunk["total_chunks"],
                "text": chunk["text"],
                "source": "MedlinePlus"
            }
        )

        points.append(point)

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
        wait=True
    )

    print(
        f"Uploaded {end}/{total}"
    )


# --------------------------------------------------
# Verify collection
# --------------------------------------------------

collection_info = client.get_collection(
    collection_name=COLLECTION_NAME
)


print()
print("=" * 60)
print("UPLOAD COMPLETE")
print("=" * 60)

print(
    "Collection:",
    COLLECTION_NAME
)

print(
    "Vectors uploaded:",
    collection_info.points_count
)

print(
    "Vector dimension:",
    data["embedding_dimension"]
)