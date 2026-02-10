import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createDitheringSketch (image, paramsRef) {
  return (p) => {
    let imgData = null
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
      imgData = applyPreprocessing(imageData.data, width, height, params.preprocessing)
      imgW = width
      imgH = height
    }

    p.draw = () => {
      if (!imgData) { p.noLoop(); return }
      render(p, imgData, imgW, imgH, paramsRef.current)
    }
  }
}

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
]

function render (p, data, width, height, params) {
  const { pattern = 'F-S', pixelSize = 1, colorMode = 'BW', threshold = 128 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    gray[i] = getGrayscale(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
  }

  if (pattern === 'F-S') {
    floydSteinberg(gray, width, height, threshold)
  } else if (pattern === 'Bayer') {
    bayer(gray, width, height)
  } else {
    randomDither(gray, width, height, threshold)
  }

  p.loadPixels()
  const ps = Math.max(1, Math.round(pixelSize))

  for (let y = 0; y < height; y += ps) {
    for (let x = 0; x < width; x += ps) {
      const isLight = gray[y * width + x] > 127

      for (let dy = 0; dy < ps && y + dy < height; dy++) {
        for (let dx = 0; dx < ps && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          if (colorMode === 'BW') {
            const color = isLight ? bg : fg
            p.pixels[idx] = color[0]
            p.pixels[idx + 1] = color[1]
            p.pixels[idx + 2] = color[2]
          } else {
            const oi = ((y + dy) * width + (x + dx)) * 4
            if (isLight) {
              p.pixels[idx] = data[oi]
              p.pixels[idx + 1] = data[oi + 1]
              p.pixels[idx + 2] = data[oi + 2]
            } else {
              p.pixels[idx] = bg[0]
              p.pixels[idx + 1] = bg[1]
              p.pixels[idx + 2] = bg[2]
            }
          }
          p.pixels[idx + 3] = 255
        }
      }
    }
  }
  p.updatePixels()
}

function floydSteinberg (gray, w, h, threshold) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      const old = gray[idx]
      const val = old > threshold ? 255 : 0
      gray[idx] = val
      const err = old - val
      if (x + 1 < w) gray[idx + 1] += err * 7 / 16
      if (y + 1 < h) {
        if (x - 1 >= 0) gray[(y + 1) * w + x - 1] += err * 3 / 16
        gray[(y + 1) * w + x] += err * 5 / 16
        if (x + 1 < w) gray[(y + 1) * w + x + 1] += err * 1 / 16
      }
    }
  }
}

function bayer (gray, w, h) {
  const n = 4
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const threshold = (BAYER_4[y % n][x % n] / 16) * 255
      gray[y * w + x] = gray[y * w + x] > threshold ? 255 : 0
    }
  }
}

function randomDither (gray, w, h, threshold) {
  for (let i = 0; i < w * h; i++) {
    const t = threshold + (Math.random() - 0.5) * 128
    gray[i] = gray[i] > t ? 255 : 0
  }
}
