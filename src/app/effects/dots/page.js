'use client'

import { useState, useCallback } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import { createDotsSketch } from '@/lib/effects/dots'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import PreprocessingControls from '@/components/PreprocessingControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function DotsPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [threshold, setThreshold] = useState(128)
  const [gridType, setGridType] = useState('Regular')
  const [gridAngle, setGridAngle] = useState(0)
  const [minDotSize, setMinDotSize] = useState(2)
  const [maxDotSize, setMaxDotSize] = useState(12)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [stepSize, setStepSize] = useState(8)
  const [noise, setNoise] = useState(0)

  const allDeps = [image, showEffect, canvasSize, preprocessing, threshold, gridType, gridAngle, minDotSize, maxDotSize, cornerRadius, stepSize, noise]
  const params = { canvasSize, preprocessing, threshold, gridType, gridAngle, minDotSize, maxDotSize, cornerRadius, stepSize, noise }

  const sketch = useCallback(
    (p) => createDotsSketch(showEffect ? image : null, params)(p),
    allDeps
  )

  const { containerRef, p5Ref } = useP5(sketch, allDeps)

  const handleExport = useCallback(() => {
    if (p5Ref.current) p5Ref.current.saveCanvas('dots', 'png')
  }, [p5Ref])

  return (
    <>
      <div className="canvas-area" ref={containerRef} />
      <ControlPanel>
        <FileUploader onFile={loadImage} accept=".jpg,.png,.mp4" />
        <SliderInput label="Canvas Size" value={canvasSize} onChange={setCanvasSize} min={100} max={1000} step={1} />
        <PreprocessingControls params={preprocessing} onChange={setPreprocessing} />
        <Toggle label="Show Effect" checked={showEffect} onChange={setShowEffect} />
        <SliderInput label="Threshold" value={threshold} onChange={setThreshold} min={0} max={255} step={1} />
        <SelectInput label="Grid Type" value={gridType} onChange={setGridType} options={['Regular', 'Benday']} />
        <SliderInput label="Grid Angle" value={gridAngle} onChange={setGridAngle} min={0} max={360} step={1} />
        <SliderInput label="Min Dot Size" value={minDotSize} onChange={setMinDotSize} min={1} max={50} step={1} />
        <SliderInput label="Max Dot Size" value={maxDotSize} onChange={setMaxDotSize} min={1} max={50} step={1} />
        <SliderInput label="Corner Radius" value={cornerRadius} onChange={setCornerRadius} min={0} max={25} step={1} />
        <SliderInput label="Step Size" value={stepSize} onChange={setStepSize} min={2} max={30} step={1} />
        <SliderInput label="Noise" value={noise} onChange={setNoise} min={0} max={1} step={0.01} />
        <ExportButton onExport={handleExport} />
      </ControlPanel>
    </>
  )
}
