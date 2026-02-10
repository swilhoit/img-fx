import { applyPreprocessing, getGrayscale, resizeImageData } from '../preprocessing'

export function createScatterSketch (image, params) {
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
  const { pointDensity = 0.004, minDotSize = 4, maxDotSize = 14, relaxIterations = 1, relaxStrength = 0.16 } = params

  p.background(255)
  p.fill(0)
  p.noStroke()

  const numPoints = Math.floor(width * height * pointDensity)
  let points = []

  for (let i = 0; i < numPoints; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const px = Math.floor(Math.min(x, width - 1))
    const py = Math.floor(Math.min(y, height - 1))
    const idx = (py * width + px) * 4
    const gray = getGrayscale(data[idx], data[idx + 1], data[idx + 2])
    const acceptance = 1 - gray / 255
    if (Math.random() < acceptance) {
      points.push({ x, y, gray })
    }
  }

  // Lloyd relaxation
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
        points[i].x = Math.max(0, Math.min(width, points[i].x))
        points[i].y = Math.max(0, Math.min(height, points[i].y))
      }
    }
  }

  for (const pt of points) {
    const t = 1 - pt.gray / 255
    const size = minDotSize + t * (maxDotSize - minDotSize)
    p.ellipse(pt.x, pt.y, size, size)
  }
}
