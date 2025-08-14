"use strict";

// electron/main.ts
var import_electron = require("electron");
var import_path = require("path");
var import_url = require("url");
var win = null;
var isDev = !!process.env.VITE_DEV_SERVER || !import_electron.app.isPackaged;
async function createWindow() {
  win = new import_electron.BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1280,
    // Mindestbreite festlegen
    minHeight: 860,
    // Mindesthöhe festlegen
    webPreferences: {
      // Achtung: dieser Pfad zeigt auf die GEBaute Datei neben main.cjs
      preload: (0, import_path.join)(__dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: true
    }
  });
  import_electron.Menu.setApplicationMenu(null);
  win.setMenuBarVisibility(false);
  if (isDev) {
    await win.loadURL(process.env.VITE_DEV_SERVER ?? "http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtmlPath = (0, import_path.join)(import_electron.app.getAppPath(), "dist", "index.html");
    await win.loadURL((0, import_url.pathToFileURL)(indexHtmlPath).toString());
  }
  win.on("closed", () => win = null);
}
import_electron.app.whenReady().then(createWindow);
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") import_electron.app.quit();
});
import_electron.app.on("activate", () => {
  if (import_electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
