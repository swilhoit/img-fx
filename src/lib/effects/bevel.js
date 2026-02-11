import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createBevelSketch (image, paramsRef) {
  return (p) => {
    let grayData = null
    let imgW = 0, imgH = 0

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
      imgW = width
      imgH = height

      grayData = new Float32Array(width * height)
      for (let i = 0; i < width * height; i++) {
        grayData[i] = getGrayscale(pre[i * 4], pre[i * 4 + 1], pre[i * 4 + 2])
      }
    }

    p.draw = () => {
      if (!grayData) { p.noLoop(); return }
      render(p, grayData, imgW, imgH, paramsRef.current)
    }
  }
}

function render (p, gray, width, height, params) {
  const { depth = 3, lightAngle = 135, effectThreshold = 128 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  const rad = lightAngle * Math.PI / 180
  const lx = Math.cos(rad)
  const ly = Math.sin(rad)

  p.background(bg[0], bg[1], bg[2])
  p.loadPixels()

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      const c = gray[y * width + x]

      if (c > effectThreshold) {
        p.pixels[idx] = bg[0]
        p.pixels[idx + 1] = bg[1]
        p.pixels[idx + 2] = bg[2]
        p.pixels[idx + 3] = 255
        continue
      }

      const dx = (gray[y * width + (x + 1)] - gray[y * width + (x - 1)]) * depth
      const dy = (gray[(y + 1) * width + x] - gray[(y - 1) * width + x]) * depth

      const dot = (dx * lx + dy * ly) / (Math.sqrt(dx * dx + dy * dy + 1) || 1)
      const t = (dot + 1) / 2

      p.pixels[idx] = Math.round(bg[0] + (fg[0] - bg[0]) * t)
      p.pixels[idx + 1] = Math.round(bg[1] + (fg[1] - bg[1]) * t)
      p.pixels[idx + 2] = Math.round(bg[2] + (fg[2] - bg[2]) * t)
      p.pixels[idx + 3] = 255
    }
  }
  p.updatePixels()
}
