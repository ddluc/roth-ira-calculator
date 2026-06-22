// Each fund's annualized return is set explicitly for each performance scenario,
// in order: [Bear, Below avg, Baseline, Above avg, Bull]. Stocks & REITs rise
// with the market; bonds move inversely as a flight-to-safety hedge.
export const funds = [
  { ticker: 'FSKAX', desc: 'US total market',   color: '#378ADD', fee: 0.00015, rates: [ 0.020, 0.050, 0.085, 0.110, 0.135 ] },
  { ticker: 'FTIHX', desc: 'International',      color: '#1D9E75', fee: 0.00060, rates: [-0.010, 0.015, 0.040, 0.070, 0.100 ] },
  { ticker: 'FXNAX', desc: 'US bonds',           color: '#EF9F27', fee: 0.00025, rates: [ 0.070, 0.050, 0.010, -0.010, -0.020 ] },
  { ticker: 'FSRNX', desc: 'Real estate (REIT)', color: '#D85A30', fee: 0.00070, rates: [-0.010, 0.010, 0.030, 0.060, 0.090 ] },
]

export const profiles = [
  { label: 'Conservative',            allocs: [35, 15, 45,  5] },
  { label: 'Moderately conservative', allocs: [45, 15, 35,  5] },
  { label: 'Moderate',                allocs: [50, 20, 25,  5] },
  { label: 'Moderately aggressive',   allocs: [55, 25, 15,  5] },
  { label: 'Aggressive',              allocs: [60, 25, 10,  5] },
]

// Performance scenarios — labels only; the actual rates live in each fund's
// `rates` array above, indexed by scenario position.
export const perfScenarios = [
  { label: 'Bear' },
  { label: 'Below average' },
  { label: 'Baseline' },
  { label: 'Above average' },
  { label: 'Bull' },
]

export const PROJECTION_YEARS = 25
