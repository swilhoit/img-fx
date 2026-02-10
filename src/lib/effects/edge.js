import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createEdgeSketch (image, paramsRef) {
  return (p) => {
    let edgeData = null
    let imgW = 0, imgH = 0

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
      imgW = width
      imgH = height

      const gray = new Float32Array(width * height)
      for (let i = 0; i < width * height; i++) {
        gray[i] = getGrayscale(pre[i * 4], pre[i * 4 + 1], pre[i * 4 + 2])
      }

      edgeData = new Float32Array(width * height)
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const gx =
            -gray[(y - 1) * width + (x - 1)] + gray[(y - 1) * width + (x + 1)] +
            -2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)] +
            -gray[(y + 1) * width + (x - 1)] + gray[(y + 1) * width + (x + 1)]
          const gy =
            -gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - gray[(y - 1) * width + (x + 1)] +
            gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + gray[(y + 1) * width + (x + 1)]
          edgeData[y * width + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy))
        }
      }
    }

    p.draw = () => {
      if (!edgeData) { p.noLoop(); return }
      render(p, edgeData, imgW, imgH, paramsRef.current)
    }
  }
}

function render (p, edges, width, height, params) {
  const { threshold = 128, minDotSize = 2, maxDotSize = 10, cornerRadius = 0, stepSize = 4 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  p.background(bg[0], bg[1], bg[2])
  p.fill(fg[0], fg[1], fg[2])
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
