import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createPatternsSketch (image, patternImages, paramsRef) {
  return (p) => {
    let patternsLoaded = []
    let processed = null

    p.preload = () => {
      if (patternImages && patternImages.length > 0) {
        patternsLoaded = patternImages.map(src => p.loadImage(src))
      }
    }

    p.setup = () => {
      const params = paramsRef.current
      if (!image) {
        p.createCanvas(params.canvasSize, params.canvasSize)
        const bg = hexToRgb(params.bgColor)
        p.background(bg[0], bg[1], bg[2])
        return
      }
      const { imageData, width, height } = resizeImageData(image, params.canvasSize)
      p.createCanvas(width, height)
      const pre = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      processed = { data: pre, width, height }
    }

    p.draw = () => {
      if (!processed) { p.noLoop(); return }
      render(p, processed, paramsRef.current, patternsLoaded)
    }
  }
}

function render (p, img, params, patterns) {
  const { threshold = 128, gridDensity = 20 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  p.background(bg[0], bg[1], bg[2])

  const cellSize = Math.max(4, Math.round(img.width / gridDensity))
  const cols = Math.ceil(img.width / cellSize)
  const rows = Math.ceil(img.height / cellSize)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * cellSize
      const cy = r * cellSize
      const px = Math.floor(Math.min(cx + cellSize / 2, img.width - 1))
      const py = Math.floor(Math.min(cy + cellSize / 2, img.height - 1))
      const idx = (py * img.width + px) * 4
      const gray = getGrayscale(img.data[idx], img.data[idx + 1], img.data[idx + 2])

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
