
# Bitpanda Balancer (Starter)

**Kostenloser** Starter für eine Electron-Desktop-App (Win/macOS) mit:
- Zielgewichte, Excludes, Schwellen je Asset
- Manuelles & automatisches Rebalancing (cron)
- Sichere API-Key Speicherung (keytar + AES-Fallback)
- React UI + Chart.js (Sparklines vorbereitbar)

## Setup
```bash
npm install
npm run dev
```

In der UI: API-Key setzen, Assets laden, Rebalance-Preview testen.

## Build
```bash
npm run build
```

> Endpunkte der **Bitpanda Platform API** in `src/modules/bitpanda.ts` bitte gemäß Doku anpassen.
