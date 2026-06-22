import { Tag } from '@carbon/react'
import { fmt$ } from '../calc.js'

/** One fund's allocation bar with ticker, scenario rate, percent and amount. */
export default function FundRow({ fund }) {
  const { ticker, desc, color, pct, amount, rate } = fund
  const rateText = (rate >= 0 ? '+' : '') + (rate * 100).toFixed(2) + '%/yr'

  return (
    <div className="fund-row">
      <div className="fund-header">
        <div className="fund-left">
          <span className="fund-ticker">{ticker}</span>
          <span className="fund-desc">{desc}</span>
          <div >
              <span className="fund-rate" data-type={rate < 0 ? 'negative' : 'positive'} size="sm">{rateText}</span>
          </div>
          
        </div>
        <div className="fund-right">
          <span className="fund-pct">{pct}%</span>
          <span className="fund-amount">{fmt$(amount)}</span>
        </div>
      </div>
      <div className="fund-bar-track">
        <div className="fund-bar" style={{ background: color, width: pct + '%' }} />
      </div>
    </div>
  )
}
