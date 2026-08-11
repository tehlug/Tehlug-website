#!/usr/bin/env python3
"""Import the published Tehran-LUG archive into this Hugo project.

The source website is the canonical source.  The importer deliberately saves
gallery thumbnails locally so the rebuilt site does not depend on third-party
hotlinks.  Run from the repository root:

    python3 scripts/import_published_content.py
"""

from __future__ import annotations

import html
import re
import shutil
import sys
import time
from pathlib import Path
from urllib.parse import quote, urljoin, urlparse
from urllib.request import Request, urlopen


BASE = "https://tehlug.org/"
ROOT = Path(__file__).resolve().parents[1]
EVENTS_DIR = ROOT / "content" / "events"
NEWS_DIR = ROOT / "content" / "news"
MEDIA_DIR = ROOT / "static" / "assets" / "images" / "archive"
MAX_LOCAL_GALLERY_IMAGES = 8


def fetch(path: str) -> str:
    request = Request(urljoin(BASE, path), headers={"User-Agent": "Tehlug archive importer"})
    for attempt in range(2):
        try:
            with urlopen(request, timeout=12) as response:
                return response.read().decode("utf-8", "replace")
        except Exception:
            if attempt == 1:
                raise
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError("unreachable")


def clean(fragment: str) -> str:
    fragment = re.sub(r"<br\s*/?>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"</(?:p|h[1-6]|li|div|section)>", "\n", fragment, flags=re.I)
    fragment = re.sub(r"<[^>]+>", "", fragment)
    text = html.unescape(fragment).replace("\xa0", " ")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def yaml_scalar(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(value.strip() for value in values if value.strip()))


def event_slugs(index: str) -> list[str]:
    values = unique(re.findall(r"href=/events/([^/\"?#]+)/info/", index))
    return sorted(values, key=lambda value: (not value.isdigit(), int(value) if value.isdigit() else value))


def download(url: str, target: Path) -> None:
    if target.exists() and target.stat().st_size > 0:
        if target.open("rb").read(3) != b"---":
            return
        target.unlink()
    target.parent.mkdir(parents=True, exist_ok=True)
    request = Request(url, headers={"User-Agent": "Tehlug archive importer"})
    for attempt in range(2):
        try:
            with urlopen(request, timeout=15) as response, target.open("wb") as destination:
                shutil.copyfileobj(response, destination)
            return
        except Exception:
            target.unlink(missing_ok=True)
            if attempt == 1:
                raise
            time.sleep(1.5 * (attempt + 1))


def event_front_matter(slug: str, page: str, gallery: list[str], poster: str | None, gallery_total: int) -> str:
    title_match = re.search(r'<h1 class=title>(.*?)</h1>', page, re.S)
    title = clean(title_match.group(1)) if title_match else f"جلسه {slug}"
    date_match = re.search(r"زمان برگزاری:.*?<bdi>(.*?)</bdi>", page, re.S)
    date_text = clean(date_match.group(1)) if date_match else ""
    time_match = re.search(r"از ساعت:?\s*(.*?)<br", page, re.S)
    time_text = clean(time_match.group(1)) if time_match else ""
    locations = unique(clean(value) for value in re.findall(r"href=/locations/[^ >]+>(.*?)</a>", page, re.S))
    speakers = unique(clean(value) for value in re.findall(r"href=/speakers/[^ >]+>(.*?)</a>", page, re.S))
    topics = unique(clean(value) for value in re.findall(r"href=/topics/[^ >]+>(.*?)</a>", page, re.S))

    lines = [
        "---",
        f"title: {yaml_scalar(title)}",
        f"url: {yaml_scalar(f'/events/{slug}/')}",
        f"date_text: {yaml_scalar(date_text)}",
        f"time: {yaml_scalar(time_text)}",
        f"location: {yaml_scalar('، '.join(locations))}",
        'status: "برگزار شده"',
        "topics:",
    ]
    lines.extend(f"  - {yaml_scalar(value)}" for value in topics)
    lines.append("speakers:")
    lines.extend(f"  - {yaml_scalar(value)}" for value in speakers)
    if poster:
        lines.append(f"poster: {yaml_scalar(poster)}")
    if gallery:
        lines.append("gallery:")
        lines.extend(f"  - {yaml_scalar(value)}" for value in gallery)
    lines.append(f"gallery_total: {gallery_total}")
    lines.append(f"gallery_url: {yaml_scalar(urljoin(BASE, f'events/{slug}/gallery/'))}")
    lines.extend([f"source_url: {yaml_scalar(urljoin(BASE, f'events/{slug}/info/'))}", "---", ""])
    return "\n".join(lines)


def import_event(slug: str) -> int:
    target = EVENTS_DIR / f"{slug}.md"
    if target.exists() and "gallery_total:" in target.read_text(encoding="utf-8"):
        return 0

    page = fetch(f"events/{quote(slug)}/info/")
    markdown_match = re.search(r'<div class=markdown>(.*?)</div><div', page, re.S)
    body = clean(markdown_match.group(1)) if markdown_match else ""
    body = re.sub(r"(?m)^(.+)$", r"\1", body)
    if body:
        body = "\n\n".join(f"{line}" for line in body.split("\n\n"))

    poster_match = re.search(r"href=(/events/poster/[^ >]+)", page)
    poster = None
    if poster_match:
        source = urljoin(BASE, poster_match.group(1))
        suffix = Path(urlparse(source).path).suffix or ".jpg"
        poster_target = MEDIA_DIR / "events" / slug / f"poster{suffix}"
        download(source, poster_target)
        poster = poster_target.relative_to(ROOT / "static").as_posix()

    gallery_paths: list[str] = []
    try:
        gallery_page = fetch(f"events/{quote(slug)}/gallery/")
        image_sources = unique(re.findall(r"<img src=([^ >]+)", gallery_page))
        for index, source in enumerate(image_sources[:MAX_LOCAL_GALLERY_IMAGES], start=1):
            source_url = urljoin(BASE, source)
            suffix = Path(urlparse(source_url).path).suffix or ".webp"
            image_target = MEDIA_DIR / "events" / slug / f"{index:03d}{suffix}"
            try:
                download(source_url, image_target)
                gallery_paths.append(image_target.relative_to(ROOT / "static").as_posix())
            except Exception as error:
                print(f"  skipped image {source_url}: {error}", file=sys.stderr)
    except Exception as error:  # Some old events have no published gallery.
        print(f"  no gallery for {slug}: {error}", file=sys.stderr)

    target.write_text(event_front_matter(slug, page, gallery_paths, poster, len(image_sources)) + body + "\n", encoding="utf-8")
    return len(gallery_paths)


def news_slugs(index: str) -> list[str]:
    values = unique(re.findall(r"href=/news/([^/\"?#]+)/", index))
    return [value for value in values if value not in {"index.xml"}]


def import_news(slug: str) -> None:
    target = NEWS_DIR / f"{slug}.md"
    if target.exists() and "source_url:" in target.read_text(encoding="utf-8"):
        return

    page = fetch(f"news/{quote(slug)}/")
    title_match = re.search(r'<h1 class=title>(.*?)</h1>', page, re.S)
    title = clean(title_match.group(1)) if title_match else slug.replace("-", " ")
    markdown_match = re.search(r'<div class=markdown>(.*?)</div><div', page, re.S)
    body = clean(markdown_match.group(1)) if markdown_match else ""
    date_match = re.search(r"<bdi>([^<]+)</bdi>", page)
    date_text = clean(date_match.group(1)) if date_match else ""
    target.write_text(
        "\n".join(
            [
                "---",
                f"title: {yaml_scalar(title)}",
                f"url: {yaml_scalar(f'/news/{slug}/')}",
                f"date_text: {yaml_scalar(date_text)}",
                f"source_url: {yaml_scalar(urljoin(BASE, f'news/{slug}/'))}",
                "---",
                "",
                body,
                "",
            ]
        ),
        encoding="utf-8",
    )


def import_topics() -> int:
    page = fetch("topics/")
    matches = re.findall(r'href="https?://tehlug\.org/topics/(.+?)/">(.*?)</a>', page, re.S)
    records = unique(f"{clean(label)}|{slug}" for slug, label in matches)
    lines = ["items:"]
    for record in records:
        name, slug = record.rsplit("|", 1)
        lines.extend([f"  - name: {yaml_scalar(name)}", f"    source_url: {yaml_scalar(urljoin(BASE, f'topics/{slug}/'))}"])
    (ROOT / "data" / "topics.yaml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(records)


def main() -> None:
    event_index = fetch("events/")
    news_index = fetch("news/")
    slugs = event_slugs(event_index)
    news = news_slugs(news_index)
    print(f"Importing {len(slugs)} events and {len(news)} news posts.")

    gallery_count = 0
    for number, slug in enumerate(slugs, start=1):
        print(f"[{number}/{len(slugs)}] event {slug}")
        try:
            gallery_count += import_event(slug)
        except Exception as error:
            print(f"  skipped event {slug}: {error}", file=sys.stderr)
        time.sleep(0.05)

    for number, slug in enumerate(news, start=1):
        print(f"[{number}/{len(news)}] news {slug}")
        try:
            import_news(slug)
        except Exception as error:
            print(f"  skipped news {slug}: {error}", file=sys.stderr)
        time.sleep(0.05)

    topic_count = import_topics()
    print(f"Imported {len(slugs)} events, {len(news)} news posts, {topic_count} topics, and {gallery_count} gallery thumbnails.")


if __name__ == "__main__":
    main()
