/** A 1–5 range slider with a label on each end. */
export default function Slider({ leftLabel, rightLabel, value, onChange, style }) {
  return (
    <div className="slider-row" style={style}>
      <span className="slider-label">{leftLabel}</span>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <span className="slider-label">{rightLabel}</span>
    </div>
  )
}
