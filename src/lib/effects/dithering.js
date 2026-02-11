import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createDitheringSketch (image, paramsRef) {
  return (p) => {
    let imgData = null
    let imgW = 0, imgH = 0

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

function ditherChannel (values, w, h, pattern, threshold) {
  const out = new Float32Array(values)
  if (pattern === 'F-S') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x
        const old = out[idx]
        const val = old > threshold ? 255 : 0
        out[idx] = val
        const err = old - val
        if (x + 1 < w) out[idx + 1] += err * 7 / 16
        if (y + 1 < h) {
          if (x - 1 >= 0) out[(y + 1) * w + x - 1] += err * 3 / 16
          out[(y + 1) * w + x] += err * 5 / 16
          if (x + 1 < w) out[(y + 1) * w + x + 1] += err * 1 / 16
        }
      }
    }
  } else if (pattern === 'Bayer') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = (BAYER_4[y % 4][x % 4] / 16) * 255
        out[y * w + x] = out[y * w + x] > t ? 255 : 0
      }
    }
  } else {
    for (let i = 0; i < w * h; i++) {
      const t = threshold + (Math.random() - 0.5) * 128
      out[i] = out[i] > t ? 255 : 0
    }
  }
  return out
}

function render (p, data, width, height, params) {
  const { pattern = 'F-S', pixelSize = 1, colorMode = 'BW', threshold = 128 } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)
  const ps = Math.max(1, Math.round(pixelSize))

  if (colorMode === 'Full Color' || colorMode === 'Halftone') {
    renderColor(p, data, width, height, pattern, threshold, ps, bg, colorMode)
    return
  }

  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    gray[i] = getGrayscale(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
  }

  const dithered = ditherChannel(gray, width, height, pattern, threshold)

  p.background(bg[0], bg[1], bg[2])
  p.loadPixels()

  for (let y = 0; y < height; y += ps) {
    for (let x = 0; x < width; x += ps) {
      const isLight = dithered[y * width + x] > 127

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

function renderColor (p, data, width, height, pattern, threshold, ps, bg, mode) {
  // Extract per-channel arrays
  const rCh = new Float32Array(width * height)
  const gCh = new Float32Array(width * height)
  const bCh = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    rCh[i] = data[i * 4]
    gCh[i] = data[i * 4 + 1]
    bCh[i] = data[i * 4 + 2]
  }

  // Dither each channel independently
  const rD = ditherChannel(rCh, width, height, pattern, threshold)
  const gD = ditherChannel(gCh, width, height, pattern, threshold)
  const bD = ditherChannel(bCh, width, height, pattern, threshold)

  p.background(bg[0], bg[1], bg[2])
  p.loadPixels()

  for (let y = 0; y < height; y += ps) {
    for (let x = 0; x < width; x += ps) {
      const si = y * width + x

      let r, g, b
      if (mode === 'Full Color') {
        // Dithered channels preserve original color relationships
        r = rD[si]
        g = gD[si]
        b = bD[si]
      } else {
        // Halftone: each channel is strictly 0 or 255 (CMY-style)
        r = rD[si] > 127 ? 255 : 0
        g = gD[si] > 127 ? 255 : 0
        b = bD[si] > 127 ? 255 : 0
      }

      for (let dy = 0; dy < ps && y + dy < height; dy++) {
        for (let dx = 0; dx < ps && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          p.pixels[idx] = r
          p.pixels[idx + 1] = g
          p.pixels[idx + 2] = b
          p.pixels[idx + 3] = 255
        }
      }
    }
  }
  p.updatePixels()
}
