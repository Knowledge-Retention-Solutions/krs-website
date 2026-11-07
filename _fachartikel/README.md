# Fachartikel

Quellen der Artikelseiten unter `/fachartikel/` (Deutsch) und `/en/articles/` (Englisch).
Ordner mit Unterstrich veröffentlicht GitHub Pages nicht.

## Neuer Artikel

1. Je Sprache eine Datei anlegen: `<id>.de.md` und `<id>.en.md` (gleiche `id`).
2. Kopfdaten: `id`, `lang`, `slug`, `title`, `description`, `date` (JJJJ-MM-TT), `topic`, `linkedin`,
   dazu `cover` und `cover_alt` oder, ohne Titelbild, `card_text`.
3. Text: Absätze durch Leerzeilen trennen. `## ` für Zwischenüberschriften, `> ` für Zitate,
   `[Text](URL)` für Links. Abbildung: erste Zeile `![Alt-Text](images/...png)`, folgende Zeilen sind die Bildunterschrift.
4. Bilder unter `images/fachartikel/<id>/` ablegen.
5. Seiten erzeugen: `python3 _tools/build_fachartikel.py` (im Website-Ordner). Übersichten, Artikelseiten, `sitemap.xml` und `llms.txt` werden neu geschrieben.
   Neue statische Seiten außerhalb der Artikel in `STATIC_PAIRS` im Skript ergänzen, damit sie in der Sitemap stehen.

## Grafiken

Die deutschen Fassungen der Grafiken liegen als Quelle in `abbildungen/` (HTML oder SVG).
Rendern bei laufendem lokalen Server (`python3 -m http.server 8208`):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1920,1080 --screenshot=images/fachartikel/<id>/<name>.png \
  http://localhost:8208/_fachartikel/abbildungen/<name>.html
```
