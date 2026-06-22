import { Slider as CarbonSlider } from '@carbon/react'

/** A 1–5 Carbon slider. `labelText` carries the current selection's name so the
 *  user sees e.g. "Risk level — Aggressive" above the track. */
export default function Slider({ labelText, value, onChange, style }) {
  return (
    <div style={style}>
      <CarbonSlider
        labelText={labelText}
        min={1}
        max={5}
        step={1}
        value={value}
        hideTextInput
        onChange={({ value }) => onChange(value)}
      />
    </div>
  )
}
