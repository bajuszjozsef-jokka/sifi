# SIFI Portfóliókövető — PWA

Statikus, telepíthető portfóliókövető app. Nincs backend, nincs build-lépés: pár statikus fájl, amit a GitHub Pages kiszolgál HTTPS-en. Az adatok a böngésződben (localStorage) tárolódnak.

## Fájlok

```
index.html                 – maga az app
manifest.json              – PWA manifest (név, ikon, standalone mód)
sw.js                      – service worker (offline működés)
icons/icon-192.png         – ikon (telepítéshez)
icons/icon-512.png         – ikon (nagy)
icons/icon-maskable-512.png – ikon (Android maskable)
```

## Közzététel GitHub Pages-en

1. Hozz létre egy repót (pl. `sifi-portfolio`), és töltsd fel az összes fájlt a gyökérbe (az `icons/` mappával együtt).
2. A repo **Settings → Pages** menüben:
   - **Source:** „Deploy from a branch”
   - **Branch:** `main` (vagy `master`), mappa: `/ (root)` → **Save**.
3. Pár perc múlva él: `https://<felhasználóneved>.github.io/sifi-portfolio/`
4. Nyisd meg a linket → a böngésző felajánlja a telepítést (Chrome: címsor melletti telepítés ikon; iPhone Safari: Megosztás → „Főképernyőhöz adás”).

> **Privát vs. publikus repo:** a GitHub Pages ingyenes csomagon csak **publikus** repóval megy (privát repóhoz fizetős terv kell). Ez itt nem gond: a kód nem tartalmaz érzékeny adatot, a **pénzügyi adataid a böngésződben maradnak**, nem kerülnek a repóba.

## Használat

- **Befizetések** napló: minden utalásnál rögzíts egy sort (dátum, alap, összeg, aznapi/értéknapi árfolyam). Ebből számol az app vett jegyet és betett tőkét.
- **Alapok** tábla „Árfolyam” oszlopa: ide írd a SIFI aznapi árfolyamait, amikor ránézel. A jelenlegi érték, a súlyok és az eredmény azonnal frissül.
- **Mentés mára**: napi pillanatkép az értékalakulás-grafikonhoz.
- **Export / Import**: az Export letölt egy JSON biztonsági mentést; az Import visszatölti. **Használd rendszeresen** — így nem veszik el az adat, ha a böngésző törli a tárhelyet vagy másik eszközre váltasz.

## Frissítés

Ha később módosítod az appot, emeld meg a `sw.js` tetején a `CACHE` verziószámát (pl. `sifi-pf-v2`), hogy a telepített példányok frissüljenek.

## Korlátok

- Az árfolyamot kézzel viszed be (a SIFI-nek nincs nyilvános API-ja). Az automatikus napi lehúzás külön backendet igényelne.
- Az adatok eszközönként/böngészőnként külön tárolódnak; szinkron csak az Export/Import fájllal megy.
