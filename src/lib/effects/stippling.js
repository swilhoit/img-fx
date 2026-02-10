import { applyPreprocessing, getGrayscale, resizeImageData } from '../preprocessing'

export function createStipplingSketch (image, params) {
  return (p) => {
    let processed

    p.setup = () => {
      if (!image) {
        p.createCanvas(params.canvasSize, params.canvasSize)
        p.background(255)
        return
      }
      const { imageData, width, height } = resizeImageData(image, params.canvasSize)
      p.createCanvas(width, height)
      const pre = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      processed = { data: pre, width, height }
      render(p, processed, params)
    }

    p.draw = () => { p.noLoop() }
  }
}

function render (p, img, params) {
  const { threshold = 128, gridType = 'Regular', gridAngle = 0, ySquares = 50, xSquares = 50, minSquareWidth = 1, maxSquareWidth = 10 } = params

  p.background(255)
  p.fill(0)
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
