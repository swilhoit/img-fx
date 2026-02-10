'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import { createScatterSketch } from '@/lib/effects/scatter'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function ScatterPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [pointDensity, setPointDensity] = useState(0.004)
  const [minDotSize, setMinDotSize] = useState(4)
  const [maxDotSize, setMaxDotSize] = useState(14)
  const [relaxIterations, setRelaxIterations] = useState(1)
  const [relaxStrength, setRelaxStrength] = useState(0.16)

  const paramDefs = useMemo(() => ({
    pointDensity: { value: pointDensity, set: setPointDensity, min: 0, max: 0.2, step: 0.001 },
    minDotSize: { value: minDotSize, set: setMinDotSize, min: 1, max: 50, step: 1 },
    maxDotSize: { value: maxDotSize, set: setMaxDotSize, min: 1, max: 50, step: 1 },
    relaxIterations: { value: relaxIterations, set: setRelaxIterations, min: 0, max: 20, step: 1 },
    relaxStrength: { value: relaxStrength, set: setRelaxStrength, min: 0, max: 1, step: 0.01 }
  }), [pointDensity, minDotSize, maxDotSize, relaxIterations, relaxStrength])

  const anim = useAnimation(paramDefs)

  const allDeps = [image, showEffect, bgColor, fgColor, canvasSize, preprocessing, pointDensity, minDotSize, maxDotSize, relaxIterations, relaxStrength]
  const params = { canvasSize, bgColor, fgColor, preprocessing, pointDensity, minDotSize, maxDotSize, relaxIterations, relaxStrength }

  const sketch = useCallback(
    (p) => createScatterSketch(showEffect ? image : null, params)(p),
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
        <SliderInput label="Point Density" value={pointDensity} onChange={setPointDensity} min={0} max={0.2} step={0.001} />
        <SliderInput label="Min Dot Size" value={minDotSize} onChange={setMinDotSize} min={1} max={50} step={1} />
        <SliderInput label="Max Dot Size" value={maxDotSize} onChange={setMaxDotSize} min={1} max={50} step={1} />
        <SliderInput label="Relax Iterations" value={relaxIterations} onChange={setRelaxIterations} min={0} max={20} step={1} />
        <SliderInput label="Relax Strength" value={relaxStrength} onChange={setRelaxStrength} min={0} max={1} step={0.01} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('scatter', 'png') }, [p5Ref])} />
      </ControlPanel>
    </>
  )
}
