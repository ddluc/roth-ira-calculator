import { useState, useMemo } from 'react'
import { computeProjection, fmt$, fmtK } from './calc.js'
import Metric from './components/Metric.jsx'
import Slider from './components/Slider.jsx'
import FundRow from './components/FundRow.jsx'
import GrowthChart from './components/GrowthChart.jsx'
import TradeTable from './components/TradeTable.jsx'
import WarnBox from './components/WarnBox.jsx'

export default function App() {
  const [balance, setBalance] = useState(28000)
  const [contributors, setContributors] = useState(2)
  const [perAccountInput, setPerAccountInput] = useState(7000)
  const [risk, setRisk] = useState(5)
  const [perf, setPerf] = useState(3)

  const r = useMemo(
    () =>
      computeProjection({
        balance: parseFloat(balance) || 0,
        contributors: parseInt(contributors, 10) || 1,
        perAccount: parseFloat(perAccountInput) || 0,
        risk,
        perf,
      }),
    [balance, contributors, perAccountInput, risk, perf],
  )

  const gainsColor = r.totalGains < 0 ? '#D85A30' : '#1D9E75'
  const gainsText =
    (r.totalGains < 0 ? '-$' : '+$') + Math.abs(r.totalGains).toLocaleString()

  return (
    <>
      <h2>Portfolio allocation calculator</h2>

      <div className="grid-2">
        <Metric label="Total to invest" value={balance} onChange={setBalance}
          inputProps={{ min: 100, step: 500 }} />
        <Metric label="Risk level">{r.profile.label}</Metric>
      </div>

      <div className="grid-2">
        <Metric label="Contributors (accounts)" value={contributors} onChange={setContributors}
          inputProps={{ min: 1, max: 10, step: 1 }} />
        <Metric label="Annual limit / account" value={perAccountInput} onChange={setPerAccountInput}
          inputProps={{ min: 0, step: 500 }} />
      </div>

      <Metric label="Total annual contribution" style={{ marginBottom: '1.5rem' }}>
        ${r.annualContrib.toLocaleString()}/yr
      </Metric>

      <Slider leftLabel="Conservative" rightLabel="Aggressive" value={risk} onChange={setRisk} />

      <Slider leftLabel="Bear" rightLabel="Bull" value={perf} onChange={setPerf}
        style={{ marginBottom: '0.5rem' }} />
      <div className="perf-row">
        <span className="slider-label">{r.scenario.label}</span>
        <span className="blended-return">
          Blended return: {(r.blended * 100).toFixed(1)}%/yr
        </span>
      </div>

      <div>
        {r.fundRows.map((fund) => (
          <FundRow key={fund.ticker} fund={fund} />
        ))}
      </div>

      <hr className="divider" />

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <Metric label="Est. annual fees">
          ${Math.round(r.finalFee).toLocaleString()}/yr (at yr 25)
        </Metric>
        <Metric label={`Proj. value at yr 25 (+${fmtK(r.annualContrib)}/yr)`}>
          ${r.finalValue.toLocaleString()}
        </Metric>
      </div>

      <GrowthChart
        years={r.years}
        portfolioData={r.portfolioData}
        contribData={r.contribData}
        gainsData={r.gainsData}
      />

      <div className="grid-3">
        <Metric label="Total contributed">${r.totalContrib.toLocaleString()}</Metric>
        <Metric label="Total gains">
          <span style={{ color: gainsColor }}>{gainsText}</span>
        </Metric>
        <Metric label="Return on investment">
          {(r.roi >= 0 ? '+' : '') + r.roi}%
        </Metric>
      </div>

      <WarnBox
        annualContrib={r.annualContrib}
        contributors={r.contributors}
        perAccount={r.perAccount}
        scenario={r.scenario}
        annRates={r.annRates}
      />

      <hr className="divider" style={{ marginTop: '1.5rem' }} />

      <TradeTable perAccount={r.perAccount} rows={r.tradeRows} />
    </>
  )
}
