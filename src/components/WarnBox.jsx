import { InlineNotification } from '@carbon/react'
import { funds, PROJECTION_YEARS } from '../data.js'
import { fmt$ } from '../calc.js'

/** Plain-language description of how the projection is modeled. Reflects the
 *  current inputs and the deterministic assumptions baked into calc.js. */
export default function WarnBox({ annualContrib, contributors, perAccount, scenario, annRates }) {
  const rateList = funds
    .map((f, i) => `${f.ticker} ${annRates[i] >= 0 ? '+' : ''}${(annRates[i] * 100).toFixed(1)}%`)
    .join(', ')

  const lead =
    `Assumes $${annualContrib.toLocaleString()}/year in contributions ` +
    `(${contributors} account${contributors === 1 ? '' : 's'} × ${fmt$(perAccount).replace('.00', '')}) ` +
    `invested under the “${scenario.label}” scenario and compounded for ${PROJECTION_YEARS} years.`

  const assumptions = [
    `Returns are fixed and deterministic based on performance level. Each fund earns a constant annual rate (${rateList}) every year.`,
    `Your target allocation is applied to both the starting balance and every contribution, but the portfolio is never rebalanced — each fund compounds on its own, so the realized mix drifts over time.`,
    `Contributions are added at the end of each year and held flat for all ${PROJECTION_YEARS} years (no step-ups for future IRS limit increases).`,
    `Growth is shown gross of fees. The listed expense ratios are estimated separately and are not subtracted from the projected balance.`,
    `All dollar figures are nominal — not adjusted for inflation.`,
    `Taxes are not modeled. In a Roth IRA, contributions are after-tax and qualified growth and withdrawals are tax-free; IRS income and contribution limits are not enforced here.`,
    `Bonds are modeled to move inversely to stocks as a flight-to-safety hedge.`,
  ]

  const subtitle = (
    <div className="assumptions">
      <ul>
        <li>{lead}</li>
        {assumptions.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
      <p className="assumptions__foot">
        These are illustrative assumptions, not a forecast or financial advice.
      </p>
    </div>
  )

  return (
    <InlineNotification
      kind="info"
      lowContrast
      hideCloseButton
      title="How this projection is modeled"
      subtitle={subtitle}
      style={{ maxWidth: '100%' }}
    />
  )
}
