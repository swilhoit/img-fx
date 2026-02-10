'use client'

import ControlGroup from '@/components/ControlGroup/ControlGroup'
import SliderInput from '@/components/SliderInput/SliderInput'

export default function PreprocessingControls ({ params, onChange }) {
  const set = (key) => (value) => onChange({ ...params, [key]: value })

  return (
    <ControlGroup title="Image Preprocessing">
      <SliderInput label="Blur" value={params.blur} onChange={set('blur')} min={0} max={10} step={1} />
      <SliderInput label="Grain" value={params.grain} onChange={set('grain')} min={0} max={1} step={0.01} />
      <SliderInput label="Gamma" value={params.gamma} onChange={set('gamma')} min={0.1} max={2} step={0.1} />
      <SliderInput label="Black Point" value={params.blackPoint} onChange={set('blackPoint')} min={0} max={255} step={1} />
      <SliderInput label="White Point" value={params.whitePoint} onChange={set('whitePoint')} min={0} max={255} step={1} />
    </ControlGroup>
  )
}
