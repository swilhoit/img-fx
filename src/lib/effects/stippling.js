import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createStipplingSketch (image, paramsRef) {
  return (p) => {
    let processed = null

    p.setup = () => {
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
  const { threshold = 128, gridType = 'Regular', gridAngle = 0, ySquares = 50, xSquares = 50, minSquareWidth = 1, maxSquareWidth = 10 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  p.background(bg[0], bg[1], bg[2])
  p.fill(fg[0], fg[1], fg[2])
  p.noStroke()

  const cellW = img.width / xSquares
  const cellH = img.height / ySquares

  p.push()
  p.translate(img.width / 2, img.height / 2)
  p.rotate(p.radians(gridAngle))
  p.translate(-img.width / 2, -img.height / 2)

  for (let y = 0; y < ySquares; y++) {
    for (let x = 0; x < xSquares; x++) {
      const cx = (x + 0.5) * cellW
      const cy = (y + 0.5) * cellH
      const px = Math.floor(Math.min(cx, img.width - 1))
      const py = Math.floor(Math.min(cy, img.height - 1))
      const idx = (py * img.width + px) * 4
      const gray = getGrayscale(img.data[idx], img.data[idx + 1], img.data[idx + 2])

      if (gray < threshold) {
        const t = 1 - gray / threshold
        const size = minSquareWidth + t * (maxSquareWidth - minSquareWidth)

        if (gridType === 'Benday') {
          p.ellipse(cx, cy, size, size)
        } else {
          p.rect(cx - size / 2, cy - size / 2, size, size)
        }
      }
    }
  }
  p.pop()
}
