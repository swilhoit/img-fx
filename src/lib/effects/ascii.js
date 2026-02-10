import { applyPreprocessing, getGrayscale, resizeImageData } from '../preprocessing'

export function createASCIISketch (image, params) {
  return (p) => {
    p.setup = () => {
      const cols = params.columns || 80
      const rows = params.rows || 40
      const charW = 7
      const charH = 14
      const w = cols * charW
      const h = rows * charH

      p.createCanvas(w, h)

      if (!image) {
        p.background(0)
        return
      }

      const { imageData, width, height } = resizeImageData(image, Math.max(cols, rows))
      const pre = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      render(p, pre, width, height, params, cols, rows, charW, charH)
    }

    p.draw = () => { p.noLoop() }
  }
}

const CHAR_RAMPS = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  simple: ' .:oO@',
  detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
}

function render (p, data, imgW, imgH, params, cols, rows, charW, charH) {
  const { characterSet = 'standard', showBorders = false } = params
  const ramp = CHAR_RAMPS[characterSet] || CHAR_RAMPS.standard

  p.background(0)
  p.fill(0, 255, 0)
  p.textFont('monospace')
  p.textSize(12)
  p.textAlign(p.LEFT, p.TOP)

  const cellW = imgW / cols
  const cellH = imgH / rows

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = Math.floor(Math.min((c + 0.5) * cellW, imgW - 1))
      const py = Math.floor(Math.min((r + 0.5) * cellH, imgH - 1))
      const idx = (py * imgW + px) * 4
      const gray = getGrayscale(data[idx], data[idx + 1], data[idx + 2])
      const charIdx = Math.floor((gray / 255) * (ramp.length - 1))
      const ch = ramp[charIdx]

      p.text(ch, c * charW, r * charH)
    }
  }

  if (showBorders) {
    p.stroke(0, 100, 0)
    p.noFill()
    for (let r = 0; r <= rows; r++) {
      p.line(0, r * charH, cols * charW, r * charH)
    }
    for (let c = 0; c <= cols; c++) {
      p.line(c * charW, 0, c * charW, rows * charH)
    }
  }
}
