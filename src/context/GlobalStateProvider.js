'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const GlobalStateContext = createContext(null)

export function GlobalStateProvider ({ children }) {
  const [image, setImage] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [canvasSize, setCanvasSize] = useState(600)
  const [showEffect, setShowEffect] = useState(true)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fgColor, setFgColor] = useState('#000000')

  const loadImage = useCallback((file) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImage(img)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      setImageData(ctx.getImageData(0, 0, img.width, img.height))
    }
    img.src = url
  }, [])

  return (
    <GlobalStateContext.Provider value={{
      image, imageData, loadImage,
      canvasSize, setCanvasSize,
      showEffect, setShowEffect,
      bgColor, setBgColor,
      fgColor, setFgColor
    }}>
      {children}
    </GlobalStateContext.Provider>
  )
}

export function useGlobalState () {
  const ctx = useContext(GlobalStateContext)
  if (!ctx) throw new Error('useGlobalState must be used within GlobalStateProvider')
  return ctx
}
