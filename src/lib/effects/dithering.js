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

// Color distance functions
function distEuclidean (r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function distManhattan (r1, g1, b1, r2, g2, b2) {
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)
}

function distWeighted (r1, g1, b1, r2, g2, b2) {
  const rMean = (r1 + r2) / 2
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2
  return Math.sqrt((2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db)
}

const DIST_FUNCS = [distEuclidean, distManhattan, distWeighted]

// Generate a quantized palette with N evenly spaced colors in RGB cube
function generatePalette (colorCount, bgColor, fgColor) {
  if (colorCount <= 2) return [bgColor, fgColor]
  const palette = []
  const steps = Math.max(2, Math.ceil(Math.cbrt(colorCount)))
  for (let r = 0; r < steps; r++) {
    for (let g = 0; g < steps; g++) {
      for (let b = 0; b < steps; b++) {
        palette.push([
          Math.round((r / (steps - 1)) * 255),
          Math.round((g / (steps - 1)) * 255),
          Math.round((b / (steps - 1)) * 255)
        ])
        if (palette.length >= colorCount) return palette
      }
    }
  }
  return palette
}

function findClosest (r, g, b, palette, distFn) {
  let best = 0, bestD = Infinity
  for (let i = 0; i < palette.length; i++) {
    const d = distFn(r, g, b, palette[i][0], palette[i][1], palette[i][2])
    if (d < bestD) { bestD = d; best = i }
  }
  return palette[best]
}

function ditherChannel (values, w, h, pattern, threshold, strength) {
  const out = new Float32Array(values)
  const s = strength
  if (pattern === 'F-S') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x
        const old = out[idx]
        const val = old > threshold ? 255 : 0
        out[idx] = val
        const err = (old - val) * s
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
      const t = threshold + (Math.random() - 0.5) * 128 * s
      out[i] = out[i] > t ? 255 : 0
    }
  }
  return out
}

function render (p, data, width, height, params) {
  const {
    pattern = 'F-S', pixelStep = 1, colorMode = 'BW', threshold = 128,
    colorCount = 2, distanceMode = 0, ditherStrength = 1
  } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)
  const ps = Math.max(1, Math.round(pixelStep))
  const distFn = DIST_FUNCS[distanceMode] || distEuclidean
  const strength = ditherStrength

  if (colorMode === 'Full Color' || colorMode === 'Halftone') {
    renderColor(p, data, width, height, pattern, threshold, ps, bg, colorMode, strength)
    return
  }

  const palette = generatePalette(colorCount, bg, fg)
  const usePalette = colorCount > 2

  if (usePalette) {
    renderPalette(p, data, width, height, pattern, threshold, ps, palette, distFn, strength)
  } else {
    renderBW(p, data, width, height, pattern, threshold, ps, bg, fg, strength)
  }
}

function renderBW (p, data, width, height, pattern, threshold, ps, bg, fg, strength) {
  const gray = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    gray[i] = getGrayscale(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
  }

  const dithered = ditherChannel(gray, width, height, pattern, threshold, strength)

  p.background(bg[0], bg[1], bg[2])
  p.loadPixels()

  for (let y = 0; y < height; y += ps) {
    for (let x = 0; x < width; x += ps) {
      const color = dithered[y * width + x] > 127 ? bg : fg
      for (let dy = 0; dy < ps && y + dy < height; dy++) {
        for (let dx = 0; dx < ps && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          p.pixels[idx] = color[0]
          p.pixels[idx + 1] = color[1]
          p.pixels[idx + 2] = color[2]
          p.pixels[idx + 3] = 255
        }
      }
    }
  }
  p.updatePixels()
}

function renderPalette (p, data, width, height, pattern, threshold, ps, palette, distFn, strength) {
  const n = width * height
  const rArr = new Float32Array(n)
  const gArr = new Float32Array(n)
  const bArr = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    rArr[i] = data[i * 4]
    gArr[i] = data[i * 4 + 1]
    bArr[i] = data[i * 4 + 2]
  }

  p.background(0)
  p.loadPixels()

  if (pattern === 'F-S') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const or = rArr[idx], og = gArr[idx], ob = bArr[idx]
        const closest = findClosest(or, og, ob, palette, distFn)
        rArr[idx] = closest[0]; gArr[idx] = closest[1]; bArr[idx] = closest[2]
        const er = (or - closest[0]) * strength
        const eg = (og - closest[1]) * strength
        const eb = (ob - closest[2]) * strength
        if (x + 1 < width) {
          rArr[idx + 1] += er * 7 / 16; gArr[idx + 1] += eg * 7 / 16; bArr[idx + 1] += eb * 7 / 16
        }
        if (y + 1 < height) {
          if (x - 1 >= 0) {
            const ni = (y + 1) * width + x - 1
            rArr[ni] += er * 3 / 16; gArr[ni] += eg * 3 / 16; bArr[ni] += eb * 3 / 16
          }
          const ni2 = (y + 1) * width + x
          rArr[ni2] += er * 5 / 16; gArr[ni2] += eg * 5 / 16; bArr[ni2] += eb * 5 / 16
          if (x + 1 < width) {
            const ni3 = (y + 1) * width + x + 1
            rArr[ni3] += er * 1 / 16; gArr[ni3] += eg * 1 / 16; bArr[ni3] += eb * 1 / 16
          }
        }
      }
    }
  } else if (pattern === 'Bayer') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const bayerVal = (BAYER_4[y % 4][x % 4] / 16 - 0.5) * 64 * strength
        rArr[idx] += bayerVal; gArr[idx] += bayerVal; bArr[idx] += bayerVal
        const closest = findClosest(rArr[idx], gArr[idx], bArr[idx], palette, distFn)
        rArr[idx] = closest[0]; gArr[idx] = closest[1]; bArr[idx] = closest[2]
      }
    }
  } else {
    for (let i = 0; i < n; i++) {
      const noise = (Math.random() - 0.5) * 64 * strength
      const closest = findClosest(rArr[i] + noise, gArr[i] + noise, bArr[i] + noise, palette, distFn)
      rArr[i] = closest[0]; gArr[i] = closest[1]; bArr[i] = closest[2]
    }
  }

  for (let y = 0; y < height; y += ps) {
    for (let x = 0; x < width; x += ps) {
      const si = y * width + x
      const r = rArr[si], g = gArr[si], b = bArr[si]
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

function renderColor (p, data, width, height, pattern, threshold, ps, bg, mode, strength) {
  const rCh = new Float32Array(width * height)
  const gCh = new Float32Array(width * height)
  const bCh = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    rCh[i] = data[i * 4]
    gCh[i] = data[i * 4 + 1]
    bCh[i] = data[i * 4 + 2]
  }

  const rD = ditherChannel(rCh, width, height, pattern, threshold, strength)
  const gD = ditherChannel(gCh, width, height, pattern, threshold, strength)
  const bD = ditherChannel(bCh, width, height, pattern, threshold, strength)

  p.background(bg[0], bg[1], bg[2])
  p.loadPixels()

  for (let y = 0; y < height; y += ps) {
    for (let x = 0; x < width; x += ps) {
      const si = y * width + x
      let r, g, b
      if (mode === 'Full Color') {
        r = rD[si]; g = gD[si]; b = bD[si]
      } else {
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
