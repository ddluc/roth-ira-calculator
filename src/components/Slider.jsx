import { Slider as CarbonSlider } from '@carbon/react'

/** A 1–5 Carbon slider whose end labels read qualitatively ("Low" … "High")
 *  instead of the raw numbers. Carbon's `formatLabel` formats the min/max end
 *  labels, so we map the extremes to words and leave the middle blank. */
export default function Slider({
  labelText,
  value,
  onChange,
  style,
  lowLabel = 'Low',
  highLabel = 'High',
}) {
  return (
    <div className="slider-fill" style={style}>
      <CarbonSlider
        labelText={labelText}
        min={1}
        max={5}
        step={1}
        value={value}
        hideTextInput
        formatLabel={(val) => (val <= 1 ? lowLabel : val >= 5 ? highLabel : String(val))}
        onChange={({ value }) => onChange(value)}
      />
    </div>
  )
}
