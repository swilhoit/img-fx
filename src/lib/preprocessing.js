export function applyPreprocessing (pixels, width, height, params) {
  const { blur = 0, grain = 0, gamma = 1, blackPoint = 0, whitePoint = 255 } = params
  const data = new Uint8ClampedArray(pixels)

  if (blur > 0) applyBlur(data, width, height, blur)
  if (grain > 0) applyGrain(data, grain)
  if (gamma !== 1) applyGamma(data, gamma)
  if (blackPoint > 0 || whitePoint < 255) applyLevels(data, blackPoint, whitePoint)

  return data
}

function applyBlur (data, width, height, radius) {
  const size = radius * 2 + 1
  const kernel = 1 / (size * size)
  const copy = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx))
          const py = Math.min(height - 1, Math.max(0, y + ky))
          const idx = (py * width + px) * 4
          r += copy[idx]
          g += copy[idx + 1]
          b += copy[idx + 2]
        }
      }
      const idx = (y * width + x) * 4
      data[idx] = r * kernel
      data[idx + 1] = g * kernel
      data[idx + 2] = b * kernel
    }
  }
}

function applyGrain (data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * amount * 255
    data[i] = Math.min(255, Math.max(0, data[i] + noise))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
  }
}

function applyGamma (data, gamma) {
  const inv = 1 / gamma
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 * Math.pow(data[i] / 255, inv)
    data[i + 1] = 255 * Math.pow(data[i + 1] / 255, inv)
    data[i + 2] = 255 * Math.pow(data[i + 2] / 255, inv)
  }
}

function applyLevels (data, black, white) {
  const range = white - black || 1
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, ((data[i] - black) / range) * 255))
    data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - black) / range) * 255))
    data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - black) / range) * 255))
  }
}

export function getGrayscale (r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export function hexToRgb (hex) {
  const h = (hex || '#000000').replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16) || 0,
    parseInt(h.substring(2, 4), 16) || 0,
    parseInt(h.substring(4, 6), 16) || 0
  ]
}

export function resizeImageData (img, targetSize) {
  const canvas = document.createElement('canvas')
  const ratio = img.width / img.height
  let w, h
  if (ratio >= 1) {
    w = targetSize
    h = Math.round(targetSize / ratio)
  } else {
    h = targetSize
    w = Math.round(targetSize * ratio)
  }
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)
  return { imageData: ctx.getImageData(0, 0, w, h), width: w, height: h }
}
