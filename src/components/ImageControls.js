'use client'

import { useGlobalState } from '@/context/GlobalStateProvider'
import SliderInput from '@/components/SliderInput/SliderInput'
import ControlGroup from '@/components/ControlGroup/ControlGroup'

export default function ImageControls () {
  const { imageScale, setImageScale, imageOffsetX, setImageOffsetX, imageOffsetY, setImageOffsetY } = useGlobalState()

  return (
    <ControlGroup title="Image Transform" defaultOpen={false}>
      <SliderInput label="Scale" value={imageScale} onChange={setImageScale} min={50} max={300} step={1} />
      <SliderInput label="Offset X" value={imageOffsetX} onChange={setImageOffsetX} min={-50} max={50} step={1} />
      <SliderInput label="Offset Y" value={imageOffsetY} onChange={setImageOffsetY} min={-50} max={50} step={1} />
    </ControlGroup>
  )
}
