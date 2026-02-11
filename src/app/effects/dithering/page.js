'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import useVideoExport from '@/lib/useVideoExport'
import { createDitheringSketch } from '@/lib/effects/dithering'
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

export default function DitheringPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor, imageScale, imageOffsetX, imageOffsetY } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [pattern, setPattern] = useState('F-S')
  const [pixelSize, setPixelSize] = useState(1)
  const [colorMode, setColorMode] = useState('BW')
  const [threshold, setThreshold] = useState(128)

  const paramDefs = useMemo(() => ({
    pixelSize: { value: pixelSize, set: setPixelSize, min: 1, max: 10, step: 1 },
    threshold: { value: threshold, set: setThreshold, min: 0, max: 255, step: 1 }
  }), [pixelSize, threshold])

  const anim = useAnimation(paramDefs)

  const renderParams = { canvasSize, imageScale, imageOffsetX, imageOffsetY, bgColor, fgColor, preprocessing, pattern, pixelSize, colorMode, threshold }

  const sketchFactory = useCallback(
    (paramsRef) => createDitheringSketch(showEffect ? image : null, paramsRef),
    [image, showEffect]
  )

  const { containerRef, p5Ref } = useP5(sketchFactory, [image, showEffect, canvasSize, preprocessing, imageScale, imageOffsetX, imageOffsetY], renderParams)
  const videoExport = useVideoExport(containerRef)

  const handleExport = useCallback(() => {
    if (p5Ref.current) p5Ref.current.saveCanvas('dithering', 'png')
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
        <SelectInput label="Pattern" value={pattern} onChange={setPattern} options={['F-S', 'Bayer', 'Random']} />
        <SliderInput label="Pixel Size" value={pixelSize} onChange={setPixelSize} min={1} max={10} step={1} />
        <SelectInput label="Color Mode" value={colorMode} onChange={setColorMode} options={['BW', 'Full Color', 'Halftone']} />
        <SliderInput label="Threshold" value={threshold} onChange={setThreshold} min={0} max={255} step={1} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={handleExport} videoExport={videoExport} animationEnabled={anim.enabled} />
      </ControlPanel>
    </>
  )
}
