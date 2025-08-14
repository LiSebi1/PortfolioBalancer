
export type Holding = { symbol: string; amount: number; valueEur: number }
export type Targets = Record<string, number>
export type Prices = Record<string, number>
export type Thresholds = Record<string, number>

export function computeRebalance({ holdings, prices, targets, excludes, thresholds }:
{ holdings: Holding[]; prices: Prices; targets: Targets; excludes: Set<string>; thresholds: Thresholds; }) {
  const totalValue = holdings.reduce((s,h)=> s + h.valueEur, 0)
  const currentPct: Record<string, number> = {}
  holdings.forEach(h => { currentPct[h.symbol] = h.valueEur / totalValue })

  const orders: Array<{symbol:string, side:'buy'|'sell', amount:number, valueEur:number}> = []

  for (const [symbol, target] of Object.entries(targets)) {
    if (excludes.has(symbol)) continue
    const cur = currentPct[symbol] || 0
    const diff = target - cur
    const thr = thresholds[symbol] ?? 0
    if (Math.abs(diff) < thr) continue

    const targetValue = target * totalValue
    const curValue = (currentPct[symbol] ?? 0) * totalValue
    const valueToMove = targetValue - curValue
    const price = prices[symbol]
    if (!price || Math.abs(valueToMove) < 1e-2) continue

    const units = valueToMove / price
    orders.push({ symbol, side: units > 0 ? 'buy' : 'sell', amount: Math.abs(units), valueEur: Math.abs(valueToMove) })
  }
  return { totalValue, currentPct, orders }
}
