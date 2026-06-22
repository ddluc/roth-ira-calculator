import { funds, profiles, perfScenarios, PROJECTION_YEARS } from './data.js'

export const fmt$ = (n) =>
  '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtK = (n) =>
  '$' + (n >= 1000 ? Math.round(n / 1000) + 'k' : Math.round(n))

/**
 * Pure projection engine. Takes the raw inputs and returns every derived value
 * the UI needs — no DOM, no side effects.
 *
 * @param {{ balance:number, contributors:number, perAccount:number, risk:number, perf:number }} inputs
 */
export function computeProjection({ balance, contributors, perAccount, risk, perf }) {
  const profile = profiles[risk - 1]
  const scenario = perfScenarios[perf - 1]
  const { allocs } = profile

  contributors = Math.max(1, contributors || 1)
  perAccount = Math.max(0, perAccount || 0)
  const annualContrib = contributors * perAccount

  // Each fund's rate for the selected scenario comes straight from its map.
  const annRates = funds.map((f) => f.rates[perf - 1])

  // Allocation-weighted blended return, for display.
  const blended = allocs.reduce((s, a, i) => s + (a / 100) * annRates[i], 0)

  // Per-fund dollar split of the current balance.
  const fundAmts = funds.map((f, i) => (balance * allocs[i]) / 100)
  const contribAllocs = allocs.map((a) => (annualContrib * a) / 100)

  // Year-by-year growth: lump-sum balance compounds, plus each year's
  // contribution compounds for its remaining years.
  const years = Array.from({ length: PROJECTION_YEARS + 1 }, (_, i) => i)
  const portfolioData = years.map((yr) => {
    if (yr === 0) return Math.round(balance)
    let total = 0
    funds.forEach((f, i) => {
      const r = annRates[i]
      total += fundAmts[i] * Math.pow(1 + r, yr)
      for (let c = 1; c <= yr; c++) {
        total += contribAllocs[i] * Math.pow(1 + r, yr - c)
      }
    })
    return Math.round(total)
  })

  const contribData = years.map((yr) => Math.round(balance + annualContrib * yr))
  const gainsData = years.map((_, i) => portfolioData[i] - contribData[i])

  const finalValue = portfolioData[PROJECTION_YEARS]
  const totalContrib = contribData[PROJECTION_YEARS]
  const totalGains = gainsData[PROJECTION_YEARS]
  const roi = totalContrib > 0 ? Math.round((finalValue / totalContrib - 1) * 100) : 0

  // Fees: current (on today's balance) and projected (on year-25 value).
  const totalFee = funds.reduce((sum, f, i) => sum + fundAmts[i] * f.fee, 0)
  const finalFee = funds.reduce((sum, f, i) => sum + ((finalValue * allocs[i]) / 100) * f.fee, 0)

  // Per-fund display rows (allocation bars + current $ amount + scenario rate).
  const fundRows = funds.map((f, i) => ({
    ...f,
    pct: allocs[i],
    amount: fundAmts[i],
    rate: annRates[i],
  }))

  // Trade breakdown: how a single contribution is split across funds.
  const tradeRows = funds.map((f, i) => ({
    ticker: f.ticker,
    desc: f.desc,
    pct: allocs[i],
    amount: (perAccount * allocs[i]) / 100,
  }))

  return {
    profile,
    scenario,
    annualContrib,
    annRates,
    blended,
    years,
    portfolioData,
    contribData,
    gainsData,
    finalValue,
    totalContrib,
    totalGains,
    roi,
    totalFee,
    finalFee,
    fundRows,
    tradeRows,
    perAccount,
    contributors,
  }
}
