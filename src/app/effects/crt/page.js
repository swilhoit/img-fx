'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import { createCRTSketch } from '@/lib/effects/crt'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function CRTPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [type, setType] = useState('Monitor')
  const [distortion, setDistortion] = useState(0.1)
  const [dotScale, setDotScale] = useState(1)
  const [dotPitch, setDotPitch] = useState(3)
  const [falloff, setFalloff] = useState(0.3)
  const [glowRadius, setGlowRadius] = useState(2)
  const [glowIntensity, setGlowIntensity] = useState(0.5)
  const [bloomMode, setBloomMode] = useState('Screen')
  const [bloomThreshold, setBloomThreshold] = useState(200)
  const [bloomIntensity, setBloomIntensity] = useState(0.3)
  const [bloomRadius, setBloomRadius] = useState(4)
  const [redOffsetX, setRedOffsetX] = useState(1)
  const [redOffsetY, setRedOffsetY] = useState(0)
  const [blueOffsetX, setBlueOffsetX] = useState(-1)
  const [blueOffsetY, setBlueOffsetY] = useState(0)

  const paramDefs = useMemo(() => ({
    distortion: { value: distortion, set: setDistortion, min: 0, max: 1, step: 0.01 },
    dotScale: { value: dotScale, set: setDotScale, min: 0.5, max: 5, step: 0.1 },
    dotPitch: { value: dotPitch, set: setDotPitch, min: 1, max: 10, step: 1 },
    falloff: { value: falloff, set: setFalloff, min: 0, max: 1, step: 0.01 },
    glowRadius: { value: glowRadius, set: setGlowRadius, min: 0, max: 10, step: 1 },
    glowIntensity: { value: glowIntensity, set: setGlowIntensity, min: 0, max: 2, step: 0.01 },
    bloomThreshold: { value: bloomThreshold, set: setBloomThreshold, min: 0, max: 255, step: 1 },
    bloomIntensity: { value: bloomIntensity, set: setBloomIntensity, min: 0, max: 2, step: 0.01 },
    bloomRadius: { value: bloomRadius, set: setBloomRadius, min: 0, max: 20, step: 1 },
    redOffsetX: { value: redOffsetX, set: setRedOffsetX, min: -10, max: 10, step: 1 },
    redOffsetY: { value: redOffsetY, set: setRedOffsetY, min: -10, max: 10, step: 1 },
    blueOffsetX: { value: blueOffsetX, set: setBlueOffsetX, min: -10, max: 10, step: 1 },
    blueOffsetY: { value: blueOffsetY, set: setBlueOffsetY, min: -10, max: 10, step: 1 }
  }), [distortion, dotScale, dotPitch, falloff, glowRadius, glowIntensity, bloomThreshold, bloomIntensity, bloomRadius, redOffsetX, redOffsetY, blueOffsetX, blueOffsetY])

  const anim = useAnimation(paramDefs)

  const allDeps = [image, showEffect, canvasSize, preprocessing, type, distortion, dotScale, dotPitch, falloff, glowRadius, glowIntensity, bloomMode, bloomThreshold, bloomIntensity, bloomRadius, redOffsetX, redOffsetY, blueOffsetX, blueOffsetY]
  const params = { canvasSize, preprocessing, type, distortion, dotScale, dotPitch, falloff, glowRadius, glowIntensity, bloomMode, bloomThreshold, bloomIntensity, bloomRadius, redOffsetX, redOffsetY, blueOffsetX, blueOffsetY }

  const sketch = useCallback(
    (p) => createCRTSketch(showEffect ? image : null, params)(p),
    allDeps
  )
  const { containerRef, p5Ref } = useP5(sketch, allDeps)

  return (
    <>
      <div className="canvas-area" ref={containerRef} />
      <ControlPanel>
        <FileUploader onFile={loadImage} accept=".jpg,.png" />
        <SliderInput label="Canvas Size" value={canvasSize} onChange={setCanvasSize} min={100} max={1000} step={1} />
        <PreprocessingControls params={preprocessing} onChange={setPreprocessing} />
        <Toggle label="Show Effect" checked={showEffect} onChange={setShowEffect} />
        <SelectInput label="Type" value={type} onChange={setType} options={['Monitor', 'TV', 'LCD']} />
        <SliderInput label="distortion" value={distortion} onChange={setDistortion} min={0} max={1} step={0.01} />
        <SliderInput label="dotScale" value={dotScale} onChange={setDotScale} min={0.5} max={5} step={0.1} />
        <SliderInput label="dotPitch" value={dotPitch} onChange={setDotPitch} min={1} max={10} step={1} />
        <SliderInput label="falloff" value={falloff} onChange={setFalloff} min={0} max={1} step={0.01} />
        <SliderInput label="glowRadius" value={glowRadius} onChange={setGlowRadius} min={0} max={10} step={1} />
        <SliderInput label="glowIntensity" value={glowIntensity} onChange={setGlowIntensity} min={0} max={2} step={0.01} />
        <SelectInput label="Bloom" value={bloomMode} onChange={setBloomMode} options={['Screen', 'Light', 'HDR']} />
        <SliderInput label="bloomThreshold" value={bloomThreshold} onChange={setBloomThreshold} min={0} max={255} step={1} />
        <SliderInput label="bloomIntensity" value={bloomIntensity} onChange={setBloomIntensity} min={0} max={2} step={0.01} />
        <SliderInput label="bloomRadius" value={bloomRadius} onChange={setBloomRadius} min={0} max={20} step={1} />
        <SliderInput label="redConvergenceOffsetX" value={redOffsetX} onChange={setRedOffsetX} min={-10} max={10} step={1} />
        <SliderInput label="redConvergenceOffsetY" value={redOffsetY} onChange={setRedOffsetY} min={-10} max={10} step={1} />
        <SliderInput label="blueConvergenceOffsetX" value={blueOffsetX} onChange={setBlueOffsetX} min={-10} max={10} step={1} />
        <SliderInput label="blueConvergenceOffsetY" value={blueOffsetY} onChange={setBlueOffsetY} min={-10} max={10} step={1} />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('crt', 'png') }, [p5Ref])} />
      </ControlPanel>
    </>
  )
}
