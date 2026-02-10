'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import { createGradientsSketch } from '@/lib/effects/gradients'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function GradientsPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [threshold, setThreshold] = useState(128)
  const [stepSize, setStepSize] = useState(8)
  const [shapeType, setShapeType] = useState('rect')

  const paramDefs = useMemo(() => ({
    threshold: { value: threshold, set: setThreshold, min: 0, max: 255, step: 1 },
    stepSize: { value: stepSize, set: setStepSize, min: 2, max: 30, step: 1 }
  }), [threshold, stepSize])

  const anim = useAnimation(paramDefs)

  const allDeps = [image, showEffect, canvasSize, preprocessing, threshold, stepSize, shapeType]
  const params = { canvasSize, preprocessing, threshold, stepSize, shapeType }

  const sketch = useCallback(
    (p) => createGradientsSketch(showEffect ? image : null, params)(p),
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
        <SliderInput label="Threshold" value={threshold} onChange={setThreshold} min={0} max={255} step={1} />
        <SliderInput label="Step Size" value={stepSize} onChange={setStepSize} min={2} max={30} step={1} />
        <SelectInput label="Shape Type" value={shapeType} onChange={setShapeType} options={['rect', 'ellipse']} />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('gradients', 'png') }, [p5Ref])} />
      </ControlPanel>
    </>
  )
}
