#!/usr/bin/env node
/*
 * SIFI árfolyam-scraper
 * Letölti a data.json-ban megadott alapok oldalát, kiszedi az "A" sorozat
 * árfolyamát és értéknapját, és új pontot fűz a history-hoz, ha friss.
 * Node 20+ (beépített fetch). Nincs függőség.
 * Hiba esetén nem ír részlegeset és nem 0-val lép ki -> a GitHub Action elbukik és emailt küld.
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "data.json");

const HU_MONTHS = {
  "január": 1, "február": 2, "március": 3, "április": 4, "május": 5, "június": 6,
  "július": 7, "augusztus": 8, "szeptember": 9, "október": 10, "november": 11, "december": 12
};

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFund(text, fundName) {
  // Az oldalon az "A" sorozat kártyája az első -> onnan olvassuk az értéknapot és az árfolyamot.
  const aIdx = text.search(/[„“"']\s*A\s*[”"']\s*sorozat/i);
  const seg = aIdx >= 0 ? text.slice(aIdx, aIdx + 600) : text.slice(0, 600);

  const dateM = seg.match(/Értéknap\s*:?\s*(\d{4})\.\s*([A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+)\s*(\d{1,2})\./);
  const priceM = seg.match(/Árfolyam\s*:?\s*([0-9]{1,3}[.,][0-9]{3,6})\b/);

  if (!dateM) throw new Error(`[${fundName}] Nem találom az Értéknapot az "A" sorozatnál.`);
  if (!priceM) throw new Error(`[${fundName}] Nem találom az Árfolyamot az "A" sorozatnál.`);

  const month = HU_MONTHS[dateM[2].toLowerCase()];
  if (!month) throw new Error(`[${fundName}] Ismeretlen hónap: ${dateM[2]}`);
  const date = `${dateM[1]}-${String(month).padStart(2, "0")}-${String(+dateM[3]).padStart(2, "0")}`;
  const price = parseFloat(priceM[1].replace(",", "."));
  if (!(price > 0)) throw new Error(`[${fundName}] Hibás árfolyam: ${priceM[1]}`);
  return { date, price };
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SIFI-portfolio-tracker/1.0)",
      "Accept-Language": "hu-HU,hu;q=0.9"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);
  return res.text();
}

(async () => {
  const data = JSON.parse(fs.readFileSync(DATA, "utf8"));
  const results = [];
  for (const f of data.funds) {
    const html = await fetchPage(f.url);
    const r = parseFund(toText(html), f.name);
    results.push(r);
    console.log(`${f.name}: ${r.date} -> ${r.price}`);
  }

  // Egy közös dátum: a legfrissebb a négy közül.
  const entryDate = results.map(r => r.date).sort().slice(-1)[0];
  const prices = results.map(r => r.price);

  const last = data.history[data.history.length - 1];
  if (last && last.date >= entryDate) {
    console.log(`Nincs új értéknap (legfrissebb már: ${last.date}). Nem írok semmit.`);
    process.exit(0);
  }

  data.history.push({ date: entryDate, prices });
  data.updated = entryDate;
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n");
  console.log(`Új pont hozzáadva: ${entryDate} -> [${prices.join(", ")}]`);
})().catch(err => {
  console.error("HIBA:", err.message);
  process.exit(1);
});
