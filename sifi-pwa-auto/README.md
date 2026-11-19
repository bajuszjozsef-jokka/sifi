# SIFI Portfóliókövető — automatikus árfolyammal

Telepíthető PWA, ami a SIFI alapok árfolyamát **automatikusan** húzza le hétfőn, szerdán és pénteken (GitHub Actions), és egyetlen `data.json`-ban tárol mindent. Nincs kézi import, nincs böngészőfüggő adat — több eszközről ugyanazt látod.

## Fájlszerkezet (a repo GYÖKERÉBE)

```
index.html                     – az app
manifest.json                  – PWA manifest
sw.js                          – service worker (offline; a data.json mindig friss)
data.json                      – EGYETLEN adatforrás: alapok, befizetések, árfolyam-előzmény
scrape.js                      – a napi árfolyam-lehúzó (Node 20)
icons/…                        – ikonok
.github/workflows/update-prices.yml  – az ütemezett feladat (H/Sze/P)
```

## Telepítés (egyszeri)

1. **Töltsd fel az összes fájlt a `sifi` repo gyökerébe** (a régi `sifi-pwa` / `sifi-pwa 2` mappákat töröld, hogy ne legyen zavar). A `.github/workflows/update-prices.yml`-nek pontosan ezen az útvonalon kell lennie.
2. **Settings → Pages:** Source „Deploy from a branch”, Branch `main`, mappa `/ (root)`. Így a cím a tiszta `https://<felhasználónév>.github.io/sifi/` lesz.
3. **Settings → Actions → General → Workflow permissions:** állítsd „Read and write permissions”-re (hogy a feladat vissza tudja commitolni a data.json-t).
4. **Actions fül → „SIFI árfolyam-frissítés” → Run workflow:** indítsd el kézzel egyszer, és nézd meg, hogy lefut-e hibátlanul. Ha zöld, és a `data.json`-ba új pont került, kész.

Ezután a feladat magától fut H/Sze/P reggel. A telefonon az appot a kezdőképernyőhöz adva mindig a friss adatot látod (húzd le / „Frissítés” gomb).

## Új befizetés rögzítése

Szerkeszd a `data.json` `contributions` listáját a GitHubon, és adj hozzá egy sort:

```json
{ "id": "buy4", "date": "2027-01-05", "fund": 0, "amount": 250000, "nav": 1.28 }
```

- `fund`: 0 = Nemzetközi, 1 = Magyar Index, 2 = Kötvény, 3 = Optimum
- `nav`: az adott napi (értéknapi) vételi árfolyam
- `id`: bármi egyedi

A jegyszám és a betett tőke ebből számolódik.

## Ha elromlik a scraper

Ha a SIFI átrendezi az oldalát, a feladat elbukik, és a GitHub **emailt küld** a hibáról. Ilyenkor a `scrape.js` `parseFund` részét kell igazítani. A feladat sosem ír részleges/hibás adatot: vagy mind a 4 alap sikerül, vagy semmi.

## Megjegyzések

- Az árfolyam az „A” sorozatból jön (ez a tiéd). Ha U sorozatra váltanál, a `scrape.js`-ben az „A” keresést kell átírni.
- A `cron` UTC-ben jár: `0 7 * * 1,3,5` = télen 8:00, nyáron 9:00 budapesti idő.
- Csak nyilvános árfolyamok lekérése, saját használatra.
