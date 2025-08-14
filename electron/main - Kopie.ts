import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import path from 'path';
import fs from 'fs';

// WICHTIG: Kein import.meta.url, keine 'url'-Imports.
const RUNTIME_DIR = __dirname;

let win: BrowserWindow;

function isDev() {
  // VITE_DEV_SERVER wird in deinem dev-Script gesetzt
  return !!process.env.VITE_DEV_SERVER || process.env.NODE_ENV === 'development';
}

function getIndexToLoad(): { devUrl?: string; filePath?: string } {
  if (isDev()) {
    return { devUrl: 'http://localhost:5173' };
  }
  // Prod: zuerst dist/index.html, sonst Fallback auf root/index.html
  const distIndex = path.join(RUNTIME_DIR, '../dist/index.html');
  const rootIndex = path.join(RUNTIME_DIR, '../index.html');

  if (fs.existsSync(distIndex)) {
    return { filePath: distIndex };
  }
  if (fs.existsSync(rootIndex)) {
    return { filePath: rootIndex };
  }

  // Wenn beides fehlt, lieber auf root/index.html verweisen (wird dann Fehlermeldung zeigen)
  return { filePath: rootIndex };
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
   webPreferences: {
  preload: path.join(__dirname, 'preload.cjs'),
  contextIsolation: true,
  sandbox: true
    },
  });
 if (process.env.VITE_DEV_SERVER) {
    await win.loadURL('http://localhost:5173');
  } else {
    // Pfad zu index.html im Hauptordner
    await win.loadFile(path.join(__dirname, '../index.html'));
  }
  const target = getIndexToLoad();

  if (target.devUrl) {
    await win.loadURL(target.devUrl);
  } else if (target.filePath) {
    await win.loadFile(target.filePath);
  }

  // Optional: DevTools im Dev-Modus
  if (isDev()) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==== deine IPC-Handler (unverändert) ====
import { getPortfolio, listAssets, placeOrders } from '../src/modules/bitpanda.js';
import { computeRebalance } from '../src/modules/rebalance.js';
import { secureStore } from '../src/modules/secureStore.js';
import { scheduleJob, cancelJob } from '../src/modules/scheduler.js';
import log from '../src/modules/logger.js';

ipcMain.handle('secureStore:setApiKey', async (_e, apiKey: string) => secureStore.saveApiKey(apiKey));
ipcMain.handle('secureStore:getApiKey', async () => secureStore.getApiKey());

ipcMain.handle('bitpanda:listAssets', async () => listAssets());
ipcMain.handle('bitpanda:getPortfolio', async () => getPortfolio());

ipcMain.handle('rebalance:preview', async (_e, payload) => {
  const { holdings, prices } = await getPortfolio();
  return computeRebalance({ holdings, prices, ...payload });
});

ipcMain.handle('rebalance:execute', async (_e, orders) => {
  const res = await placeOrders(orders);
  new Notification({ title: 'Rebalancing', body: 'Orders ausgeführt' }).show();
  return res;
});

ipcMain.handle('scheduler:set', async (_e, { cronExpr, enabled }) => {
  if (!enabled) return cancelJob();
  return scheduleJob(cronExpr, async () => {
    try {
      const apiKey = await secureStore.getApiKey();
      if (!apiKey) { log.warn('Kein API-Key gesetzt'); return; }
      // Hier könntest du die automatische Preview/Orders ausführen
    } catch (e) { log.error(String(e)); }
  });
});

