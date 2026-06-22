import { fmt$ } from '../calc.js'

/** One fund's allocation bar with ticker, scenario rate, percent and amount. */
export default function FundRow({ fund }) {
  const { ticker, desc, color, pct, amount, rate } = fund
  const rateColor = rate < 0 ? '#D85A30' : '#1D9E75'
  const rateText = (rate >= 0 ? '+' : '') + (rate * 100).toFixed(2) + '%/yr'

  return (
    <div className="fund-row">
      <div className="fund-header">
        <div className="fund-left">
          <span className="fund-ticker">{ticker}</span>
          <span className="fund-desc">{desc}</span>
          <span className="fund-rate" style={{ color: rateColor }}>{rateText}</span>
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
