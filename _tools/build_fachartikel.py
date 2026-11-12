#!/usr/bin/env python3
"""Build the article pages (DE: /fachartikel/, EN: /en/articles/) from _fachartikel/*.md.

Each source file has a small frontmatter block and a body in a Markdown subset:
'## ' headings, '> ' quotes, image paragraphs (first line '![alt](path)', the
remaining lines are the caption), [text](url) links and **bold**.
Run from the website root:  python3 _tools/build_fachartikel.py
"""
from __future__ import annotations

import html
import math
import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_fachartikel"
SITE = "https://www.knowledge-retention-solutions.de/"
MONTHS = {
    "de": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
}
UI = {
    "de": {
        "base": "fachartikel/", "home": "", "lang_label": "DE",
        "nav": [("#loesung", "Corporate Memory"), ("#angebote", "Angebote"), ("#stimmen", "Stimmen"), ("#team", "Team")],
        "nav_articles": "Fachartikel", "contact": "Kontakt", "contact_anchor": "#kontakt",
        "claim": "Wissen sichern. Wissen skalieren.", "menu": "Menü öffnen", "nav_label": "Hauptnavigation",
        "eyebrow": "Fachartikel", "head_title": "Wissen aus der Praxis",
        "head_sub": "Was wir in Projekten, Interviews und unseren eigenen Meetings über Erfahrungswissen lernen. Die Artikel sind zuerst auf LinkedIn erschienen.",
        "list_title": "Fachartikel", "tag": "Artikel", "more": "Weiterlesen →", "minutes": "Min. Lesezeit",
        "back": "← Alle Fachartikel", "role": "Mitgründer, Knowledge Retention Solutions",
        "origin": 'Zuerst erschienen auf <a href="{url}" target="_blank" rel="noopener">LinkedIn</a> (Englisch). Für die Website übersetzt.',
        "bio": "Mitgründer von Knowledge Retention Solutions. Baut mit seinem Team Wissensbasen aus Interviews, Dokumenten und Meetings, die Menschen und KI-Assistenten im Unternehmen nutzen können.",
        "cta_title": "Fragen zu einem Thema?", "cta_sub": "Schreiben Sie uns eine kurze E-Mail. Wir melden uns direkt bei Ihnen.",
        "imprint": ("impressum.html", "Impressum"), "privacy": ("datenschutz.html", "Datenschutz"),
        "list_desc": "Fachartikel von Knowledge Retention Solutions zu Erfahrungswissen, Interviews, Meeting-Transkripten und Wissensbasen für Menschen und KI.",
    },
    "en": {
        "base": "en/articles/", "home": "en/", "lang_label": "EN",
        "nav": [("#solution", "Solution"), ("#process", "Process"), ("#voices", "Voices"), ("#team", "Team")],
        "nav_articles": "Articles", "contact": "Contact", "contact_anchor": "#contact",
        "claim": "Capture Knowledge. Scale Expertise.", "menu": "Open menu", "nav_label": "Main navigation",
        "eyebrow": "Articles", "head_title": "Insights from practice",
        "head_sub": "What we learn about experience-based knowledge from projects, interviews and our own meetings. The articles first appeared on LinkedIn.",
        "list_title": "Articles", "tag": "Article", "more": "Read more →", "minutes": "min read",
        "back": "← All articles", "role": "Co-founder, Knowledge Retention Solutions",
        "origin": 'Originally published on <a href="{url}" target="_blank" rel="noopener">LinkedIn</a>.',
        "bio": "Co-founder of Knowledge Retention Solutions. Builds knowledge bases from interviews, documents and meetings that people and AI assistants across a company can use.",
        "cta_title": "Questions about a topic?", "cta_sub": "Send us a short email. We will get back to you directly.",
        "imprint": ("en/imprint.html", "Imprint"), "privacy": ("en/privacy.html", "Privacy Policy"),
        "list_desc": "Articles by Knowledge Retention Solutions on experience-based knowledge, interviews, meeting transcripts and knowledge bases for people and AI.",
    },
}
MAIL_ICON = ('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
             'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect>'
             '<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>')
MENU_ICON = ('<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" '
             'stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>')


@dataclass
class Article:
    meta: dict[str, str]
    body: str

    @property
    def lang(self) -> str:
        return self.meta["lang"]

    @property
    def path(self) -> str:
        return UI[self.lang]["base"] + self.meta["slug"] + "/"

    @property
    def minutes(self) -> int:
        return max(1, math.ceil(len(re.findall(r"\w+", self.body)) / 200))


def parse(file: Path) -> Article:
    text = file.read_text(encoding="utf-8")
    _, head, body = text.split("---\n", 2)
    meta = {}
    for line in head.strip().splitlines():
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return Article(meta, body.strip())


