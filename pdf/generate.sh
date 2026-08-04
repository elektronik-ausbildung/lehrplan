#!/usr/bin/env bash
# Generate the three Lernziele goal sheets and compile them to PDF.
set -euo pipefail
cd "$(dirname "$0")"

python3 generate_lehrplan_typ.py ../data/lehrplan.json --lernort BE -o output/Lernziele_Elektroniker_Betrieb.typ
python3 generate_lehrplan_typ.py ../data/lehrplan.json --lernort BFS --by-semester -o output/Lernziele_Elektroniker_Berufsschule.typ
python3 generate_lehrplan_typ.py ../data/lehrplan.json --lernort üK --by-semester -o output/Lernziele_Elektroniker_Ueberbetriebliche_Kurse.typ

for f in output/*.typ; do
  echo "Compiling $f"
  typst compile "$f"
done
echo "Done. PDFs are in output/"
