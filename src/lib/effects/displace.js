import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createDisplaceSketch (image, paramsRef) {
  return (p) => {
    let processed = null

    p.setup = () => {
      p.pixelDensity(1)
      const params = paramsRef.current
      if (!image) {
        p.createCanvas(params.canvasSize, params.canvasSize)
        const bg = hexToRgb(params.bgColor)
        p.background(bg[0], bg[1], bg[2])
        return
      }
      const { imageData, width, height } = resizeImageData(image, params.canvasSize, params.imageScale, params.imageOffsetX, params.imageOffsetY)
      p.createCanvas(width, height)
      const pre = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      processed = { data: pre, width, height }
    }

    p.draw = () => {
      if (!processed) { p.noLoop(); return }
      render(p, processed, paramsRef.current)
    }
  }
}

function render (p, img, params) {
  const { stepSize = 6, displacement = 10, dotSize = 4 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  p.background(bg[0], bg[1], bg[2])
  p.fill(fg[0], fg[1], fg[2])
  p.noStroke()

  const cols = Math.ceil(img.width / stepSize)
  const rows = Math.ceil(img.height / stepSize)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = c * stepSize + stepSize / 2
      const cy = r * stepSize + stepSize / 2
      const px = Math.floor(Math.min(cx, img.width - 1))
      const py = Math.floor(Math.min(cy, img.height - 1))
      const idx = (py * img.width + px) * 4
      const gray = getGrayscale(img.data[idx], img.data[idx + 1], img.data[idx + 2])
      const t = gray / 255

      const dx = cx + (t - 0.5) * displacement
      const dy = cy + (t - 0.5) * displacement

      p.ellipse(dx, dy, dotSize * (1 - t * 0.5), dotSize * (1 - t * 0.5))
    }
  }
}
