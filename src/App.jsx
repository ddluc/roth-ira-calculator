import { useState, useMemo, useEffect } from 'react'
import { Theme, NumberInput } from '@carbon/react'
import { computeProjection, fmtK } from './calc.js'
import Metric from './components/Metric.jsx'
import Slider from './components/Slider.jsx'
import FundRow from './components/FundRow.jsx'
import GrowthChart from './components/GrowthChart.jsx'
import TradeTable from './components/TradeTable.jsx'
import WarnBox from './components/WarnBox.jsx'
import { usePrefersDarkScheme } from './hooks.js'


// Carbon NumberInput hands back the new value on its second arg.
const numHandler = (setter) => (_evt, { value }) =>
  setter(value === '' ? '' : Number(value))

export default function App() {
  const dark = usePrefersDarkScheme()
  const [balance, setBalance] = useState(7000)
  const [contributors, setContributors] = useState(1)
  const [perAccountInput, setPerAccountInput] = useState(7000)
  const [risk, setRisk] = useState(3)
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
    <Theme theme={dark ? 'g100' : 'white'} className="app">
      <div className="app__inner">
        <h2 className="app__title">Roth IRA Calculator</h2>

        <div className="input-grid">
          <NumberInput id="balance" label="Total to invest" value={balance}
            min={100} step={500} hideSteppers onChange={numHandler(setBalance)} />
          <NumberInput id="contributors" label="Contributors (accounts)" value={contributors}
            min={1} max={10} step={1} onChange={numHandler(setContributors)} />
          <NumberInput id="limit" label="Annual limit / account" value={perAccountInput}
            min={0} step={500} hideSteppers onChange={numHandler(setPerAccountInput)} />
        </div>

        <div className="grid-2">
          <Metric label="Risk level">{r.profile.label}</Metric>
          <Metric label="Total annual contribution">
            ${r.annualContrib.toLocaleString()}/yr
          </Metric>
        </div>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }} >
          <Metric label="Blended return:">
             {(r.blended * 100).toFixed(1)}%/yr
          </Metric>
          <Metric label="Performance">
             {r.scenario.label}
          </Metric>
        </div>
    

        <div className="slider-grid">
          <Slider labelText="Risk level" value={risk} onChange={setRisk} />
          <Slider labelText="Market performance" value={perf} onChange={setPerf} />
        </div>

        <div>
          {r.fundRows.map((fund) => (
            <FundRow key={fund.ticker} fund={fund} />
          ))}
        </div>

        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
          <Metric label="Est. annual fees at yr 25">
            ${Math.round(r.finalFee).toLocaleString()}/yr 
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

        <div className="section-gap" />
        <TradeTable perAccount={r.perAccount} rows={r.tradeRows} />

        <WarnBox
          annualContrib={r.annualContrib}
          contributors={r.contributors}
          perAccount={r.perAccount}
          scenario={r.scenario}
        />

      </div>
    </Theme>
  )
}
