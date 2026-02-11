'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import useVideoExport from '@/lib/useVideoExport'
import { createDistortSketch } from '@/lib/effects/distort'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'
import ImageControls from '@/components/ImageControls'

export default function DistortPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor, imageScale, imageOffsetX, imageOffsetY } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [distortionMap, setDistortionMap] = useState(null)
  const [threshold, setThreshold] = useState(128)
  const [xShift, setXShift] = useState(20)
  const [yShift, setYShift] = useState(20)

  const handleMapUpload = (file) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setDistortionMap(img)
    img.src = url
  }

  const paramDefs = useMemo(() => ({
    threshold: { value: threshold, set: setThreshold, min: 0, max: 255, step: 1 },
    xShift: { value: xShift, set: setXShift, min: 0, max: 100, step: 1 },
    yShift: { value: yShift, set: setYShift, min: 0, max: 100, step: 1 }
  }), [threshold, xShift, yShift])

  const anim = useAnimation(paramDefs)

  const renderParams = { canvasSize, imageScale, imageOffsetX, imageOffsetY, bgColor, fgColor, preprocessing, threshold, xShift, yShift }

  const sketchFactory = useCallback(
    (paramsRef) => createDistortSketch(showEffect ? image : null, distortionMap, paramsRef),
    [image, showEffect, distortionMap]
  )

  const { containerRef, p5Ref } = useP5(sketchFactory, [image, showEffect, canvasSize, preprocessing, distortionMap], renderParams)
  const videoExport = useVideoExport(containerRef)

  return (
    <>
      <div className="canvas-area" ref={containerRef} />
      <ControlPanel>
        <FileUploader onFile={loadImage} accept=".jpg,.png" />
        <FileUploader label="Distortion map" onFile={handleMapUpload} accept=".jpg,.png" id="distortion-map" />
        <SliderInput label="Canvas Size" value={canvasSize} onChange={setCanvasSize} min={100} max={1000} step={1} />
        <PreprocessingControls params={preprocessing} onChange={setPreprocessing} />
        <ImageControls />
        <Toggle label="Show Effect" checked={showEffect} onChange={setShowEffect} />
        <SliderInput label="Threshold" value={threshold} onChange={setThreshold} min={0} max={255} step={1} />
        <SliderInput label="X Shift Strength" value={xShift} onChange={setXShift} min={0} max={100} step={1} />
        <SliderInput label="Y Shift Strength" value={yShift} onChange={setYShift} min={0} max={100} step={1} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('distort', 'png') }, [p5Ref])} videoExport={videoExport} animationEnabled={anim.enabled} />
      </ControlPanel>
    </>
  )
}
