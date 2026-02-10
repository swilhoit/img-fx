'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import { createRecolorSketch } from '@/lib/effects/recolor'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import ControlGroup from '@/components/ControlGroup/ControlGroup'
import ColorStop from '@/components/ColorStop/ColorStop'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function RecolorPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [posterize, setPosterize] = useState(8)
  const [noiseIntensity, setNoiseIntensity] = useState(0)
  const [noiseScale, setNoiseScale] = useState(0.01)
  const [noiseGamma, setNoiseGamma] = useState(1)
  const [gradientRepetitions, setGradientRepetitions] = useState(1)
  const [gradientMap, setGradientMap] = useState('brightness')
  const [stops, setStops] = useState([
    { color: '#000000', position: 0 },
    { color: '#ff0000', position: 50 },
    { color: '#ffffff', position: 100 }
  ])

  const paramDefs = useMemo(() => ({
    posterize: { value: posterize, set: setPosterize, min: 2, max: 32, step: 1 },
    noiseIntensity: { value: noiseIntensity, set: setNoiseIntensity, min: 0, max: 1, step: 0.01 },
    noiseScale: { value: noiseScale, set: setNoiseScale, min: 0.001, max: 0.1, step: 0.001 },
    noiseGamma: { value: noiseGamma, set: setNoiseGamma, min: 0.1, max: 3, step: 0.1 },
    gradientRepetitions: { value: gradientRepetitions, set: setGradientRepetitions, min: 1, max: 10, step: 1 }
  }), [posterize, noiseIntensity, noiseScale, noiseGamma, gradientRepetitions])

  const anim = useAnimation(paramDefs)

  const allDeps = [image, showEffect, bgColor, fgColor, canvasSize, preprocessing, posterize, noiseIntensity, noiseScale, noiseGamma, gradientRepetitions, gradientMap, stops]
  const params = { canvasSize, bgColor, fgColor, preprocessing, posterize, noiseIntensity, noiseScale, noiseGamma, gradientRepetitions, gradientMap, stops }

  const sketch = useCallback(
    (p) => createRecolorSketch(showEffect ? image : null, params)(p),
    allDeps
  )
  const { containerRef, p5Ref } = useP5(sketch, allDeps)

  return (
    <>
      <div className="canvas-area" ref={containerRef} />
      <ControlPanel>
        <FileUploader onFile={loadImage} accept=".jpg,.png,.mp4" />
        <SliderInput label="Canvas Size" value={canvasSize} onChange={setCanvasSize} min={100} max={1000} step={1} />
        <PreprocessingControls params={preprocessing} onChange={setPreprocessing} />
        <Toggle label="Show Effect" checked={showEffect} onChange={setShowEffect} />
        <SliderInput label="Posterize" value={posterize} onChange={setPosterize} min={2} max={32} step={1} />
        <SliderInput label="Noise Intensity" value={noiseIntensity} onChange={setNoiseIntensity} min={0} max={1} step={0.01} />
        <SliderInput label="Noise Scale" value={noiseScale} onChange={setNoiseScale} min={0.001} max={0.1} step={0.001} />
        <SliderInput label="Noise Gamma" value={noiseGamma} onChange={setNoiseGamma} min={0.1} max={3} step={0.1} />
        <ControlGroup title="Gradient">
          <SliderInput label="Repetitions" value={gradientRepetitions} onChange={setGradientRepetitions} min={1} max={10} step={1} />
          <SelectInput label="Map" value={gradientMap} onChange={setGradientMap} options={['brightness', 'hue', 'saturation']} />
          <ColorStop
            stops={stops}
            onChange={setStops}
            onAdd={() => setStops(prev => [...prev, { color: '#888888', position: 50 }])}
            onRemove={(i) => setStops(prev => prev.filter((_, idx) => idx !== i))}
          />
        </ControlGroup>
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('recolor', 'png') }, [p5Ref])} />
      </ControlPanel>
    </>
  )
}
