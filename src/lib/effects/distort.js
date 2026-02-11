import { applyPreprocessing, resizeImageData, hexToRgb } from '../preprocessing'

export function createDistortSketch (image, distortionMap, paramsRef) {
  return (p) => {
    let imgData = null
    let mapData = null
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

      if (distortionMap) {
        const mapResult = resizeImageData(distortionMap, params.canvasSize)
        mapData = applyPreprocessing(mapResult.imageData.data, mapResult.width, mapResult.height, params.preprocessing)
      }
    }

    p.draw = () => {
      if (!imgData) { p.noLoop(); return }
      render(p, imgData, imgW, imgH, paramsRef.current, mapData)
    }
  }
}

function render (p, data, width, height, params, mapData) {
  const { threshold = 128, xShift = 20, yShift = 20 } = params
  const bg = hexToRgb(params.bgColor)

  p.background(bg[0], bg[1], bg[2])
  p.loadPixels()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      let sx = x, sy = y

      if (mapData) {
        const mapIdx = (y * width + x) * 4
        const mr = mapData[mapIdx] / 255
        const mg = mapData[mapIdx + 1] / 255
        sx = Math.round(x + (mr - 0.5) * xShift * 2)
        sy = Math.round(y + (mg - 0.5) * yShift * 2)
      }

      sx = Math.min(width - 1, Math.max(0, sx))
      sy = Math.min(height - 1, Math.max(0, sy))

      const srcIdx = (sy * width + sx) * 4
      if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
        p.pixels[idx] = bg[0]
        p.pixels[idx + 1] = bg[1]
        p.pixels[idx + 2] = bg[2]
      } else {
        p.pixels[idx] = data[srcIdx]
        p.pixels[idx + 1] = data[srcIdx + 1]
        p.pixels[idx + 2] = data[srcIdx + 2]
      }
      p.pixels[idx + 3] = 255
    }
  }
  p.updatePixels()
}
