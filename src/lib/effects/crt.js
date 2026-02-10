import { applyPreprocessing, resizeImageData } from '../preprocessing'

export function createCRTSketch (image, params) {
  return (p) => {
    p.setup = () => {
      if (!image) {
        p.createCanvas(params.canvasSize, params.canvasSize)
        p.background(20)
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
  const {
    type = 'Monitor', distortion = 0.1,
    dotScale = 1, dotPitch = 3, falloff = 0.3,
    glowRadius = 2, glowIntensity = 0.5,
    bloomMode = 'Screen', bloomThreshold = 200, bloomIntensity = 0.3, bloomRadius = 4,
    redOffsetX = 1, redOffsetY = 0, blueOffsetX = -1, blueOffsetY = 0
  } = params

  p.loadPixels()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Barrel distortion
      const cx = x / width - 0.5
      const cy = y / height - 0.5
      const r2 = cx * cx + cy * cy
      const dist = 1 + r2 * distortion
      let sx = Math.round((cx * dist + 0.5) * width)
      let sy = Math.round((cy * dist + 0.5) * height)
      sx = Math.min(width - 1, Math.max(0, sx))
      sy = Math.min(height - 1, Math.max(0, sy))

      // Chromatic aberration
      const rsx = Math.min(width - 1, Math.max(0, sx + Math.round(redOffsetX)))
      const rsy = Math.min(height - 1, Math.max(0, sy + Math.round(redOffsetY)))
      const bsx = Math.min(width - 1, Math.max(0, sx + Math.round(blueOffsetX)))
      const bsy = Math.min(height - 1, Math.max(0, sy + Math.round(blueOffsetY)))

      let rv = data[(rsy * width + rsx) * 4]
      let gv = data[(sy * width + sx) * 4 + 1]
      let bv = data[(bsy * width + bsx) * 4 + 2]

      // Scanlines
      let scanline = 1
      if (type === 'Monitor' || type === 'TV') {
        scanline = (y % Math.round(dotPitch)) === 0 ? falloff : 1
      } else if (type === 'LCD') {
        scanline = 1 - falloff * 0.3 * Math.abs(Math.sin(y * Math.PI / dotPitch))
      }

      // Dot pattern
      const dotPhase = (x % Math.round(dotPitch * dotScale))
      const subpixel = dotPhase / (dotPitch * dotScale)
      if (type === 'Monitor') {
        if (subpixel < 0.33) { gv *= 0.7; bv *= 0.7 }
        else if (subpixel < 0.66) { rv *= 0.7; bv *= 0.7 }
        else { rv *= 0.7; gv *= 0.7 }
      }

      rv *= scanline * (1 + glowIntensity * 0.2)
      gv *= scanline * (1 + glowIntensity * 0.2)
      bv *= scanline * (1 + glowIntensity * 0.2)

      // Bloom
      if (bloomIntensity > 0) {
        const brightness = (rv + gv + bv) / 3
        if (brightness > bloomThreshold) {
          const bloom = (brightness - bloomThreshold) / (255 - bloomThreshold) * bloomIntensity
          rv = Math.min(255, rv + bloom * 50)
          gv = Math.min(255, gv + bloom * 50)
          bv = Math.min(255, bv + bloom * 50)
        }
      }

      const idx = (y * width + x) * 4
      p.pixels[idx] = Math.min(255, Math.max(0, rv))
      p.pixels[idx + 1] = Math.min(255, Math.max(0, gv))
      p.pixels[idx + 2] = Math.min(255, Math.max(0, bv))
      p.pixels[idx + 3] = 255
    }
  }

  p.updatePixels()
}
