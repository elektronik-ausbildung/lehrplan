import { readFileSync, writeFileSync } from 'fs';

function parseCSV(text) {
  const rows = [];
  let inQuote = false;
  let current = '';
  let row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuote) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ',') {
        row.push(current.trim());
        current = '';
      } else if (ch === '\n' || ch === '\r') {
        if (current.trim() || row.length > 0) {
          row.push(current.trim());
          if (row.some(f => f)) rows.push(row);
        }
        current = '';
        row = [];
        if (ch === '\r') i++;
      } else {
        current += ch;
      }
    }
  }
  if (current.trim() || row.length > 0) {
    row.push(current.trim());
    if (row.some(f => f)) rows.push(row);
  }
  return rows;
}

const subjectsRaw = parseCSV(readFileSync('faecher-elo.csv', 'utf-8'));
const competencesRaw = parseCSV(readFileSync('handlungskompetenzen-elo.csv', 'utf-8'));
const goalsRaw = parseCSV(readFileSync('lernziele-elo.csv', 'utf-8'));

const subjects = subjectsRaw.slice(1).map(r => ({ code: r[0], name: r[1] }));
const competences = competencesRaw.slice(1).map(r => ({ code: r[0], name: r[1] }));
const goals = goalsRaw.slice(1).map(r => ({
  code: r[0],
  wahlPflicht: r[1],
  lernort: r[2],
  kriterium: r[3],
  niveau: r[4],
}));

writeFileSync('data.json', JSON.stringify({ subjects, competences, goals }, null, 2));
