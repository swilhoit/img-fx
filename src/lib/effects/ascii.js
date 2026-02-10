import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

const ALL_CHARS = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$░▒▓█'

export function createASCIISketch (image, paramsRef) {
  return (p) => {
    let processed = null

    p.setup = () => {
      const charW = 7
      const charH = 14
      const maxCols = 200
      const maxRows = 100
      p.createCanvas(maxCols * charW, maxRows * charH)

      if (!image) {
        const bg = hexToRgb(paramsRef.current.bgColor)
        p.background(bg[0], bg[1], bg[2])
        return
      }

      const params = paramsRef.current
      const { imageData, width, height } = resizeImageData(image, Math.max(maxCols, maxRows))
      const pre = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      processed = { data: pre, width, height }
    }

    p.draw = () => {
      if (!processed) { p.noLoop(); return }
      const params = paramsRef.current
      const cols = params.columns || 80
      const rows = params.rows || 40
      render(p, processed, params, cols, rows, 7, 14)
    }
  }
}

const CHAR_RAMPS = {
  standard: ' .:-=+*#%@',
  blocks: ' \u2591\u2592\u2593\u2588',
  simple: ' .:oO@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
}

function render (p, img, params, cols, rows, charW, charH) {
  const {
    characterSet = 'standard', customChars = '', invertRamp = false,
    showBorders = false, chaos = 0, fontSize = 12, charSpread = 0
  } = params

  let ramp = characterSet === 'custom' && customChars.length >= 2
    ? customChars
    : CHAR_RAMPS[characterSet] || CHAR_RAMPS.standard
  if (invertRamp) ramp = ramp.split('').reverse().join('')

  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  p.background(bg[0], bg[1], bg[2])
  p.fill(fg[0], fg[1], fg[2])
  p.textFont('monospace')
  p.textSize(fontSize)
  p.textAlign(p.LEFT, p.TOP)

  const cellW = img.width / cols
  const cellH = img.height / rows

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = Math.floor(Math.min((c + 0.5) * cellW, img.width - 1))
      const py = Math.floor(Math.min((r + 0.5) * cellH, img.height - 1))
      const idx = (py * img.width + px) * 4
      const gray = getGrayscale(img.data[idx], img.data[idx + 1], img.data[idx + 2])

      let charIdx = Math.floor((gray / 255) * (ramp.length - 1))

      // charSpread shifts the brightness-to-character mapping
      if (charSpread !== 0) {
        charIdx = Math.floor(charIdx + charSpread * (ramp.length - 1) * 0.5)
        charIdx = ((charIdx % ramp.length) + ramp.length) % ramp.length
      }

      let ch
      if (chaos > 0 && Math.random() < chaos) {
        // Replace with a random character from the full set, weighted by brightness
        const pool = chaos > 0.5 ? ALL_CHARS : ramp
        ch = pool[Math.floor(Math.random() * pool.length)]
      } else {
        ch = ramp[charIdx]
      }

      p.text(ch, c * charW, r * charH)
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
