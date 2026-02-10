'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import { createBevelSketch } from '@/lib/effects/bevel'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function BevelPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [depth, setDepth] = useState(3)
  const [lightAngle, setLightAngle] = useState(135)
  const [effectThreshold, setEffectThreshold] = useState(128)

  const paramDefs = useMemo(() => ({
    depth: { value: depth, set: setDepth, min: 0.1, max: 10, step: 0.1 },
    lightAngle: { value: lightAngle, set: setLightAngle, min: 0, max: 360, step: 1 },
    effectThreshold: { value: effectThreshold, set: setEffectThreshold, min: 0, max: 255, step: 1 }
  }), [depth, lightAngle, effectThreshold])

  const anim = useAnimation(paramDefs)

  const allDeps = [image, showEffect, bgColor, fgColor, canvasSize, preprocessing, depth, lightAngle, effectThreshold]
  const params = { canvasSize, bgColor, fgColor, preprocessing, depth, lightAngle, effectThreshold }

  const sketch = useCallback(
    (p) => createBevelSketch(showEffect ? image : null, params)(p),
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
        <SliderInput label="Depth" value={depth} onChange={setDepth} min={0.1} max={10} step={0.1} />
        <SliderInput label="Light Angle" value={lightAngle} onChange={setLightAngle} min={0} max={360} step={1} />
        <SliderInput label="Effect Threshold" value={effectThreshold} onChange={setEffectThreshold} min={0} max={255} step={1} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('bevel', 'png') }, [p5Ref])} />
      </ControlPanel>
    </>
  )
}
