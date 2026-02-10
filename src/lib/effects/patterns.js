import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createPatternsSketch (image, patternImages, params) {
  return (p) => {
    let patternsLoaded = []

    p.preload = () => {
      if (patternImages && patternImages.length > 0) {
        patternsLoaded = patternImages.map(src => p.loadImage(src))
      }
    }

    p.setup = () => {
      if (!image) {
        p.createCanvas(params.canvasSize, params.canvasSize)
        const bg = hexToRgb(params.bgColor)
        p.background(bg[0], bg[1], bg[2])
        return
      }
      const { imageData, width, height } = resizeImageData(image, params.canvasSize)
      p.createCanvas(width, height)
      const pre = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      render(p, pre, width, height, params, patternsLoaded)
    }

    p.draw = () => { p.noLoop() }
  }
}

function render (p, data, width, height, params, patterns) {
  const { threshold = 128, gridDensity = 20 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  p.background(bg[0], bg[1], bg[2])

  const cellSize = Math.max(4, Math.round(width / gridDensity))
  const cols = Math.ceil(width / cellSize)
  const rows = Math.ceil(height / cellSize)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * cellSize
      const cy = r * cellSize
      const px = Math.floor(Math.min(cx + cellSize / 2, width - 1))
      const py = Math.floor(Math.min(cy + cellSize / 2, height - 1))
      const idx = (py * width + px) * 4
      const gray = getGrayscale(data[idx], data[idx + 1], data[idx + 2])

      if (gray < threshold) {
        if (patterns.length > 0) {
          const patIdx = Math.floor((1 - gray / threshold) * (patterns.length - 1))
          const pat = patterns[Math.min(patIdx, patterns.length - 1)]
          p.image(pat, cx, cy, cellSize, cellSize)
        } else {
          const t = 1 - gray / threshold
          p.fill(fg[0], fg[1], fg[2], t * 255)
          p.noStroke()
          p.rect(cx, cy, cellSize, cellSize)
        }
      }
    }
  }
}
