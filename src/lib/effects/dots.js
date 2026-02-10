import { applyPreprocessing, getGrayscale, resizeImageData } from '../preprocessing'

export function createDotsSketch (image, params) {
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
  const { threshold = 128, gridType = 'Regular', gridAngle = 0, minDotSize = 2, maxDotSize = 12, cornerRadius = 0, stepSize = 8, noise = 0 } = params

  p.background(255)
  p.fill(0)
  p.noStroke()

  const cols = Math.ceil(img.width / stepSize)
  const rows = Math.ceil(img.height / stepSize)

  p.push()
  p.translate(img.width / 2, img.height / 2)
  p.rotate(p.radians(gridAngle))
  p.translate(-img.width / 2, -img.height / 2)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let cx = c * stepSize + stepSize / 2
      let cy = r * stepSize + stepSize / 2

      if (gridType === 'Benday' && r % 2 === 1) {
        cx += stepSize / 2
      }

      if (noise > 0) {
        cx += (Math.random() - 0.5) * noise * stepSize
        cy += (Math.random() - 0.5) * noise * stepSize
      }

      const px = Math.floor(Math.min(Math.max(cx, 0), img.width - 1))
      const py = Math.floor(Math.min(Math.max(cy, 0), img.height - 1))
      const idx = (py * img.width + px) * 4
      const gray = getGrayscale(img.data[idx], img.data[idx + 1], img.data[idx + 2])

      if (gray < threshold) {
        const t = 1 - gray / threshold
        const size = minDotSize + t * (maxDotSize - minDotSize)

        if (cornerRadius > 0) {
          p.rect(cx - size / 2, cy - size / 2, size, size, cornerRadius)
        } else {
          p.ellipse(cx, cy, size, size)
        }
      }
    }
  }
  p.pop()
}
