import os

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient


class RAGService:
    """
    Handles semantic retrieval from the MedlinePlus
    knowledge base stored in Qdrant.
    """

    def __init__(
        self,
        qdrant_url=None,
        qdrant_api_key=None,
        collection_name="healthtriage_medlineplus",
        model_name="all-MiniLM-L6-v2"
    ):

        load_dotenv()

        self.qdrant_url = (
            qdrant_url
            or os.getenv("QDRANT_URL")
        )

        self.qdrant_api_key = (
            qdrant_api_key
            or os.getenv("QDRANT_API_KEY")
        )

        self.collection_name = collection_name
        self.model_name = model_name

        if not self.qdrant_url:
            raise ValueError(
                "QDRANT_URL is missing"
            )

        if not self.qdrant_api_key:
            raise ValueError(
                "QDRANT_API_KEY is missing"
            )

        print("Initializing RAG Service...")

        # Connect to Qdrant
        self.client = QdrantClient(
            url=self.qdrant_url,
            api_key=self.qdrant_api_key
        )

        # Load the same embedding model used
        # when creating the database embeddings.
        self.embedding_model = (
            SentenceTransformer(self.model_name)
        )

        print("RAG Service ready.")


    def retrieve(
        self,
        query,
        limit=5
    ):
        """
        Retrieve the most relevant medical chunks
        for a user's query.
        """

        if not query or not query.strip():
            return []

        # Create embedding for the user's query
        query_vector = self.embedding_model.encode(
            query,
            normalize_embeddings=True
        ).tolist()

        # Search Qdrant
        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=limit
        ).points

        retrieved_documents = []

        for result in results:

            payload = result.payload

            retrieved_documents.append({

                "chunk_id": payload.get(
                    "chunk_id"
                ),

                "document_id": payload.get(
                    "document_id"
                ),

                "title": payload.get(
                    "title"
                ),

                "url": payload.get(
                    "url"
                ),

                "text": payload.get(
                    "text"
                ),

                "score": result.score

            })

        return retrieved_documents


    def retrieve_context(
        self,
        query,
        limit=5
    ):
        """
        Retrieve documents and combine their text
        into a context string for the LLM.
        """

        documents = self.retrieve(
            query=query,
            limit=limit
        )

        if not documents:
            return ""

        context_parts = []

        for index, document in enumerate(
            documents,
            start=1
        ):

            context_parts.append(
                f"""
    EVIDENCE {index}
    Title: {document['title']}
    URL: {document['url']}
    Relevance Score: {document['score']:.4f}

    Medical Context:
    {document['text']}
    """.strip()
            )

        return "\n\n".join(
            context_parts
        )