import { applyPreprocessing, getGrayscale, resizeImageData } from '../preprocessing'

export function createGradientsSketch (image, params) {
  return (p) => {
    p.setup = () => {
      if (!image) {
        p.createCanvas(params.canvasSize, params.canvasSize)
        p.background(255)
        return
      }
      const { imageData, width, height } = resizeImageData(image, params.canvasSize)
      p.createCanvas(width, height)
      const pre = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      render(p, pre, width, height, params)
    }

    p.draw = () => { p.noLoop() }
  }
}

function render (p, data, width, height, params) {
  const { threshold = 128, stepSize = 8, shapeType = 'rect' } = params

  p.background(255)
  p.noStroke()

  const cols = Math.ceil(width / stepSize)
  const rows = Math.ceil(height / stepSize)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * stepSize + stepSize / 2
      const cy = r * stepSize + stepSize / 2
      const px = Math.floor(Math.min(cx, width - 1))
      const py = Math.floor(Math.min(cy, height - 1))
      const idx = (py * width + px) * 4
      const gray = getGrayscale(data[idx], data[idx + 1], data[idx + 2])

      if (gray < threshold) {
        const t = 1 - gray / threshold
        const size = stepSize * t

        p.fill(0, t * 255)

        if (shapeType === 'ellipse') {
          p.ellipse(cx, cy, size, size)
        } else {
          p.rect(cx - size / 2, cy - size / 2, size, size)
        }
      }
    }
  }
}
