import { fmt$ } from '../calc.js'

/** Breakdown of how a single per-account contribution is split across funds. */
export default function TradeTable({ perAccount, rows }) {
  const title = `Per ${fmt$(perAccount).replace('.00', '')} contribution — trade breakdown`

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="trade-title">{title}</div>
      <table className="trade-table">
        <thead>
          <tr>
            <td style={{ padding: '4px 0', width: '25%' }}>Fund</td>
            <td style={{ padding: '4px 8px', width: '35%' }}>Description</td>
            <td style={{ padding: '4px 8px', textAlign: 'right', width: '15%' }}>Alloc</td>
            <td style={{ padding: '4px 0', textAlign: 'right', width: '25%' }}>Amount</td>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.ticker}>
              <td style={{ padding: '6px 0', fontWeight: 500 }}>{r.ticker}</td>
              <td style={{ padding: '6px 8px', color: '#888' }}>{r.desc}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.pct}%</td>
              <td style={{ padding: '6px 0', textAlign: 'right' }}>{fmt$(r.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} style={{ padding: '8px 0 4px' }}>Total per contribution</td>
            <td style={{ padding: '8px 8px 4px', textAlign: 'right' }}>100%</td>
            <td style={{ padding: '8px 0 4px', textAlign: 'right' }}>{fmt$(perAccount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
