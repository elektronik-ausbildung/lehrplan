# Anomalien und Inkonsistenzen in `data/lehrplan.json`

Analyse vom 2026-07-31. Umfang: 4 HKB, 24 HK, 444 LK, 847 LZ-Records (592 eindeutige LZ-IDs).

---

## 1. Doppelte LK-IDs (11 Records, 10 Codes)

Diese LK-Codes kommen 2–3× vor, mit **unterschiedlichen** Semesterlisten und unterschiedlichem Inhalt:

| LK-ID | Vorkommen | Semester | In HK |
|---|---|---|---|
| `ET a2 04` | 2 | 1–4 / 3–6 | 9999 a.02 / 9999 a.03 |
| `MEM 02 09` | 2 | 2 / 1 | 9999 a.03 / 9999 d.01 |
| `ET b1 20` | 2 | 4,8 / 3 | 9999 b.01 / 9999 c.02 |
| `ET b1 05` | 2 | 3–8 / 3–8 | 9999 b.01 / 9999 b.02 |
| `ET b6 08` | 2 | 2,3 / 5–8 | 9999 b.04 / 9999 b.06 |
| `ET b4 11` | 2 | 2,3 / 3 | 9999 b.04 / 9999 b.05 |
| `ET b5 01` | 2 | 5–8 / 3–8 | 9999 b.05 / 9999 c.02 |
| `ET c1 02` | 2 | 3–8 / 5,6 | 9999 c.01 / 9999 c.05 |
| `ET b3 04` | 3 | 1–4 / 5–8 / 5,6 | 9999 b.03 / 9999 b.06 / 9999 d.05 |
| `ET c1 03` | 3 | 3–8 / 5,6 / 5,6 | 9999 c.01 / 9999 c.04 / 9999 c.05 |

## 2. Doppelte LZ-IDs (140+ Codes mehrfach verwendet)

847 LZ-Records, aber nur 592 eindeutige LZ-IDs. Viele sind absichtlich über LKs dupliziert (markiert über das `duplicated`-Feld), z. B.:
- `LZ_954` ×12, `LZ_1070` ×13, `LZ_9385` ×12, `LZ_9384` ×8, `LZ_9382` ×6, `LZ_9012` ×5, `LZ_9579` ×5, `LZ_9573` ×5

Hinweis: Die Daten stammen aus dem Merge von drei Excel-Dateien (BFS, üK, BE). Merge-Korrektheit prüfen.

## 3. `duplicated`-Feld Inkonsistenzen

- `LZ_10095`, `LZ_10096`: kommen in **zwei** LK-Records vor (beide heissen `ET b4 11`), tragen aber **kein** `duplicated`-Feld — alle anderen Mehrfach-Vorkommen haben eines.
- Manche `duplicated`-Referenzen verweisen auf LKs, in denen das LZ existiert, aber die Referenzliste unterscheidet sich zwischen den beiden Vorkommen (z. B. `LZ_9012`: 4 LKs an einer Stelle, 5 an anderer).

## 4. HKB/HK-Codeschema inkonsistent

- HKB-IDs sind Platzhalter `9999 a`–`9999 d`; HK-IDs `9999 a.01` usw. Die LK-IDs verwenden jedoch echte Codes (`ET`, `MEM`, `xx`, `KR`, `AU`, `PM`). Es gibt keine Zuordnung, die `9999 a` mit `ET a1…`/`MEM…` verbindet.
- HK-Reihenfolge innerhalb der HKB ist durcheinander:
  - HKB 9999 a: `.02, .03, .01`
  - HKB 9999 b: `.01, .04, .03, .02, .05, .06, .07`

## 5. HK `Name`-Gross-/Kleinschreibung inkonsistent

9 von 24 HK-Namen beginnen klein (`die Machbarkeit…`, `elektronische Schaltungen…`, `das Layout…`, …), der Rest beginnt gross. Gemischte Quellformatierung.

## 6. Lernort-Suffixe inkonsistent

`(BE)` / `(üK)` wird nur bei einem Teil der LK-IDs angehängt:
- 242 LKs mit `Lernort: BE` ohne `(BE)` im ID (21 haben es)
- 43 LKs mit `Lernort: üK` ohne Suffix (21 haben es)

## 7. 263 LKs (von 444) mit leerem `lernziele`-Array

Beispiele: `KR a2 05`, `ET a2 01`, `ET a2 04`, `ET a1 01`, `ET b1 01`, `ET b1 05`, `ET b3 04`, `ET b5 01`, `ET c1 02`, `ET c1 03`, … (praktisch alle BE/üK-LKs ohne Detail-Lernziele).

## 8. Unsorierte `Semester`-Arrays (21 LZ-Records)

Beispiele:
- `LZ_71` `['3','2']`, `LZ_1423` `['3','2']`
- `LZ_1949` `['1','3','4','2']`
- `LZ_4276` `['3','1','4']`, `LZ_9579` `['3','1']`
- `LZ_5_1` `['2','1','3','4']`, `LZ_5_2` `['2','1']`, `LZ_6_1` `['2','1','3','4']`
- `LZ_3` `['8','3','4']`, `LZ_16_2` `['4','3']`, `LZ_17` `['4','3']`
- `LZ_9169` `['3','2']`, `LZ_9062` `['3','2']`, `LZ_144` `['3','2']`, `LZ_9379` `['3','2']`, `LZ_10095` `['3','2']`, `LZ_10096` `['3','2']`
- `LZ_9385` `['4','2']`

## 9. `Abfolge`/`Lektionen`/`Note zu HKB`-Anzahl weicht von `ID LFE` ab

