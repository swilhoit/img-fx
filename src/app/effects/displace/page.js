'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import useVideoExport from '@/lib/useVideoExport'
import { createDisplaceSketch } from '@/lib/effects/displace'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'
import ImageControls from '@/components/ImageControls'

export default function DisplacePage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor, imageScale, imageOffsetX, imageOffsetY } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [stepSize, setStepSize] = useState(6)
  const [displacement, setDisplacement] = useState(10)
  const [dotSize, setDotSize] = useState(4)

  const paramDefs = useMemo(() => ({
    stepSize: { value: stepSize, set: setStepSize, min: 2, max: 20, step: 1 },
    displacement: { value: displacement, set: setDisplacement, min: 0, max: 50, step: 1 },
    dotSize: { value: dotSize, set: setDotSize, min: 1, max: 20, step: 1 }
  }), [stepSize, displacement, dotSize])

  const anim = useAnimation(paramDefs)

  const renderParams = { canvasSize, imageScale, imageOffsetX, imageOffsetY, bgColor, fgColor, preprocessing, stepSize, displacement, dotSize }

  const sketchFactory = useCallback(
    (paramsRef) => createDisplaceSketch(showEffect ? image : null, paramsRef),
    [image, showEffect]
  )

  const { containerRef, p5Ref } = useP5(sketchFactory, [image, showEffect, canvasSize, preprocessing, imageScale, imageOffsetX, imageOffsetY], renderParams)
  const videoExport = useVideoExport(containerRef)

  return (
    <>
      <div className="canvas-area" ref={containerRef} />
      <ControlPanel>
        <FileUploader onFile={loadImage} accept=".jpg,.png" />
        <SliderInput label="Canvas Size" value={canvasSize} onChange={setCanvasSize} min={100} max={1000} step={1} />
        <PreprocessingControls params={preprocessing} onChange={setPreprocessing} />
        <ImageControls />
        <Toggle label="Show Effect" checked={showEffect} onChange={setShowEffect} />
        <SliderInput label="Step Size" value={stepSize} onChange={setStepSize} min={2} max={20} step={1} />
        <SliderInput label="Displacement" value={displacement} onChange={setDisplacement} min={0} max={50} step={1} />
        <SliderInput label="Dot Size" value={dotSize} onChange={setDotSize} min={1} max={20} step={1} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('displace', 'png') }, [p5Ref])} videoExport={videoExport} animationEnabled={anim.enabled} />
      </ControlPanel>
    </>
  )
}
