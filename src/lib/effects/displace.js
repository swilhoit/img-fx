import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createDisplaceSketch (image, params) {
  return (p) => {
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
      render(p, pre, width, height, params)
    }

    p.draw = () => { p.noLoop() }
  }
}

function render (p, data, width, height, params) {
  const { stepSize = 6, displacement = 10, dotSize = 4 } = params
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
      const idx = (py * width + px) * 4
      const gray = getGrayscale(data[idx], data[idx + 1], data[idx + 2])
      const t = gray / 255

      const dx = cx + (t - 0.5) * displacement
      const dy = cy + (t - 0.5) * displacement

      p.ellipse(dx, dy, dotSize * (1 - t * 0.5), dotSize * (1 - t * 0.5))
    }
  }
}
