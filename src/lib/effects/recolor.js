import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createRecolorSketch (image, paramsRef) {
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

function render (p, data, width, height, params) {
  const {
    posterize = 8,
    noiseIntensity = 0,
    noiseScale = 0.01,
    noiseGamma = 1,
    gradientRepetitions = 1,
    gradientMap = 'brightness',
    stops = [{ color: '#000000', position: 0 }, { color: '#ffffff', position: 100 }]
  } = params

  const sortedStops = [...stops].sort((a, b) => a.position - b.position)

  p.background(0)
  p.loadPixels()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const r = data[idx], g = data[idx + 1], b = data[idx + 2]

      let t
      if (gradientMap === 'hue') {
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        let h = 0
        if (max !== min) {
          if (max === r) h = ((g - b) / (max - min)) % 6
          else if (max === g) h = (b - r) / (max - min) + 2
          else h = (r - g) / (max - min) + 4
        }
        t = (h < 0 ? h + 6 : h) / 6
      } else if (gradientMap === 'saturation') {
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        t = max === 0 ? 0 : (max - min) / max
      } else {
        t = getGrayscale(r, g, b) / 255
      }

      if (posterize > 1) {
        t = Math.round(t * posterize) / posterize
      }

      t = (t * gradientRepetitions) % 1

      if (noiseIntensity > 0) {
        const n = (Math.random() - 0.5) * noiseIntensity
        t = Math.min(1, Math.max(0, t + n))
      }

      if (noiseGamma !== 1) {
        t = Math.pow(t, 1 / noiseGamma)
      }

      const color = sampleGradient(sortedStops, t)
      p.pixels[idx] = color[0]
      p.pixels[idx + 1] = color[1]
      p.pixels[idx + 2] = color[2]
      p.pixels[idx + 3] = 255
    }
  }
  p.updatePixels()
}

function sampleGradient (stops, t) {
  if (stops.length === 0) return [0, 0, 0]
  if (stops.length === 1) return hexToRgb(stops[0].color)

  const pos = t * 100
  if (pos <= stops[0].position) return hexToRgb(stops[0].color)
  if (pos >= stops[stops.length - 1].position) return hexToRgb(stops[stops.length - 1].color)

  for (let i = 0; i < stops.length - 1; i++) {
    if (pos >= stops[i].position && pos <= stops[i + 1].position) {
      const range = stops[i + 1].position - stops[i].position || 1
      const localT = (pos - stops[i].position) / range
      const c1 = hexToRgb(stops[i].color)
      const c2 = hexToRgb(stops[i + 1].color)
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * localT),
        Math.round(c1[1] + (c2[1] - c1[1]) * localT),
        Math.round(c1[2] + (c2[2] - c1[2]) * localT)
      ]
    }
  }
  return hexToRgb(stops[stops.length - 1].color)
}
