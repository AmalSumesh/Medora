import json
import re


INPUT_FILE = "data/medlineplus_documents.json"
OUTPUT_FILE = "data/medlineplus_chunks.json"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def split_sentences(text):
    """
    Split text into sentences while keeping punctuation.
    """
    sentences = re.split(
        r"(?<=[.!?])\s+",
        text.strip()
    )

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


def split_text(
    text,
    chunk_size=CHUNK_SIZE,
    overlap=CHUNK_OVERLAP
):
    """
    Create chunks without cutting words or sentences
    whenever possible.
    """

    if len(text) <= chunk_size:
        return [text.strip()]

    sentences = split_sentences(text)

    chunks = []
    current_chunk = []

    current_length = 0

    for sentence in sentences:

        sentence_length = len(sentence)

        # If adding this sentence would exceed the
        # target size, save the current chunk.
        if (
            current_chunk
            and current_length + sentence_length + 1 > chunk_size
        ):

            chunk_text = " ".join(current_chunk).strip()

            if chunk_text:
                chunks.append(chunk_text)

            # Build overlap using previous sentences.
            overlap_sentences = []
            overlap_length = 0

            for previous in reversed(current_chunk):

                if overlap_length + len(previous) + 1 > overlap:
                    break

                overlap_sentences.insert(0, previous)
                overlap_length += len(previous) + 1

            current_chunk = overlap_sentences
            current_length = overlap_length

        current_chunk.append(sentence)
        current_length += sentence_length + 1

    # Add final chunk
    if current_chunk:
        chunk_text = " ".join(current_chunk).strip()

        if chunk_text:
            chunks.append(chunk_text)

    return chunks


print("Loading documents...")

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)


chunks = []


for document in data["documents"]:

    document_chunks = split_text(
        document["text"]
    )

    for index, chunk_text in enumerate(document_chunks):

        chunk = {
            "chunk_id": (
                f"{document['id']}_chunk_{index}"
            ),

            "document_id": document["id"],

            "title": document["title"],

            "url": document["url"],

            "language": document["language"],

            "groups": document["groups"],

            "also_called": document["also_called"],

            "mesh_headings": document["mesh_headings"],

            "chunk_index": index,

            "total_chunks": len(document_chunks),

            "text": chunk_text
        }

        chunks.append(chunk)


output = {
    "source": "MedlinePlus",

    "source_url": "https://medlineplus.gov/",

    "total_documents": len(data["documents"]),

    "total_chunks": len(chunks),

    "chunk_size": CHUNK_SIZE,

    "chunk_overlap": CHUNK_OVERLAP,

    "chunks": chunks
}


print("Saving chunks...")

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        output,
        file,
        indent=2,
        ensure_ascii=False
    )


print()
print("=" * 60)
print("DONE")
print("=" * 60)

print("Documents:", len(data["documents"]))
print("Chunks:", len(chunks))
print("Chunk size:", CHUNK_SIZE)
print("Chunk overlap:", CHUNK_OVERLAP)
print("Output:", OUTPUT_FILE)