# KRS Website

Website fuer Knowledge Retention Solutions GmbH.

## Quick Start

```bash
# Website lokal oeffnen
open index.html

# Oder mit Python HTTP Server (fuer korrekte Pfade)
python3 -m http.server 8000
# Dann: http://localhost:8000
```

## Struktur

```
website/
├── index.html          # Hauptseite
├── impressum.html      # Impressum (rechtlich erforderlich)
├── datenschutz.html    # Datenschutzerklaerung (DSGVO)
├── css/
│   └── styles.css      # Design System + alle Styles
├── js/
│   └── main.js         # Mobile Menu Toggle
├── images/
│   ├── krs-logo.svg    # Logo (TODO: SVG erstellen)
│   └── og-image.jpg    # Social Media Preview (TODO)
└── README.md
```

## Design System

Farben und Typografie basieren auf dem [Brand Book](/operations/knowledge/branding/brand-book.md).

### Farben

| Name | Hex | Verwendung |
|------|-----|------------|
| Nachtblau | `#1A365D` | Primaerfarbe, Headlines, Buttons |
| Anthrazit | `#2D3748` | Sekundaertext, Footer |
| Bernstein | `#C27B2D` | Akzente, Highlights |
| Sandstein | `#E8DED1` | Hintergrund-Sections |

### Fonts

- **Headlines:** IBM Plex Serif (Google Fonts)
- **Body:** Inter (Google Fonts)
- **Minimum Body:** 18px (Zielgruppe 50+)

## TODO vor Go-Live

### Pflicht

- [ ] **Logo:** SVG-Version des Logos in `/images/krs-logo.svg` ablegen
- [ ] **Impressum:** Adresse, Telefon, Handelsregister-Nummer eintragen
- [ ] **Datenschutz:** Hosting-Anbieter eintragen
- [ ] **Domain:** `www.knowledge-retention-solutions.de` verlinken

### Optional

- [ ] **Team-Fotos:** Echte Fotos statt Initialen-Avatare
- [ ] **OG-Image:** Social Media Preview erstellen (1200x630px)
- [ ] **Google Calendar:** Appointment Scheduling einbetten
- [ ] **Analytics:** Privacy-friendly Tracking (z.B. Plausible, Fathom)

## Deployment

### Option 1: Netlify (empfohlen)

1. Repository mit GitHub verbinden
2. Build-Befehl: (leer, keine Build-Schritte)
3. Publish-Directory: `tech/website`
4. Custom Domain einrichten

### Option 2: Vercel

1. `vercel` CLI installieren
2. `cd tech/website && vercel`
3. Domain in Vercel Dashboard einrichten

### Option 3: GitHub Pages

1. Repository Settings > Pages
2. Source: Branch `main`, Folder `/tech/website`
3. Custom Domain einrichten

## Lokale Entwicklung

Die Website benoetigt keine Build-Schritte. Einfach `index.html` im Browser oeffnen oder einen lokalen Server starten:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (falls installiert)
npx serve .
```

## Browser-Unterstuetzung

- Chrome (aktuelle Version)
- Firefox (aktuelle Version)
- Safari (aktuelle Version)
- Edge (aktuelle Version)

Mobile:
- iOS Safari
- Android Chrome

## Lighthouse Ziele

| Metrik | Ziel |
|--------|------|
| Performance | > 90 |
| Accessibility | > 90 |
| Best Practices | > 90 |
| SEO | > 90 |

## Kontakt

Fragen? → info@knowledge-retention-solutions.de
