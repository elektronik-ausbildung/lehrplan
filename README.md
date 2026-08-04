# Lernziele Elektroniker EFZ

Interaktive Übersicht über den Bildungsplan für Elektronikerinnen und Elektroniker EFZ. Die Lernziele werden aus den offiziellen Daten von [skills.futuremem.swiss](https://skills.futuremem.swiss/) aufbereitet und in einer durchsuchbaren, filterbaren Hierarchie dargestellt.

👉 **Live:** https://elektronik-ausbildung.github.io/lehrplan/

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

## Druckbare Zielblätter (Typst/PDF)

Aus `data/lehrplan.json` lassen sich druckbare Zielblätter erzeugen, auf denen Lernende erreichte Ziele abhaken und signieren können.

```bash
# Alle drei Dokumente generieren und zu PDF kompilieren
./pdf/generate.sh
```

Die drei Dokumente landen in `pdf/output/`:

| Datei | Inhalt |
| --- | --- |
| `pdf/output/Lernziele_Elektroniker_Betrieb.typ` / `.pdf` | Alle Leistungskriterien für den Lernort **Betrieb (BE)** |
| `pdf/output/Lernziele_Elektroniker_Berufsschule.typ` / `.pdf` | Alle Ziele für die **Berufsschule (BFS)**, sortiert nach Semestern |
| `pdf/output/Lernziele_Elektroniker_Ueberbetriebliche_Kurse.typ` / `.pdf` | Alle Ziele für die **überbetrieblichen Kurse (üK)**, sortiert nach Semestern |

Jedes Dokument beginnt mit einer **Titelseite** (Name, Startjahr, Firma), einem
**Inhaltsverzeichnis** und einem Kapitel **«Hinweise und Überblick»**, das die Begriffe
HKB, HK, LK und LZ erklärt und eine Übersicht über alle Handlungskompetenzbereiche mit
deren Pflicht-/Wahl-Status zeigt. Ab dem Inhaltsverzeichnis tragen alle Seiten einen
**Kopf** (Titel links, Untertitel rechts) und eine **Fusszeile** (Bildungsplan-Notiz
links, Seitenzahl rechts). Die Ziele sind hierarchisch nach HKB → HK → LK (→ LZ)
gegliedert. Jede Handlungskompetenz ist mit einem **Pflicht/Wahl-Badge** markiert
(Pflicht dunkelblau, Wahl grau), und die **Tabellenköpfe sind entsprechend eingefärbt**:
dunkelblau für Pflicht-HKs, grau für Wahl-HKs. Leistungskriterien stehen als
**hervorgehobene Gruppenzeilen** (leicht eingefärbt, mit Akzent-Trennlinie) in einer
Tabelle mit Signaturspalte, Lernziele darunter **eingerückt**, kleiner und ausgegraut –
so ist die Hierarchie LK → LZ auf einen Blick erkennbar.

### Layout anpassen

Das Layout ist in **Jinja2-Templates** unter `pdf/templates/` ausgelagert – Farbschema,
Schriften, Abstände und Tabellenoptik lassen sich dort ändern, ohne den Python-Code
anzufassen:

| Template | Inhalt |
| --- | --- |
| `pdf/templates/base.typ.j2` | Einstieg + **DESIGN-Block** (Farben, Schriften, Heading-Styles) |
| `pdf/templates/title_page.typ.j2` | Titelseite mit Feldkarte (Name, Startjahr, Firma) |
| `pdf/templates/toc.typ.j2` | Inhaltsverzeichnis + Start von Seitennummerierung, Kopf und Fusszeile |
| `pdf/templates/overview.typ.j2` | Kapitel «Hinweise und Überblick» (Struktur + HKB/HK-Übersicht) |
| `pdf/templates/table.typ.j2` | Tabellen-Makros `lk_row`, `lz_row`, `lk_table` |

Zum Anpassen des Farbschemas genügt der DESIGN-Block in `base.typ.j2`:

```typst
#let accent = rgb("#16213e")        // Hauptfarbe (Titel, Tabellenkopf)
#let accent-soft = rgb("#e9edf5")   // helle Flächen (Lernziel-Zeilen, Karte)
#let muted = rgb("#5b6474")         // Nebentexte
#let faint = rgb("#8a93a6")         // IDs, Fusszeilen
#let border-color = rgb("#d3d9e4")  // Tabellenrahmen
```

Danach reicht `./pdf/generate.sh`, um die Dokumente neu zu erzeugen und zu kompilieren.

### Skript direkt verwenden

```bash
# Einzelnes Dokument mit Optionen erzeugen
python3 pdf/generate_lehrplan_typ.py ../data/lehrplan.json \
    --lernort BE --no-descriptions --signature both \
    -o output/Lernziele_Elektroniker_Betrieb.typ

# Zu PDF kompilieren (Typst muss installiert sein)
typst compile pdf/output/Lernziele_Elektroniker_Betrieb.typ
```

Optionen:

| Option | Bedeutung |
| --- | --- |
| `--lernort BE\|BFS\|üK` | Nur Ziele dieses Lernorts (mehrfach angeben möglich) |
| `--by-semester` | Ziele nach Semestern gruppieren, pro Semester ein Kapitel |
| `--show-descriptions` / `--no-descriptions` | Lange HK-Beschreibungen anzeigen/ausblenden |
| `--signature both\|lk\|lz\|none` | Signaturspalte pro LK+LZ, nur LK, nur LZ oder keine |
| `--name`, `--start-year`, `--company` | Kopfzeile vorausfüllen (sonst Leerzeilen) |
| `-o DATEI` | Ausgabedatei (Standard: `output/Lernziele_Elektroniker_<Lernort>.typ`) |

Als Eingabe kann neben der vollständigen Datei auch **jede Teilmenge** von
`lehrplan.json` verwendet werden, solange sie das gleiche Schema hat
(`{"ET": {"handlungskompetenzbereiche": [...]}}` oder direkt
`{"handlungskompetenzbereiche": [...]}`).

> Hinweis: `generate.sh` erwartet eine installierte Typst-Binärdatei (`typst`).
