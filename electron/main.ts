// electron/main.ts
import { app, BrowserWindow, Menu } from 'electron';
import { join } from 'path';
import { pathToFileURL } from 'url';

let win: BrowserWindow | null = null;

// Robust: Dev, wenn Vite-Server-Flag gesetzt ODER App nicht gepackt
const isDev = !!process.env.VITE_DEV_SERVER || !app.isPackaged;

async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1280,  // Mindestbreite festlegen
    minHeight: 860,  // Mindesthöhe festlegen
    webPreferences: {
      // Achtung: dieser Pfad zeigt auf die GEBaute Datei neben main.cjs
      preload: join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
    },
  });

   // Menüleiste komplett entfernen
  Menu.setApplicationMenu(null)
  win.setMenuBarVisibility(false)


  if (isDev) {
    // Vite Dev-Server
    await win.loadURL(process.env.VITE_DEV_SERVER ?? 'http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Produktions-Build: index.html aus dist via file:// laden
    const indexHtmlPath = join(app.getAppPath(), 'dist', 'index.html');
    await win.loadURL(pathToFileURL(indexHtmlPath).toString());
  }

  win.on('closed', () => (win = null));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // macOS typisch offen lassen, sonst auf anderen Plattformen beenden
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // macOS: neues Fenster, wenn Dock-Icon geklickt wurde und keins offen ist
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
