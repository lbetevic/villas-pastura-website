#!/usr/bin/env python3
"""Generate static FAQ HTML and JSON-LD from one multilingual content file."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path


LANGUAGES = ("en", "de", "hr", "it")

TIP_LABELS = {
    "en": "Local host tip",
    "de": "Tipp der lokalen Gastgeber",
    "hr": "Savjet lokalnog host tima",
    "it": "Consiglio del team locale",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--check-only", action="store_true")
    return parser.parse_args()


def replace_marker(text: str, name: str, replacement: str) -> str:
    pattern = re.compile(
        rf"(?P<start><!-- {re.escape(name)}_START -->).*?(?P<end><!-- {re.escape(name)}_END -->)",
        re.DOTALL,
    )
    if len(pattern.findall(text)) != 1:
        raise ValueError(f"Expected exactly one {name} marker block")
    return pattern.sub(rf"\g<start>\n{replacement}\n\g<end>", text)


def localized(record: dict, key: str, language: str) -> str:
    values = record.get(key, {})
    return values.get(language) or values.get("en") or ""


def enrich(data: dict) -> dict:
    category_ids = {category["id"] for category in data["categories"]}
    item_ids: set[str] = set()
    enriched_items = []
    for item in data["items"]:
        item_id = item["id"]
        if item_id in item_ids:
            raise ValueError(f"Duplicate FAQ id: {item_id}")
        if item["category"] not in category_ids:
            raise ValueError(f"Unknown FAQ category: {item['category']}")
        if not re.fullmatch(r"[a-z0-9-]+", item_id):
            raise ValueError(f"Invalid FAQ id: {item_id}")
        item_ids.add(item_id)
        variant = item.get("variant", "medium")
        if variant not in {"short", "medium", "long"}:
            raise ValueError(f"Unknown answer variant: {variant}")
        questions = {lang: localized(item, "question", lang) for lang in LANGUAGES}
        if not all(questions.values()):
            raise ValueError(f"Missing question translation: {item_id}")
        answers = {lang: item.get("answer", {}).get(lang) for lang in LANGUAGES}
        if not all(answers.values()):
            raise ValueError(f"Missing FAQ answer translation: {item_id}")
        tips = None
        if item.get("showTip") or item.get("tip"):
            tips = {
                lang: item.get("tip", {}).get(lang, "")
                for lang in LANGUAGES
            }
        enriched_items.append({
            **item,
            "question": questions,
            "answer": answers,
            "tip": tips,
        })
    return {**data, "tipLabels": TIP_LABELS, "items": enriched_items}


def render_item(item: dict, compact: bool = False, first_open: bool = False) -> str:
    classes = "faq-item faq-item-compact" if compact else "faq-item"
    open_attribute = " open" if first_open else ""
    question = html.escape(item["question"]["en"])
    answer = html.escape(item["answer"]["en"])
    tip = ""
    if item["tip"] and not compact:
        tip = (
            '\n      <aside class="faq-host-tip">'
            f'<strong data-faq-tip-label>{html.escape(TIP_LABELS["en"])}</strong>'
            f'<p data-faq-tip>{html.escape(item["tip"]["en"])}</p>'
            "</aside>"
        )
    return (
        f'<details class="{classes}" id="{item["id"]}" data-faq-id="{item["id"]}"{open_attribute}>\n'
        "  <summary>"
        f'<h3 data-faq-question>{question}</h3>'
        '<span class="faq-chevron" aria-hidden="true"></span>'
        "</summary>\n"
        '  <div class="faq-answer">\n'
        f'    <p data-faq-answer>{answer}</p>{tip}\n'
        "  </div>\n"
        "</details>"
    )


def render_full_content(data: dict) -> str:
    blocks = []
    first_item = True
    for category in data["categories"]:
        items = [item for item in data["items"] if item["category"] == category["id"]]
        rendered_items = []
        for item in items:
            rendered_items.append(render_item(item, first_open=first_item))
            first_item = False
        blocks.append(
            f'<section class="faq-category" id="category-{category["id"]}" '
            f'data-faq-category="{category["id"]}" aria-labelledby="category-{category["id"]}-title">\n'
            '  <header class="faq-category-header">\n'
            f'    <h2 id="category-{category["id"]}-title" data-faq-category-title>'
            f'{html.escape(category["title"]["en"])}</h2>\n'
            f'    <p data-faq-category-intro>{html.escape(category["intro"]["en"])}</p>\n'
            "  </header>\n"
            '  <div class="faq-list">\n'
            + "\n".join("    " + item.replace("\n", "\n    ") for item in rendered_items)
            + "\n  </div>\n</section>"
        )
    return "\n\n".join(blocks)


def render_preview(data: dict) -> str:
    items = [item for item in data["items"] if item.get("homepage")]
    if len(items) != 6:
        raise ValueError("Homepage FAQ preview must contain exactly six items")
    rendered = [render_item(item, compact=True, first_open=index == 0) for index, item in enumerate(items)]
    return "\n".join(rendered)


def preview_data(data: dict) -> dict:
    """Keep homepage runtime data limited to the six questions shown there."""
    return {
        "status": data["status"],
        "lastModified": data["lastModified"],
        "items": [item for item in data["items"] if item.get("homepage")],
    }


def json_for_script(value: dict) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def render_schema(data: dict) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "name": "Villas Pastura frequently asked questions",
        "creativeWorkStatus": "Published",
        "dateModified": data["lastModified"],
        "author": {
            "@type": "Organization",
            "name": "Villas Pastura",
        },
        "about": {
            "@type": "VacationRental",
            "name": "Private Pool Villas Pastura",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Novalja",
                "addressRegion": "Pag Island",
                "addressCountry": "HR",
            },
        },
        "mainEntity": [
            {
                "@type": "Question",
                "name": item["question"]["en"],
                "acceptedAnswer": {"@type": "Answer", "text": item["answer"]["en"]},
            }
            for item in data["items"]
        ],
    }
    return '<script type="application/ld+json">\n' + json.dumps(schema, ensure_ascii=False, indent=2) + "\n</script>"


def main() -> int:
    args = parse_args()
    project = args.project.resolve()
    source = project / "faq-content.json"
    faq_page = project / "faq.html"
    home_page = project / "index.html"
    data = enrich(json.loads(source.read_text(encoding="utf-8")))

    if data.get("status") != "approved":
        raise ValueError("FAQ content must be approved before generation")

    faq_text = faq_page.read_text(encoding="utf-8")
    home_text = home_page.read_text(encoding="utf-8")
    faq_text = replace_marker(faq_text, "FAQ_SCHEMA", render_schema(data))
    faq_text = replace_marker(
        faq_text,
        "FAQ_DATA",
        f'<script type="application/json" id="faq-data">{json_for_script(data)}</script>',
    )
    faq_text = replace_marker(faq_text, "FAQ_CONTENT", render_full_content(data))
    home_text = replace_marker(
        home_text,
        "FAQ_PREVIEW_DATA",
        f'<script type="application/json" id="faq-preview-data">{json_for_script(preview_data(data))}</script>',
    )
    home_text = replace_marker(home_text, "FAQ_PREVIEW_ITEMS", render_preview(data))

    if args.check_only:
        if faq_text != faq_page.read_text(encoding="utf-8") or home_text != home_page.read_text(encoding="utf-8"):
            raise ValueError("Generated FAQ blocks are out of date; run tools/build_faq.py")
        print("FAQ source, static HTML, runtime data and JSON-LD are synchronized.")
        return 0

    faq_page.write_text(faq_text, encoding="utf-8")
    home_page.write_text(home_text, encoding="utf-8")
    print(f"Generated {len(data['items'])} FAQ items and 6 homepage previews.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
