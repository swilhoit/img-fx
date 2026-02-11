import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createASCIISketch (image, paramsRef) {
  return (p) => {
    let processed = null
    let frameCount = 0

    p.setup = () => {
      p.pixelDensity(1)
      const maxCols = 200
      const maxRows = 100
      p.createCanvas(maxCols * 7, maxRows * 14)

      if (!image) {
        const bg = hexToRgb(paramsRef.current.bgColor)
        p.background(bg[0], bg[1], bg[2])
        return
      }

      const params = paramsRef.current
      const { imageData, width, height } = resizeImageData(image, Math.max(maxCols, maxRows), params.imageScale, params.imageOffsetX, params.imageOffsetY)
      const pre = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      processed = { data: pre, width, height }
    }

    p.draw = () => {
      if (!processed) { p.noLoop(); return }
      frameCount++
      const params = paramsRef.current
      const cols = params.columns || 80
      const rows = params.rows || 40
      render(p, processed, params, cols, rows, 7, 14, frameCount)
    }
  }
}

const CHAR_RAMPS = {
  standard: ' .:-=+*#%@',
  blocks: ' \u2591\u2592\u2593\u2588',
  simple: ' .:oO@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
}

function render (p, img, params, cols, rows, charW, charH, frame) {
  const {
    characterSet = 'standard', customChars = '', invertRamp = false,
    showBorders = false, drift = 0, jitter = 0, wave = 0,
    fontSize = 12, brightness = 0
  } = params

  let ramp = characterSet === 'custom' && customChars.length >= 2
    ? customChars
    : CHAR_RAMPS[characterSet] || CHAR_RAMPS.standard
  if (invertRamp) ramp = ramp.split('').reverse().join('')

  const rampLen = ramp.length
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  p.background(bg[0], bg[1], bg[2])
  p.fill(fg[0], fg[1], fg[2])
  p.textFont('monospace')
  p.textSize(fontSize)
  p.textAlign(p.LEFT, p.TOP)

  const cellW = img.width / cols
  const cellH = img.height / rows
  const t = frame * 0.05

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = Math.floor(Math.min((c + 0.5) * cellW, img.width - 1))
      const py = Math.floor(Math.min((r + 0.5) * cellH, img.height - 1))
      const idx = (py * img.width + px) * 4
      const gray = getGrayscale(img.data[idx], img.data[idx + 1], img.data[idx + 2])

      let charIdx = (gray / 255) * (rampLen - 1)

      // Brightness shifts the entire mapping
      if (brightness !== 0) {
        charIdx += brightness * (rampLen - 1)
      }

      // Drift: smooth per-cell noise offset that evolves over time
      if (drift > 0) {
        const nx = Math.sin(c * 0.3 + t * 0.7) * Math.cos(r * 0.2 + t * 0.5)
        charIdx += nx * drift * (rampLen - 1) * 0.5
      }

      // Wave: directional sine sweep across the grid
      if (wave > 0) {
        const waveOffset = Math.sin((c + r) * 0.15 + t * 1.2) * wave * (rampLen - 1) * 0.4
        charIdx += waveOffset
      }

      // Jitter: small random per-cell flicker
      if (jitter > 0) {
        charIdx += (Math.random() - 0.5) * jitter * (rampLen - 1) * 0.5
      }

      charIdx = Math.round(charIdx)
      charIdx = ((charIdx % rampLen) + rampLen) % rampLen

      p.text(ramp[charIdx], c * charW, r * charH)
    }
  }

  if (showBorders) {
    p.stroke(fg[0], fg[1], fg[2], 80)
    p.noFill()
    for (let r = 0; r <= rows; r++) {
      p.line(0, r * charH, cols * charW, r * charH)
    }
    for (let c = 0; c <= cols; c++) {
      p.line(c * charW, 0, c * charW, rows * charH)
    }
  }
}
