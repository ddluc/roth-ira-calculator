import { funds, PROJECTION_YEARS } from '../data.js'
import { fmt$ } from '../calc.js'

/** Projection caveat that reflects the current inputs and scenario rates. */
export default function WarnBox({ annualContrib, contributors, perAccount, scenario, annRates }) {
  const rateList = funds
    .map((f, i) => `${f.ticker} ${annRates[i] >= 0 ? '+' : ''}${(annRates[i] * 100).toFixed(1)}%`)
    .join(', ')

  const body =
    `Projection assumes $${annualContrib.toLocaleString()}/year in contributions ` +
    `(${contributors} account${contributors === 1 ? '' : 's'} × ${fmt$(perAccount).replace('.00', '')}) ` +
    `compounding for ${PROJECTION_YEARS} years. Each fund’s return is set explicitly per scenario; ` +
    `the "${scenario.label}" case uses ${rateList}. Bonds are modeled to move inversely to stocks ` +
    `as a flight-to-safety hedge. These are illustrative assumptions, not forecasts.`

  return (
    <div className="warn-box">
      <div className="warn-title">Past performance note</div>
      <div className="warn-body">{body}</div>
    </div>
  )
}
