import json
from sentence_transformers import SentenceTransformer


INPUT_FILE = "data/medlineplus_chunks.json"
OUTPUT_FILE = "data/medlineplus_embeddings.json"

MODEL_NAME = "all-MiniLM-L6-v2"


print("Loading chunks...")

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:
    data = json.load(file)


chunks = data["chunks"]

print("Chunks:", len(chunks))
print("Loading embedding model...")


model = SentenceTransformer(MODEL_NAME)


texts = [
    chunk["text"]
    for chunk in chunks
]


print("Creating embeddings...")

embeddings = model.encode(
    texts,
    show_progress_bar=True,
    batch_size=32,
    normalize_embeddings=True
)


print("Saving embeddings...")


output_chunks = []

for chunk, embedding in zip(chunks, embeddings):

    output_chunks.append({
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
        "embedding": embedding.tolist()
    })


output = {
    "source": "MedlinePlus",
    "embedding_model": MODEL_NAME,
    "embedding_dimension": len(embeddings[0]),
    "total_chunks": len(output_chunks),
    "chunks": output_chunks
}


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        output,
        file,
        ensure_ascii=False
    )


print()
print("=" * 60)
print("DONE")
print("=" * 60)

print("Embedding model:", MODEL_NAME)
print("Chunks:", len(output_chunks))
print("Vector dimension:", len(embeddings[0]))
print("Output:", OUTPUT_FILE)