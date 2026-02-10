'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import useVideoExport from '@/lib/useVideoExport'
import { createStipplingSketch } from '@/lib/effects/stippling'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function StipplingPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect, bgColor, fgColor } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [threshold, setThreshold] = useState(128)
  const [gridType, setGridType] = useState('Regular')
  const [gridAngle, setGridAngle] = useState(0)
  const [ySquares, setYSquares] = useState(50)
  const [xSquares, setXSquares] = useState(50)
  const [minSquareWidth, setMinSquareWidth] = useState(1)
  const [maxSquareWidth, setMaxSquareWidth] = useState(10)

  const paramDefs = useMemo(() => ({
    threshold: { value: threshold, set: setThreshold, min: 0, max: 255, step: 1 },
    gridAngle: { value: gridAngle, set: setGridAngle, min: 0, max: 360, step: 1 },
    ySquares: { value: ySquares, set: setYSquares, min: 5, max: 200, step: 1 },
    xSquares: { value: xSquares, set: setXSquares, min: 5, max: 200, step: 1 },
    minSquareWidth: { value: minSquareWidth, set: setMinSquareWidth, min: 1, max: 20, step: 1 },
    maxSquareWidth: { value: maxSquareWidth, set: setMaxSquareWidth, min: 1, max: 30, step: 1 }
  }), [threshold, gridAngle, ySquares, xSquares, minSquareWidth, maxSquareWidth])

  const anim = useAnimation(paramDefs)

  const renderParams = { canvasSize, bgColor, fgColor, preprocessing, threshold, gridType, gridAngle, ySquares, xSquares, minSquareWidth, maxSquareWidth }

  const sketchFactory = useCallback(
    (paramsRef) => createStipplingSketch(showEffect ? image : null, paramsRef),
    [image, showEffect]
  )

  const { containerRef, p5Ref } = useP5(sketchFactory, [image, showEffect, canvasSize, preprocessing], renderParams)
  const videoExport = useVideoExport(containerRef)

  const handleExport = useCallback(() => {
    if (p5Ref.current) p5Ref.current.saveCanvas('stippling', 'png')
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
        <SliderInput label="Y Squares" value={ySquares} onChange={setYSquares} min={5} max={200} step={1} />
        <SliderInput label="X Squares" value={xSquares} onChange={setXSquares} min={5} max={200} step={1} />
        <SliderInput label="Min Square Width" value={minSquareWidth} onChange={setMinSquareWidth} min={1} max={20} step={1} />
        <SliderInput label="Max Square Width" value={maxSquareWidth} onChange={setMaxSquareWidth} min={1} max={30} step={1} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={handleExport} videoExport={videoExport} animationEnabled={anim.enabled} />
      </ControlPanel>
    </>
  )
}
