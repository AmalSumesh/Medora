import requests
import xml.etree.ElementTree as ET
import json
import os
import re
import html
import time


# --------------------------------------------------
# CONFIG
# --------------------------------------------------

INDEX_URL = "https://medlineplus.gov/xml/mplus_topics.xml"

OUTPUT_DIR = "data/medlineplus"
OUTPUT_FILE = "data/medlineplus/all_topics.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)


# --------------------------------------------------
# DOWNLOAD TOPIC INDEX
# --------------------------------------------------

print("Downloading MedlinePlus topic index...")

response = requests.get(
    INDEX_URL,
    timeout=60
)

print("Status:", response.status_code)

response.raise_for_status()

print("Downloaded:", len(response.content), "bytes")


# --------------------------------------------------
# PARSE XML
# --------------------------------------------------

root = ET.fromstring(response.content)

topics = []

for health_topic in root.findall(".//health-topic"):

    topic = {
        "id": health_topic.get("id"),
        "title": health_topic.get("title"),
        "url": health_topic.get("url"),
        "language": health_topic.get("language"),
        "category": health_topic.get("category"),
    }

    topics.append(topic)


print("Topics found:", len(topics))


# --------------------------------------------------
# SAVE INDEX
# --------------------------------------------------

with open(
    "data/medlineplus/topic_index.json",
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        topics,
        file,
        indent=2,
        ensure_ascii=False
    )


print("Saved topic index:")
print("data/medlineplus/topic_index.json")


# --------------------------------------------------
# SHOW SAMPLE
# --------------------------------------------------

print("\nFirst 10 topics:\n")

for topic in topics[:10]:
    print(
        topic["title"],
        "->",
        topic["url"]
    )