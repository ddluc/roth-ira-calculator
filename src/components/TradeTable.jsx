import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react'
import { fmt$ } from '../calc.js'

/** Breakdown of how a single per-account contribution is split across funds. */
export default function TradeTable({ perAccount, rows }) {
  const title = 'Contribution Breakdown';

  return (
    <div style={{ marginBottom: '1rem' }}>
      <p className="metric__label" style={{ marginBottom: '0.75rem' }}>{title}</p>
      <Table size="lg" useZebraStyles>
        <TableHead>
          <TableRow>
            <TableHeader>Fund</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Alloc</TableHeader>
            <TableHeader>Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.ticker}>
              <TableCell>{r.ticker}</TableCell>
              <TableCell>{r.desc}</TableCell>
              <TableCell>{r.pct}%</TableCell>
              <TableCell>{fmt$(r.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell><strong>Total per contribution</strong></TableCell>
            <TableCell />
            <TableCell><strong>100%</strong></TableCell>
            <TableCell><strong>{fmt$(perAccount)}</strong></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
