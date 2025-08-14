
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  setApiKey: (apiKey: string) => ipcRenderer.invoke('secureStore:setApiKey', apiKey),
  getApiKey: () => ipcRenderer.invoke('secureStore:getApiKey'),
  listAssets: () => ipcRenderer.invoke('bitpanda:listAssets'),
  getPortfolio: () => ipcRenderer.invoke('bitpanda:getPortfolio'),
  previewRebalance: (payload: any) => ipcRenderer.invoke('rebalance:preview', payload),
  executeRebalance: (orders: any) => ipcRenderer.invoke('rebalance:execute', orders),
  setSchedule: (cronExpr: string, enabled: boolean) => ipcRenderer.invoke('scheduler:set', { cronExpr, enabled })
})
