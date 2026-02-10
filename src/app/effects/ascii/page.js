'use client'

import { useState, useCallback, useMemo } from 'react'
import { useGlobalState } from '@/context/GlobalStateProvider'
import useP5 from '@/lib/useP5'
import useAnimation from '@/lib/useAnimation'
import useVideoExport from '@/lib/useVideoExport'
import { createASCIISketch } from '@/lib/effects/ascii'
import ControlPanel from '@/components/ControlPanel/ControlPanel'
import FileUploader from '@/components/FileUploader/FileUploader'
import SliderInput from '@/components/SliderInput/SliderInput'
import Toggle from '@/components/Toggle/Toggle'
import SelectInput from '@/components/SelectInput/SelectInput'
import PreprocessingControls from '@/components/PreprocessingControls'
import AnimationControls from '@/components/AnimationControls/AnimationControls'
import ColorControls from '@/components/ColorControls'
import ExportButton from '@/components/ExportButton/ExportButton'

export default function ASCIIPage () {
  const { image, loadImage, showEffect, setShowEffect, bgColor, fgColor } = useGlobalState()
  const [preprocessing, setPreprocessing] = useState({ blur: 0, grain: 0, gamma: 1, blackPoint: 0, whitePoint: 255 })
  const [columns, setColumns] = useState(80)
  const [rows, setRows] = useState(40)
  const [characterSet, setCharacterSet] = useState('standard')
  const [customChars, setCustomChars] = useState('')
  const [invertRamp, setInvertRamp] = useState(false)
  const [showBorders, setShowBorders] = useState(false)
  const [chaos, setChaos] = useState(0)
  const [fontSize, setFontSize] = useState(12)
  const [charSpread, setCharSpread] = useState(0)

  const paramDefs = useMemo(() => ({
    chaos: { value: chaos, set: setChaos, min: 0, max: 1, step: 0.01 },
    fontSize: { value: fontSize, set: setFontSize, min: 4, max: 32, step: 1 },
    charSpread: { value: charSpread, set: setCharSpread, min: -1, max: 1, step: 0.01 },
    columns: { value: columns, set: setColumns, min: 10, max: 200, step: 1 },
    rows: { value: rows, set: setRows, min: 5, max: 100, step: 1 }
  }), [chaos, fontSize, charSpread, columns, rows])

  const anim = useAnimation(paramDefs, ['columns', 'rows'])

  const renderParams = { canvasSize: 600, bgColor, fgColor, preprocessing, columns, rows, characterSet, customChars, invertRamp, showBorders, chaos, fontSize, charSpread }

  const sketchFactory = useCallback(
    (paramsRef) => createASCIISketch(showEffect ? image : null, paramsRef),
    [image, showEffect]
  )

  const { containerRef, p5Ref } = useP5(sketchFactory, [image, showEffect, preprocessing], renderParams)
  const videoExport = useVideoExport(containerRef)

  return (
    <>
      <div className="canvas-area" ref={containerRef} />
      <ControlPanel>
        <FileUploader onFile={loadImage} accept=".jpg,.png" />
        <PreprocessingControls params={preprocessing} onChange={setPreprocessing} />
        <SliderInput label="Columns" value={columns} onChange={setColumns} min={10} max={200} step={1} />
        <SliderInput label="Rows" value={rows} onChange={setRows} min={5} max={100} step={1} />
        <SelectInput label="Character Set" value={characterSet} onChange={setCharacterSet} options={['standard', 'blocks', 'simple', 'detailed', 'custom']} />
        {characterSet === 'custom' && (
          <div style={{ padding: '4px 0' }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>Custom Characters (light to dark)</label>
            <input
              type="text"
              value={customChars}
              onChange={(e) => setCustomChars(e.target.value)}
              placeholder=" .:-=+*#%@"
              style={{
                width: '100%',
                padding: '6px 8px',
                background: 'var(--bg-input)',
                color: 'var(--text)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)',
                fontSize: 12,
                fontFamily: 'monospace'
              }}
            />
          </div>
        )}
        <SliderInput label="Chaos" value={chaos} onChange={setChaos} min={0} max={1} step={0.01} />
        <SliderInput label="Font Size" value={fontSize} onChange={setFontSize} min={4} max={32} step={1} />
        <SliderInput label="Char Spread" value={charSpread} onChange={setCharSpread} min={-1} max={1} step={0.01} />
        <Toggle label="Invert Ramp" checked={invertRamp} onChange={setInvertRamp} />
        <Toggle label="Show Borders" checked={showBorders} onChange={setShowBorders} />
        <ColorControls />
        <AnimationControls {...anim} />
        <ExportButton onExport={useCallback(() => { if (p5Ref.current) p5Ref.current.saveCanvas('ascii', 'png') }, [p5Ref])} videoExport={videoExport} animationEnabled={anim.enabled} />
      </ControlPanel>
    </>
  )
}
