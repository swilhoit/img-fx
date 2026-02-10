'use client'

import { useState, useCallback } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import { createASCIISketch } from '@/lib/effects/ascii'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import PreprocessingControls from '@/components/PreprocessingControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function ASCIIPage () {
  const { image, loadImage, showEffect, setShowEffect } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [columns, setColumns] = useState(80)
  const [rows, setRows] = useState(40)
  const [characterSet, setCharacterSet] = useState('standard')
  const [showBorders, setShowBorders] = useState(false)

  const allDeps = [image, showEffect, preprocessing, columns, rows, characterSet, showBorders]
  const params = { canvasSize: 600, preprocessing, columns, rows, characterSet, showBorders }

  const sketch = useCallback(
    (p) => createASCIISketch(showEffect ? image : null, params)(p),
    allDeps
  )
  const { containerRef, p5Ref } = useP5(sketch, allDeps)

  return (
    <>
      <div className="canvas-area" ref={containerRef} />
      <ControlPanel>
        <FileUploader onFile={loadImage} accept=".jpg,.png" />
        <PreprocessingControls params={preprocessing} onChange={setPreprocessing} />
        <SliderInput label="Columns" value={columns} onChange={setColumns} min={10} max={200} step={1} />
        <SliderInput label="Rows" value={rows} onChange={setRows} min={5} max={100} step={1} />
        <SelectInput label="Character Set" value={characterSet} onChange={setCharacterSet} options={['standard', 'blocks', 'simple', 'detailed']} />
        <Toggle label="Show Borders" checked={showBorders} onChange={setShowBorders} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('ascii', 'png') }, [p5Ref])} />
      </ControlPanel>
    </>
  )
}
