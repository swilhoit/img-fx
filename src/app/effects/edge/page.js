'use client'

import { useState, useCallback } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import { createEdgeSketch } from '@/lib/effects/edge'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import PreprocessingControls from '@/components/PreprocessingControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function EdgePage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [threshold, setThreshold] = useState(128)
  const [minDotSize, setMinDotSize] = useState(2)
  const [maxDotSize, setMaxDotSize] = useState(10)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [stepSize, setStepSize] = useState(4)

  const allDeps = [image, showEffect, canvasSize, preprocessing, threshold, minDotSize, maxDotSize, cornerRadius, stepSize]
  const params = { canvasSize, preprocessing, threshold, minDotSize, maxDotSize, cornerRadius, stepSize }

  const sketch = useCallback(
    (p) => createEdgeSketch(showEffect ? image : null, params)(p),
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
        <SliderInput label="Min Dot Size" value={minDotSize} onChange={setMinDotSize} min={1} max={20} step={1} />
        <SliderInput label="Max Dot Size" value={maxDotSize} onChange={setMaxDotSize} min={1} max={30} step={1} />
        <SliderInput label="Corner Radius" value={cornerRadius} onChange={setCornerRadius} min={0} max={15} step={1} />
        <SliderInput label="Step Size" value={stepSize} onChange={setStepSize} min={2} max={20} step={1} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('edge', 'png') }, [p5Ref])} />
      </ControlPanel>
    </>
  )
}
