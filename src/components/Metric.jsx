/** A labeled metric card. Renders `children` as the value, or a number input
 *  when `value`/`onChange` are supplied. */
export default function Metric({ label, value, onChange, inputProps, style, children }) {
  return (
    <div className="metric" style={style}>
      <div className="metric-label">{label}</div>
      {onChange ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...inputProps}
        />
      ) : (
        <div className="metric-value">{children}</div>
      )}
    </div>
  )
}
