import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createScatterSketch (image, paramsRef) {
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
  const { pointDensity = 0.004, minDotSize = 4, maxDotSize = 14, relaxIterations = 1, relaxStrength = 0.16 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  p.background(bg[0], bg[1], bg[2])
  p.fill(fg[0], fg[1], fg[2])
  p.noStroke()

  const numPoints = Math.floor(img.width * img.height * pointDensity)
  let points = []

  for (let i = 0; i < numPoints; i++) {
    const x = Math.random() * img.width
    const y = Math.random() * img.height
    const px = Math.floor(Math.min(x, img.width - 1))
    const py = Math.floor(Math.min(y, img.height - 1))
    const idx = (py * img.width + px) * 4
    const gray = getGrayscale(img.data[idx], img.data[idx + 1], img.data[idx + 2])
    const acceptance = 1 - gray / 255
    if (Math.random() < acceptance) {
      points.push({ x, y, gray })
    }
  }

  for (let iter = 0; iter < relaxIterations; iter++) {
    for (let i = 0; i < points.length; i++) {
      let fx = 0, fy = 0, count = 0
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue
        const dx = points[i].x - points[j].x
        const dy = points[i].y - points[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < maxDotSize * 2 && dist > 0) {
          fx += (dx / dist) * relaxStrength
          fy += (dy / dist) * relaxStrength
          count++
        }
      }
      if (count > 0) {
        points[i].x += fx / count
        points[i].y += fy / count
        points[i].x = Math.max(0, Math.min(img.width, points[i].x))
        points[i].y = Math.max(0, Math.min(img.height, points[i].y))
      }
    }
  }

  for (const pt of points) {
    const t = 1 - pt.gray / 255
    const size = minDotSize + t * (maxDotSize - minDotSize)
    p.ellipse(pt.x, pt.y, size, size)
  }
}
