"use strict";

// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("api", {
  setApiKey: (apiKey) => import_electron.ipcRenderer.invoke("secureStore:setApiKey", apiKey),
  getApiKey: () => import_electron.ipcRenderer.invoke("secureStore:getApiKey"),
  listAssets: () => import_electron.ipcRenderer.invoke("bitpanda:listAssets"),
  getPortfolio: () => import_electron.ipcRenderer.invoke("bitpanda:getPortfolio"),
  previewRebalance: (payload) => import_electron.ipcRenderer.invoke("rebalance:preview", payload),
  executeRebalance: (orders) => import_electron.ipcRenderer.invoke("rebalance:execute", orders),
  setSchedule: (cronExpr, enabled) => import_electron.ipcRenderer.invoke("scheduler:set", { cronExpr, enabled })
});
