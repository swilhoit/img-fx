import { applyPreprocessing, getGrayscale, resizeImageData } from '../preprocessing'

export function createBevelSketch (image, params) {
  return (p) => {
    p.setup = () => {
      if (!image) {
        p.createCanvas(params.canvasSize, params.canvasSize)
        p.background(200)
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
  const { depth = 3, lightAngle = 135, effectThreshold = 128 } = params

  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    gray[i] = getGrayscale(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
  }

  const rad = lightAngle * Math.PI / 180
  const lx = Math.cos(rad)
  const ly = Math.sin(rad)

  p.loadPixels()

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      const c = gray[y * width + x]

      if (c > effectThreshold) {
        p.pixels[idx] = p.pixels[idx + 1] = p.pixels[idx + 2] = 200
        p.pixels[idx + 3] = 255
        continue
      }

      const dx = (gray[y * width + (x + 1)] - gray[y * width + (x - 1)]) * depth
      const dy = (gray[(y + 1) * width + x] - gray[(y - 1) * width + x]) * depth

      const dot = (dx * lx + dy * ly) / (Math.sqrt(dx * dx + dy * dy + 1) || 1)
      const light = Math.min(255, Math.max(0, 128 + dot * 127))

      p.pixels[idx] = light
      p.pixels[idx + 1] = light
      p.pixels[idx + 2] = light
      p.pixels[idx + 3] = 255
    }
  }

  p.updatePixels()
}
