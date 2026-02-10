import { applyPreprocessing, getGrayscale, resizeImageData } from '../preprocessing'

export function createEdgeSketch (image, params) {
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
  const { threshold = 128, minDotSize = 2, maxDotSize = 10, cornerRadius = 0, stepSize = 4 } = params

  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    gray[i] = getGrayscale(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
  }

  // Sobel edge detection
  const edges = new Float32Array(width * height)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx =
        -gray[(y - 1) * width + (x - 1)] + gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)] +
        -gray[(y + 1) * width + (x - 1)] + gray[(y + 1) * width + (x + 1)]
      const gy =
        -gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - gray[(y - 1) * width + (x + 1)] +
        gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + gray[(y + 1) * width + (x + 1)]
      edges[y * width + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy))
    }
  }

  p.background(255)
  p.fill(0)
  p.noStroke()

  const cols = Math.ceil(width / stepSize)
  const rows = Math.ceil(height / stepSize)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * stepSize + stepSize / 2
      const cy = r * stepSize + stepSize / 2
      const px = Math.floor(Math.min(cx, width - 1))
      const py = Math.floor(Math.min(cy, height - 1))
      const edge = edges[py * width + px]

      if (edge > (255 - threshold)) {
        const t = edge / 255
        const size = minDotSize + t * (maxDotSize - minDotSize)
        if (cornerRadius > 0) {
          p.rect(cx - size / 2, cy - size / 2, size, size, cornerRadius)
        } else {
          p.ellipse(cx, cy, size, size)
        }
      }
    }
  }
}
