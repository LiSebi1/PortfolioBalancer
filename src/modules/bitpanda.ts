
import axios from 'axios'
import { secureStore } from './secureStore.js'

const BASE = 'https://api.bitpanda.com' // TODO: richtigen Pfad lt. Doku setzen

async function auth() {
  const apiKey = await secureStore.getApiKey()
  if (!apiKey) throw new Error('API key missing')
  return axios.create({ baseURL: BASE, headers: { Authorization: `Bearer ${apiKey}` } })
}

export async function listAssets() {
  const http = await auth()
  const { data } = await http.get('/v1/assets') // <— anpassen gemäß Doku
  return data
}

export async function getPortfolio() {
  const http = await auth()
  // TODO: echte Endpunkte eintragen (Balances/Prices)
  const balances = { data: [{ symbol:'BTC', amount:0.5, valueEur:15000 }] }
  const prices = { data: { BTC: 30000 } }
  return { holdings: balances.data, prices: prices.data }
}

export async function placeOrders(orders: Array<{symbol:string, side:'buy'|'sell', amount:number}>) {
  const http = await auth()
  const results: any[] = []
  for (const o of orders) {
    // TODO: richtigen Order-Endpoint verwenden
    // const { data } = await http.post('/v1/orders', o)
    const data = { ok:true, echo:o }
    results.push(data)
  }
  return results
}
