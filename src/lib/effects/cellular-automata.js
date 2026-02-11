import { applyPreprocessing, getGrayscale, resizeImageData, hexToRgb } from '../preprocessing'

export function createCellularAutomataSketch (image, paramsRef) {
  return (p) => {
    let processed = null

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
      processed = { data: pre, width, height }
    }

    p.draw = () => {
      if (!processed) { p.noLoop(); return }
      render(p, processed, paramsRef.current)
    }
  }
}

function render (p, img, params) {
  const {
    threshold = 128, cellSize = 4, steps = 3,
    type = 'Classic',
    surviveLower = 2, surviveUpper = 3,
    birthLower = 3, birthUpper = 3
  } = params
  const bg = hexToRgb(params.bgColor)
  const fg = hexToRgb(params.fgColor)

  const cols = Math.ceil(img.width / cellSize)
  const rows = Math.ceil(img.height / cellSize)

  let grid = new Uint8Array(cols * rows)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = Math.min(Math.floor((c + 0.5) * cellSize), img.width - 1)
      const py = Math.min(Math.floor((r + 0.5) * cellSize), img.height - 1)
      const idx = (py * img.width + px) * 4
      const gray = getGrayscale(img.data[idx], img.data[idx + 1], img.data[idx + 2])
      grid[r * cols + c] = gray < threshold ? 1 : 0
    }
  }

  const range = type === 'LTL' ? 2 : 1

  for (let s = 0; s < steps; s++) {
    const next = new Uint8Array(cols * rows)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let neighbors = 0
        for (let dy = -range; dy <= range; dy++) {
          for (let dx = -range; dx <= range; dx++) {
            if (dx === 0 && dy === 0) continue
            const nr = (r + dy + rows) % rows
            const nc = (c + dx + cols) % cols
            neighbors += grid[nr * cols + nc]
          }
        }

        const alive = grid[r * cols + c]
        if (alive) {
          next[r * cols + c] = (neighbors >= surviveLower && neighbors <= surviveUpper) ? 1 : 0
        } else {
          next[r * cols + c] = (neighbors >= birthLower && neighbors <= birthUpper) ? 1 : 0
        }
      }
    }
    grid = next
  }

  p.background(bg[0], bg[1], bg[2])
  p.fill(fg[0], fg[1], fg[2])
  p.noStroke()

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r * cols + c]) {
        p.rect(c * cellSize, r * cellSize, cellSize, cellSize)
      }
    }
  }
}
