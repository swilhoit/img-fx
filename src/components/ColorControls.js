'use client'

import ControlGroup from '@/components/ControlGroup/ControlGroup'
import ColorInput from '@/components/ColorInput/ColorInput'
import { useGlobalState } from '@/context/GlobalStateProvider'

export default function ColorControls () {
  const { bgColor, setBgColor, fgColor, setFgColor } = useGlobalState()

  const swap = () => {
    const tmp = bgColor
    setBgColor(fgColor)
    setFgColor(tmp)
  }

  return (
    <ControlGroup title="Colors">
      <ColorInput label="Background" value={bgColor} onChange={setBgColor} />
      <ColorInput label="Foreground" value={fgColor} onChange={setFgColor} />
      <button
        onClick={swap}
        style={{
          padding: '4px 8px',
          fontSize: 12,
          color: 'var(--text-dim)',
          cursor: 'pointer',
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginTop: 4
        }}
      >
        ↕ Swap colors
      </button>
    </ControlGroup>
  )
}