def inline(text: str, prefix: str) -> str:
    out = html.escape(text, quote=False)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)

    def link(m: re.Match[str]) -> str:
        label, url = m.group(1), m.group(2)
        if url.startswith("http"):
            return f'<a href="{url}" target="_blank" rel="noopener">{label}</a>'
        return f'<a href="{prefix}{url}">{label}</a>'

    return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, out)


def render_body(body: str, prefix: str) -> str:
    blocks = []
    for block in re.split(r"\n\s*\n", body):
        lines = block.strip().splitlines()
        first = lines[0]
        if first.startswith("## "):
            blocks.append(f"<h2>{inline(first[3:], prefix)}</h2>")
        elif first.startswith("> "):
            quote = " ".join(line[2:] for line in lines)
            blocks.append(f"<blockquote><p>{inline(quote, prefix)}</p></blockquote>")
        elif m := re.match(r"!\[([^\]]*)\]\(([^)]+)\)$", first):
            caption = inline(" ".join(lines[1:]), prefix)
            alt = html.escape(m.group(1))
            blocks.append(f'<figure>\n  <img src="{prefix}{m.group(2)}" alt="{alt}" loading="lazy">\n'
                          f"  <figcaption>{caption}</figcaption>\n</figure>")
        else:
            blocks.append(f"<p>{inline(' '.join(lines), prefix)}</p>")
    return "\n".join(blocks)


def date_label(iso: str, lang: str) -> str:
    year, month, day = (int(x) for x in iso.split("-"))
    name = MONTHS[lang][month - 1]
    return f"{day}. {name} {year}" if lang == "de" else f"{day} {name} {year}"


def page(lang: str, prefix: str, title: str, desc: str, path: str, alt_path: str, body: str,
         og_type: str = "website", image: str | None = None, active_list: bool = False) -> str:
    ui = UI[lang]
    other = "en" if lang == "de" else "de"
    paths = {lang: path, other: alt_path}
    home = prefix + ui["home"]
    nav = "\n".join(f'        <li><a href="{home}{a}" class="nav__link">{label}</a></li>' for a, label in ui["nav"])
    current = ' aria-current="page"'
    og_image = SITE + (image or "images/og-image.jpg?v=2")
    active = ' class="is-active"'
    lang_links = "\n".join(
        f'            <a href="{prefix}{paths[code]}"{active if code == lang else ""} hreflang="{code}">{code.upper()}</a>'
        for code in ("de", "en"))
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(desc)}">
  <meta property="og:title" content="{html.escape(title)}">
  <meta property="og:description" content="{html.escape(desc)}">
  <meta property="og:type" content="{og_type}">
  <meta property="og:url" content="{SITE}{path}">
  <meta property="og:image" content="{og_image}">
  <link rel="canonical" href="{SITE}{path}">
  <link rel="alternate" hreflang="de" href="{SITE}{paths['de']}">
  <link rel="alternate" hreflang="en" href="{SITE}{paths['en']}">
  <link rel="alternate" hreflang="x-default" href="{SITE}{paths['de']}">
  <link rel="icon" type="image/svg+xml" href="{prefix}images/krs-logo.svg">
  <link rel="stylesheet" href="{prefix}css/redesign.css">
  <link rel="stylesheet" href="{prefix}css/blog.css">
</head>
<body>

  <nav class="nav" id="nav" aria-label="{ui['nav_label']}">
    <div class="nav__inner">
      <a href="{home}" class="nav__logo" aria-label="KRS – Knowledge Retention Solutions">
        <span class="nav__wordmark">KRS</span>
      </a>
      <span class="nav__claim">{ui['claim']}</span>
      <ul class="nav__menu" id="navMenu">
{nav}
        <li><a href="{prefix}{ui['base']}" class="nav__link"{current}>{ui['nav_articles']}</a></li>
        <li><a href="{home}{ui['contact_anchor']}" class="btn btn--primary nav__cta">{ui['contact']}</a></li>
        <li>
          <div class="lang-switch">
{lang_links}
          </div>
        </li>
      </ul>
      <button class="nav__toggle" id="navToggle" aria-label="{ui['menu']}" aria-expanded="false" aria-controls="navMenu">
        {MENU_ICON}
      </button>
    </div>
  </nav>

  <main>
{body}
    <section class="cta">
      <div class="container">
        <h2 class="cta__title">{ui['cta_title']}</h2>
        <hr class="accent-line">
        <p class="cta__sub">{ui['cta_sub']}</p>
        <a href="mailto:info@krs-gmbh.de" class="cta__mail">
          {MAIL_ICON}
          <span>info@krs-gmbh.de</span>
        </a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__inner">
        <span>&copy; 2026 Knowledge Retention Solutions GmbH</span>
        <span class="footer__sep">&middot;</span>
        <a href="{prefix}{ui['imprint'][0]}">{ui['imprint'][1]}</a>
        <span class="footer__sep">&middot;</span>
        <a href="{prefix}{ui['privacy'][0]}">{ui['privacy'][1]}</a>
      </div>
    </div>
  </footer>

  <script src="{prefix}js/redesign.js"></script>
