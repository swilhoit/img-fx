'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import { createCellularAutomataSketch } from '@/lib/effects/cellular-automata'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function CellularAutomataPage () {
  const { image, loadImage, canvasSize, setCanvasSize, showEffect, setShowEffect } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [threshold, setThreshold] = useState(128)
  const [cellSize, setCellSize] = useState(4)
  const [steps, setSteps] = useState(3)
  const [type, setType] = useState('Classic')
  const [surviveLower, setSurviveLower] = useState(2)
  const [surviveUpper, setSurviveUpper] = useState(3)
  const [birthLower, setBirthLower] = useState(3)
  const [birthUpper, setBirthUpper] = useState(3)

  const paramDefs = useMemo(() => ({
    threshold: { value: threshold, set: setThreshold, min: 0, max: 255, step: 1 },
    cellSize: { value: cellSize, set: setCellSize, min: 1, max: 20, step: 1 },
    steps: { value: steps, set: setSteps, min: 0, max: 50, step: 1 },
    surviveLower: { value: surviveLower, set: setSurviveLower, min: 0, max: 8, step: 1 },
    surviveUpper: { value: surviveUpper, set: setSurviveUpper, min: 0, max: 8, step: 1 },
    birthLower: { value: birthLower, set: setBirthLower, min: 0, max: 8, step: 1 },
    birthUpper: { value: birthUpper, set: setBirthUpper, min: 0, max: 8, step: 1 }
  }), [threshold, cellSize, steps, surviveLower, surviveUpper, birthLower, birthUpper])

  const anim = useAnimation(paramDefs)

  const allDeps = [image, showEffect, canvasSize, preprocessing, threshold, cellSize, steps, type, surviveLower, surviveUpper, birthLower, birthUpper]
  const params = { canvasSize, preprocessing, threshold, cellSize, steps, type, surviveLower, surviveUpper, birthLower, birthUpper }

  const sketch = useCallback(
    (p) => createCellularAutomataSketch(showEffect ? image : null, params)(p),
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
        <SliderInput label="Cell Size" value={cellSize} onChange={setCellSize} min={1} max={20} step={1} />
        <SliderInput label="Steps" value={steps} onChange={setSteps} min={0} max={50} step={1} />
        <SelectInput label="Type" value={type} onChange={setType} options={['Classic', 'LTL', 'MNCA', 'BMNCC']} />
        <SliderInput label="Survive Lower Bound" value={surviveLower} onChange={setSurviveLower} min={0} max={8} step={1} />
        <SliderInput label="Survive Upper Bound" value={surviveUpper} onChange={setSurviveUpper} min={0} max={8} step={1} />
        <SliderInput label="Birth Lower Bound" value={birthLower} onChange={setBirthLower} min={0} max={8} step={1} />
        <SliderInput label="Birth Upper Bound" value={birthUpper} onChange={setBirthUpper} min={0} max={8} step={1} />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('cellular-automata', 'png') }, [p5Ref])} />
      </ControlPanel>
    </>
  )
}
