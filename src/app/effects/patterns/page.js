'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import useVideoExport from '@/lib/useVideoExport'
import { createPatternsSketch } from '@/lib/effects/patterns'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'
import ImageControls from '@/components/ImageControls'

export default function PatternsPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor, imageScale, imageOffsetX, imageOffsetY } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [patternImages, setPatternImages] = useState([])
  const [threshold, setThreshold] = useState(128)
  const [gridDensity, setGridDensity] = useState(20)

  const handlePatternUpload = (file) => {
    const url = URL.createObjectURL(file)
    setPatternImages(prev => [...prev, url])
  }

  const paramDefs = useMemo(() => ({
    threshold: { value: threshold, set: setThreshold, min: 0, max: 255, step: 1 },
    gridDensity: { value: gridDensity, set: setGridDensity, min: 5, max: 100, step: 1 }
  }), [threshold, gridDensity])

  const anim = useAnimation(paramDefs)

  const renderParams = { canvasSize, imageScale, imageOffsetX, imageOffsetY, bgColor, fgColor, preprocessing, threshold, gridDensity }

  const sketchFactory = useCallback(
    (paramsRef) => createPatternsSketch(showEffect ? image : null, patternImages, paramsRef),
    [image, showEffect, patternImages]
  )

  const { containerRef, p5Ref } = useP5(sketchFactory, [image, showEffect, canvasSize, preprocessing, patternImages], renderParams)
  const videoExport = useVideoExport(containerRef)

  return (
    <>
      <div className="canvas-area" ref={containerRef} />
      <ControlPanel>
        <FileUploader onFile={loadImage} accept=".jpg,.png,.mp4" />
        <FileUploader label="Upload patterns" onFile={handlePatternUpload} accept=".jpg,.png" id="patterns" />
        <SliderInput label="Canvas Size" value={canvasSize} onChange={setCanvasSize} min={100} max={1000} step={1} />
        <PreprocessingControls params={preprocessing} onChange={setPreprocessing} />
        <ImageControls />
        <Toggle label="Show Effect" checked={showEffect} onChange={setShowEffect} />
        <SliderInput label="Threshold" value={threshold} onChange={setThreshold} min={0} max={255} step={1} />
        <SliderInput label="Grid Density" value={gridDensity} onChange={setGridDensity} min={5} max={100} step={1} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('patterns', 'png') }, [p5Ref])} videoExport={videoExport} animationEnabled={anim.enabled} />
      </ControlPanel>
    </>
  )
}