Gemergte LZs haben kommagetrennte Werte mit inkonsistenter Kardinalität:
- `LZ_44`: 4 LFE-Werte, aber 1 Abfolge, 1 Lektionen, 3 Note-Werte (`0, 1, 1`)
- `LZ_3`: 5 LFE, aber 2 Abfolge / 2 Lektionen
- `LZ_1_`: 3 LFE, aber Abfolge `3, 4` (2 Werte)
- `LZ_1949`: 4 LFE, aber 3 Lektionen
- `LZ_5_1`: 5 LFE, 5 Abfolge inkl. doppeltem Wert `2`
- `LZ_954`: 3–4 LFE vs. Lektionen `2, 1, 0` (enthält eine `0`)
- ~80 weitere ähnliche Mismatches (siehe Analyse-Skript)

## 10. Abfolge-/Reihenfolge-Anomalien

- Doppelte `Abfolge`-Werte innerhalb desselben LK:
  - MEM 08 03: Abfolge 1 vierfach, Abfolge 2 doppelt
  - ET b1 06: Abfolge 2 dreifach
  - MEM 08 02: Abfolge 2 dreifach, Abfolge 0 doppelt, Abfolge 3 doppelt
  - weitere: MEM 10 05/06/07, ET b1 07, ET b1 08, ET b1 20, ET b1 13, ET b1 11, ET c1 11, xx d2 11
- `Abfolge`-Sequenzen nicht zusammenhängend (z. B. `MEM 08 02`: 0–9 mit Lücken; `MEM 11 11`: 6, 12; `xx d2 13`: 0, 11; `xx d3 12`: 0, 14; `xx d3 16`: 0, 15)
- 19 LKs listen `lernziele` in einer Reihenfolge, die zu den `Abfolge`-Werten inkonsistent ist (z. B. MEM 08 03 listet LZ_6957 zuerst, dessen Abfolge 1 ist, während LZ_78 Abfolge 0 hat)

## 11. Text-/Datenartefakte

- **`_x000D_` (Excel-Zeilenumbruch-Escape)** in 6 LZ-Beschreibungen: `LZ_9508`, `LZ_9045`, `LZ_9078`, `LZ_9458`, `LZ_9011`, `LZ_9604_2`
- **Dreifach wiederholte Phrase** in `LZ_1_` @MEM 08 03, Handlungsnotwendiges Wissen: «Grundoperationen, Formeln umstellen, SI-Einheiten, Taschenrechnerbedienung» ×3 (Merge-Artefakt)
- Nachgestellte Leerzeichen in 5 `Handlungsnotwendiges Wissen`-Feldern (`LZ_11190`, `LZ_11192`, `LZ_11201`, `LZ_11199`, `LZ_9104`)
- `LZ_9417`: Text enthält wörtliche Anführungszeichen («neusten technologien», «be…»); `LZ_11201`: «manuelles Testen , » mit Leerzeichen vor Komma
- Tippfehler: `LZ_12_2` «Sie **mulitiplizieren** und dividieren Brüche.»; HKB a-Beschreibung enthält `Makeorbuy` und `Recyclierbarkeit` (Wortzusammensetzungen ohne Leerzeichen)

## 12. Ungewöhnliche ID-Formate

- Nicht-standardisierte LZ-IDs mit Unterstrich-Suffix (vermutlich Dedup-Artefakte der Originalquelle): `LZ_1_`, `LZ_1_2`, `LZ_1_3`, `LZ_7_1`, `LZ_5_1`, `LZ_5_2`, `LZ_19_1`, `LZ_19_2`, `LZ_19_3`, `LZ_11_1`, `LZ_11_2`, `LZ_12_1`, `LZ_12_2`, `LZ_16_2`, `LZ_6_1`, `LZ_6_2`, `LZ_9006_1`, `LZ_9603_2`, `LZ_9604_2`, `LZ_9605_2`, `LZ_9606_2`, `LZ_9610_1`, `LZ_9611_1`, `LZ_9612_1`, `LZ_108_1`
- `LZ_9508` hat doppeltes `_x000D__x000D_`-Suffix

## 13. `Note zu HKB`-Anomalie

- Einziger LZ mit mehrwertigem `Note zu HKB: "0, 1, 1"`: `LZ_44` (alle anderen sind `0` oder `1`)
- LZs mit Note `0` (z. B. `LZ_1923`, `LZ_3115`, `LZ_1918`, `LZ_4066`, viele `LZ_1106x`-Englisch-LZs) vs. Note `1` — Semantik unklar/inkonsistent

## 14. Gleicher Text, unterschiedliche LZ-IDs (nicht gemergte Duplikate)

Identische `Beschreibung LZ` unter **verschiedenen** IDs, ohne Querverweis:
- `LZ_11196` / `LZ_11207` / `LZ_11211` — «Sie konzipieren einfache Programme grafisch.»
- `LZ_9156` / `LZ_9164` — «Sie visualisieren die Abfolge von Arbeitsschritte in einem Prozessdiagramm.» (auch Grammatikfehler «Arbeitsschritte»)
- `LZ_9384` / `LZ_9425` / `LZ_9437` — «Sie dokumentieren alle Arbeitsschritte und reagieren auf Änderungen.» (alle drei erscheinen wiederholt über LKs)

## 15. Grammatikfehler

- `LZ_9156` / `LZ_9164`: «die Abfolge von Arbeitsschritte» → sollte «Arbeitsschritten» heissen

---

## Priorität für die Nacharbeit

1. **#1–3** – doppelte Codes und inkonsistente `duplicated`-Referenzen
2. **#8–9** – Merge-Artefakte in Semester/Abfolge/Lektionen
3. **#11** – Excel-`_x000D_`-Artefakte und Textfehler
4. **#7** – 263 LKs mit leeren `lernziele`-Arrays (Absicht prüfen)
5. **#4–6, #10, #12–15** – Struktur-/Format-Harmonisierung