</body>
</html>
"""


def media(a: Article, prefix: str) -> str:
    if a.meta.get("cover"):
        return f'<div class="article-card__media"><img src="{prefix}{a.meta["cover"]}" alt="" loading="lazy"></div>'
    return f'<div class="article-card__media article-card__media--text"><span>{a.meta["card_text"]}</span></div>'


def article_page(a: Article, twin: Article) -> str:
    ui = UI[a.lang]
    prefix = "../" * a.path.count("/")
    m = a.meta
    cover = (f'        <figure class="article__cover"><img src="{prefix}{m["cover"]}" alt="{html.escape(m["cover_alt"])}"></figure>\n'
             if m.get("cover") else "")
    body = f"""    <article class="article">
      <div class="article__inner">
        <nav class="breadcrumb"><a href="{prefix}{ui['base']}">{ui['back']}</a></nav>
        <span class="eyebrow">{ui['tag']} · {m['topic']}</span>
        <h1 class="article__title">{m['title']}</h1>
        <p class="article__lead">{m['description']}</p>
        <div class="byline">
          <img class="byline__photo" src="{prefix}images/team-eugen.jpg" alt="Dr. Eugen Neu">
          <div>
            <div class="byline__name">Dr. Eugen Neu</div>
            <div class="byline__meta">{ui['role']} · {date_label(m['date'], a.lang)} · {a.minutes} {ui['minutes']}</div>
          </div>
        </div>
        <p class="origin-note">{ui['origin'].format(url=m['linkedin'])}</p>
{cover}        <div class="prose">
{render_body(a.body, prefix)}
        </div>
        <aside class="author-box">
          <img src="{prefix}images/team-eugen.jpg" alt="Dr. Eugen Neu">
          <div>
            <p class="author-box__name">Dr. Eugen Neu</p>
            <p class="author-box__bio">{ui['bio']}</p>
          </div>
        </aside>
        <a class="article__back" href="{prefix}{ui['base']}">{ui['back']}</a>
      </div>
    </article>
"""
    return page(a.lang, prefix, f"{m['title']} | KRS", m["description"], a.path, twin.path, body,
                og_type="article", image=m.get("cover"))


def list_page(lang: str, articles: list[Article]) -> str:
    ui = UI[lang]
    prefix = "../" * ui["base"].count("/")
    cards = []
    for a in articles:
        m = a.meta
        cards.append(f"""        <li>
          <a class="article-card" href="{m['slug']}/">
            {media(a, prefix)}
            <div>
              <div class="article-card__meta"><span class="tag">{ui['tag']}</span><span>{date_label(m['date'], lang)}</span><span>{a.minutes} {ui['minutes']}</span><span>Dr. Eugen Neu</span></div>
              <h2 class="article-card__title">{m['title']}</h2>
              <p class="article-card__teaser">{m['description']}</p>
              <span class="article-card__more">{ui['more']}</span>
            </div>
          </a>
        </li>""")
    body = f"""    <header class="page-head">
      <div class="container">
        <span class="eyebrow">{ui['eyebrow']}</span>
        <h1 class="page-head__title">{ui['head_title']}</h1>
        <p class="page-head__sub">{ui['head_sub']}</p>
      </div>
    </header>
    <div class="container">
      <ol class="article-list" reversed>
{chr(10).join(cards)}
      </ol>
    </div>
"""
    other = "en" if lang == "de" else "de"
    return page(lang, prefix, f"{ui['list_title']} | KRS – Knowledge Retention Solutions", ui["list_desc"],
                ui["base"], UI[other]["base"], body)


def main() -> None:
    articles = [parse(f) for f in sorted(SRC.glob("*.md")) if f.name != "README.md"]
    by_id: dict[str, dict[str, Article]] = {}
    for a in articles:
        by_id.setdefault(a.meta["id"], {})[a.lang] = a
    for lang in ("de", "en"):
        twin_lang = "en" if lang == "de" else "de"
        items = sorted((p[lang] for p in by_id.values()), key=lambda a: a.meta["date"], reverse=True)
        for a in items:
            out = ROOT / a.path / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(article_page(a, by_id[a.meta["id"]][twin_lang]), encoding="utf-8")
        listing = ROOT / UI[lang]["base"] / "index.html"
        listing.parent.mkdir(parents=True, exist_ok=True)
        listing.write_text(list_page(lang, items), encoding="utf-8")
    print(f"built {len(articles)} article pages and 2 overviews")


if __name__ == "__main__":
    main()
