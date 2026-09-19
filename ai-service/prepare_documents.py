import json
import re
import html
import xml.etree.ElementTree as ET
from html.parser import HTMLParser


INPUT_FILE = "data/medlineplus_topics.xml"
OUTPUT_FILE = "data/medlineplus_documents.json"


class TextExtractor(HTMLParser):
    """
    Extract readable text from HTML while preserving
    word boundaries between HTML elements.
    """

    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        # Block-level HTML elements should create separation.
        if tag in {
            "p",
            "div",
            "li",
            "ul",
            "ol",
            "br",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6"
        }:
            self.parts.append(" ")

    def handle_endtag(self, tag):
        if tag in {
            "p",
            "div",
            "li",
            "ul",
            "ol",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6"
        }:
            self.parts.append(" ")

    def handle_data(self, data):
        self.parts.append(data)


def clean_summary(raw_text):
    """Convert MedlinePlus encoded HTML into clean readable text."""

    if not raw_text:
        return ""

    # Decode entities such as &lt;p&gt;
    decoded = html.unescape(raw_text)

    # Parse the resulting HTML
    parser = TextExtractor()
    parser.feed(decoded)

    text = "".join(parser.parts)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove spaces before punctuation
    text = re.sub(r"\s+([,.!?;:])", r"\1", text)

    # Normalize parentheses
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)

    return text.strip()


def clean_text(text):
    if not text:
        return ""

    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


print("Reading MedlinePlus XML...")

tree = ET.parse(INPUT_FILE)
root = tree.getroot()

documents = []


for topic in root.findall("health-topic"):

    title = clean_text(topic.get("title", ""))

    summary_element = topic.find("full-summary")

    if not title or summary_element is None:
        continue

    # IMPORTANT:
    # Get the encoded HTML exactly as stored in <full-summary>
    raw_summary = summary_element.text or ""

    summary = clean_summary(raw_summary)

    if not summary:
        continue

    # --------------------------------------------
    # Alternative names
    # --------------------------------------------

    also_called = []

    for item in topic.findall("also-called"):

        value = clean_text(item.text)

        if value:
            also_called.append(value)

    # --------------------------------------------
    # Categories
    # --------------------------------------------

    groups = []

    for group in topic.findall("group"):

        name = clean_text(group.text)

        if name:
            groups.append({
                "id": group.get("id"),
                "name": name,
                "url": group.get("url")
            })

    # --------------------------------------------
    # MeSH headings
    # --------------------------------------------

    mesh_headings = []

    mesh_element = topic.find("mesh-heading")

    if mesh_element is not None:

        for descriptor in mesh_element.findall("descriptor"):

            name = clean_text(descriptor.text)

            if name:
                mesh_headings.append({
                    "id": descriptor.get("id"),
                    "name": name
                })

    # --------------------------------------------
    # Embedding text
    # --------------------------------------------

    text_parts = [
        f"Title: {title}"
    ]

    if also_called:
        text_parts.append(
            "Also called: " + ", ".join(also_called)
        )

    if groups:
        text_parts.append(
            "Categories: "
            + ", ".join(group["name"] for group in groups)
        )

    if mesh_headings:
        text_parts.append(
            "Medical subject headings: "
            + ", ".join(
                mesh["name"] for mesh in mesh_headings
            )
        )

    text_parts.append(
        "Summary: " + summary
    )

    embedding_text = "\n\n".join(text_parts)

    # --------------------------------------------
    # Final document
    # --------------------------------------------

    document = {
        "id": topic.get("id"),
        "title": title,
        "url": topic.get("url"),
        "language": topic.get("language"),
        "date_created": topic.get("date-created"),
        "groups": groups,
        "also_called": also_called,
        "mesh_headings": mesh_headings,
        "text": embedding_text
    }

    documents.append(document)


# --------------------------------------------
# Save
# --------------------------------------------

output = {
    "source": "MedlinePlus",
    "source_url": "https://medlineplus.gov/",
    "total_documents": len(documents),
    "documents": documents
}


print("Saving cleaned documents...")

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
print("=" * 50)
print("DONE")
print("=" * 50)
print("Documents:", len(documents))
print("Output:", OUTPUT_FILE)