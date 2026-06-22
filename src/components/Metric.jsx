import { Tile } from '@carbon/react'

/** A read-only labeled metric, rendered inside a Carbon Tile. */
export default function Metric({ label, style, children }) {
  return (
    <Tile style={style}>
      <p className="metric__label">{label}</p>
      <p className="metric__value">{children}</p>
    </Tile>
  )
}
