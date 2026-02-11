'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import useVideoExport from '@/lib/useVideoExport'
import { createDotsSketch } from '@/lib/effects/dots'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'
import ImageControls from '@/components/ImageControls'

export default function DotsPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor, imageScale, imageOffsetX, imageOffsetY } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [threshold, setThreshold] = useState(128)
  const [gridType, setGridType] = useState('Regular')
  const [gridAngle, setGridAngle] = useState(0)
  const [minDotSize, setMinDotSize] = useState(2)
  const [maxDotSize, setMaxDotSize] = useState(12)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [stepSize, setStepSize] = useState(8)
  const [noise, setNoise] = useState(0)

  const paramDefs = useMemo(() => ({
    threshold: { value: threshold, set: setThreshold, min: 0, max: 255, step: 1 },
    gridAngle: { value: gridAngle, set: setGridAngle, min: 0, max: 360, step: 1 },
    minDotSize: { value: minDotSize, set: setMinDotSize, min: 1, max: 50, step: 1 },
    maxDotSize: { value: maxDotSize, set: setMaxDotSize, min: 1, max: 50, step: 1 },
    cornerRadius: { value: cornerRadius, set: setCornerRadius, min: 0, max: 25, step: 1 },
    stepSize: { value: stepSize, set: setStepSize, min: 2, max: 30, step: 1 },
    noise: { value: noise, set: setNoise, min: 0, max: 1, step: 0.01 }
  }), [threshold, gridAngle, minDotSize, maxDotSize, cornerRadius, stepSize, noise])

  const anim = useAnimation(paramDefs)

  const renderParams = { canvasSize, imageScale, imageOffsetX, imageOffsetY, bgColor, fgColor, preprocessing, threshold, gridType, gridAngle, minDotSize, maxDotSize, cornerRadius, stepSize, noise }

  const sketchFactory = useCallback(
    (paramsRef) => createDotsSketch(showEffect ? image : null, paramsRef),
    [image, showEffect]
  )

  const { containerRef, p5Ref } = useP5(sketchFactory, [image, showEffect, canvasSize, preprocessing, imageScale, imageOffsetX, imageOffsetY], renderParams)
  const videoExport = useVideoExport(containerRef)

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
        <ImageControls />
        <Toggle label="Show Effect" checked={showEffect} onChange={setShowEffect} />
        <SliderInput label="Threshold" value={threshold} onChange={setThreshold} min={0} max={255} step={1} />
        <SelectInput label="Grid Type" value={gridType} onChange={setGridType} options={['Regular', 'Benday']} />
        <SliderInput label="Grid Angle" value={gridAngle} onChange={setGridAngle} min={0} max={360} step={1} />
        <SliderInput label="Min Dot Size" value={minDotSize} onChange={setMinDotSize} min={1} max={50} step={1} />
        <SliderInput label="Max Dot Size" value={maxDotSize} onChange={setMaxDotSize} min={1} max={50} step={1} />
        <SliderInput label="Corner Radius" value={cornerRadius} onChange={setCornerRadius} min={0} max={25} step={1} />
        <SliderInput label="Step Size" value={stepSize} onChange={setStepSize} min={2} max={30} step={1} />
        <SliderInput label="Noise" value={noise} onChange={setNoise} min={0} max={1} step={0.01} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={handleExport} videoExport={videoExport} animationEnabled={anim.enabled} />
      </ControlPanel>
    </>
  )
}
