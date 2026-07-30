# Lernziele Elektroniker EFZ

Interaktive Übersicht über den Bildungsplan für Elektronikerinnen und Elektroniker EFZ. Die Lernziele werden aus den offiziellen Daten von [skills.futuremem.swiss](https://skills.futuremem.swiss/) aufbereitet und in einer durchsuchbaren, filterbaren Hierarchie dargestellt.

👉 **Live:** https://chrigu.github.io/lehrplan-elektroniker/

Dieses Tool richtet sich an Lernende, Berufsbildnerinnen, Lehrpersonen und alle, die sich einen schnellen, strukturierten Überblick über die Lerninhalte der Elektroniker-Grundbildung verschaffen wollen.

## Hierarchie

**HKB** (Handlungskompetenzbereich) → **HK** (Handlungskompetenz) → **LK** (Leistungskriterium) → **LZ** (Lernziel)

Die Gliederung folgt dem kompetenzorientierten Bildungsplan (BPL) der Berufsbildung Elektroniker/in EFZ.

## Datenquellen

- **skills.futuremem.swiss** – offizielle Lernzielplattform von Swissmem
- **Bildungsplan** – becc.admin.ch (BECC)
- **Berufsverordnung** – SBFI

## Features

- **Suche** über alle LZ, LK, HK und HKB (Fuzzy-Suche via Fuse.js)
- **Filter** nach Bereich, Typ (Pflicht/Wahl), Lernort (BFS/üK/BE) und Semester
- **Querverweise** – Lernziele, die in mehreren LKs vorkommen, werden verlinkt
- **Highlight** – `?highlight=lk-MEM_08_02` in der URL springt direkt zu einem bestimmten LK
- **Alle einklappen/ausklappen** für schnelle Navigation

## Deployment

Die Seite wird via **GitHub Pages** gehostet. Einfach den `main`-Branch pushen – alle Änderungen an `index.html`, `script.js`, `style.css` und `data/lehrplan.json` werden automatisch veröffentlicht.

## Datenaktualisierung

Die Skripte in `data/` laden die aktuellen Excel-Daten von skills.futuremem.swiss und bereiten sie auf. Das Ergebnis ist `data/lehrplan.json`, die hierarchisch gegliederte Zieldatei für die Webseite.

```bash
# 1. Excel-Dateien herunterladen
python3 data/download_excel.py

# 2. Daten aus allen drei Lernorten (BFS, üK, BE) zusammenführen
python3 data/merge_lehrplan.py -bpl ET

# 3. Beschreibungen von HKB, HK, LK von der Website scrapen
python3 data/scrape_hkb.py
python3 data/scrape_hk.py
python3 data/scrape_lk.py

# 4. Hierarchisches JSON erstellen
python3 data/csv_to_json.py

# 5. Doppelte Lernziele zusammenführen
python3 data/deduplicate_lernziele.py
```
