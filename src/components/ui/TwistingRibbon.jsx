import { useEffect, useRef } from 'react'

function hexToRgb(hex) {
  const normalized = hex.replace(/^#/, '')
  const expanded = normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized
  const value = Number.parseInt(expanded, 16)

  return [value >> 16, (value >> 8) & 255, value & 255]
}

export default function TwistingRibbon({
  className,
  segments = 400,
  waveSpeed = 0.018,
  waveAmplitude = 1,
  twistCycles = 6,
  lightColors,
  darkColors,
  ...props
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !container || !context) return undefined

    let animationFrameId
    let width = container.clientWidth
    let height = container.clientHeight
    let time = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const ribbonHalfWidth = 14
    const waveOneAmplitude = 110 * waveAmplitude
    const waveTwoAmplitude = 30 * waveAmplitude
    const lightFace = hexToRgb(lightColors?.face || '#3356A6')
    const lightFoldA = hexToRgb(lightColors?.foldA || '#FFFFFF')
    const lightFoldB = hexToRgb(lightColors?.foldB || '#8E8B83')
    const lightFoldC = hexToRgb(lightColors?.foldC || '#131412')
    const darkFace = hexToRgb(darkColors?.face || '#3356A6')
    const darkFoldA = hexToRgb(darkColors?.foldA || '#FFFFFF')
    const darkFoldB = hexToRgb(darkColors?.foldB || '#8E8B83')
    const darkFoldC = hexToRgb(darkColors?.foldC || '#131412')

    function resize() {
      width = container.clientWidth
      height = container.clientHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * pixelRatio))
      canvas.height = Math.max(1, Math.floor(height * pixelRatio))
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    function lerpColor(colorA, colorB, amount) {
      return colorA.map((channel, index) => (
        Math.round(channel + (colorB[index] - channel) * amount)
      ))
    }

    function buildSpine(currentTime) {
      const points = []
      for (let index = 0; index <= segments; index += 1) {
        const progress = index / segments
        points.push({
          x: progress * width * 1.4 - width * 0.2,
          y: height / 2
            + Math.sin(progress * Math.PI * 3.5 + currentTime * 0.7) * waveOneAmplitude
            + Math.sin(progress * Math.PI * 7 + currentTime * 1.1) * waveTwoAmplitude,
        })
      }
      return points
    }

    function buildNormals(points) {
      const last = points.length - 1
      return points.map((_, index) => {
        const deltaX = index === 0
          ? points[1].x - points[0].x
          : index === last
            ? points[last].x - points[last - 1].x
            : points[index + 1].x - points[index - 1].x
        const deltaY = index === 0
          ? points[1].y - points[0].y
          : index === last
            ? points[last].y - points[last - 1].y
            : points[index + 1].y - points[index - 1].y
        const length = Math.hypot(deltaX, deltaY) || 1
        return { nx: -deltaY / length, ny: deltaX / length }
      })
    }

    function buildEdges(points, normals, currentTime) {
      const tops = []
      const bottoms = []
      const twists = []
      for (let index = 0; index <= segments; index += 1) {
        const twist = Math.cos((index / segments) * Math.PI * twistCycles + currentTime * 0.5)
        const ribbonWidth = ribbonHalfWidth * Math.abs(twist)
        const direction = twist >= 0 ? 1 : -1
        twists.push(twist)
        tops.push({
          x: points[index].x + normals[index].nx * ribbonWidth * direction,
          y: points[index].y + normals[index].ny * ribbonWidth * direction,
        })
        bottoms.push({
          x: points[index].x - normals[index].nx * ribbonWidth * direction,
          y: points[index].y - normals[index].ny * ribbonWidth * direction,
        })
      }
      return { tops, bottoms, twists }
    }

    function foldColor(fraction, currentTime, isDark) {
      const cycle = (((fraction * 2 + currentTime * 0.3) % 1) + 1) % 1
      const colorA = isDark ? darkFoldA : lightFoldA
      const colorB = isDark ? darkFoldB : lightFoldB
      const colorC = isDark ? darkFoldC : lightFoldC
      if (cycle < 1 / 3) return lerpColor(colorA, colorB, cycle * 3)
      if (cycle < 2 / 3) return lerpColor(colorB, colorC, (cycle - 1 / 3) * 3)
      return lerpColor(colorC, colorA, (cycle - 2 / 3) * 3)
    }

    function ribbonColor(fraction, twist, currentTime, isDark) {
      const fold = foldColor(fraction, currentTime, isDark)
      const face = isDark ? darkFace : lightFace
      return lerpColor(fold, face, Math.pow(Math.abs(twist), 1.2))
    }

    function drawQuad(pointA, pointB, pointC, pointD) {
      context.beginPath()
      context.moveTo(pointA.x, pointA.y)
      context.lineTo(pointB.x, pointB.y)
      context.lineTo(pointC.x, pointC.y)
      context.lineTo(pointD.x, pointD.y)
      context.closePath()
      context.fill()
    }

    function drawShadow(tops, bottoms, isDark) {
      context.fillStyle = isDark ? 'rgba(0, 0, 0, 0.47)' : 'rgba(80, 60, 40, 0.055)'
      for (let index = 0; index < segments; index += 1) {
        const offset = (point) => ({ x: point.x + 4, y: point.y + 7 })
        drawQuad(offset(tops[index]), offset(tops[index + 1]), offset(bottoms[index + 1]), offset(bottoms[index]))
      }
    }

    function drawRibbon(tops, bottoms, twists, currentTime, isDark) {
      for (let index = 0; index < segments; index += 1) {
        const [red, green, blue] = ribbonColor(index / segments, twists[index], currentTime, isDark)
        context.fillStyle = `rgb(${red}, ${green}, ${blue})`
        drawQuad(tops[index], tops[index + 1], bottoms[index + 1], bottoms[index])

        if (Math.abs(twists[index]) > 0.08) {
          context.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.086)'
          context.lineWidth = 0.5
          for (const edge of [tops, bottoms]) {
            context.beginPath()
            context.moveTo(edge[index].x, edge[index].y)
            context.lineTo(edge[index + 1].x, edge[index + 1].y)
            context.stroke()
          }
        }
      }
    }

    function render() {
      context.clearRect(0, 0, width, height)
      time += waveSpeed
      const isDark = document.documentElement.classList.contains('dark')
        || document.documentElement.dataset.theme === 'dark'
      const points = buildSpine(time)
      const normals = buildNormals(points)
      const { tops, bottoms, twists } = buildEdges(points, normals, time)
      drawShadow(tops, bottoms, isDark)
      drawRibbon(tops, bottoms, twists, time, isDark)
      if (!reducedMotion.matches) animationFrameId = window.requestAnimationFrame(render)
    }

    const resizeObserver = new ResizeObserver(() => {
      resize()
      if (reducedMotion.matches) render()
    })
    resizeObserver.observe(container)
    resize()
    render()

    return () => {
      resizeObserver.disconnect()
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [segments, waveSpeed, waveAmplitude, twistCycles, lightColors, darkColors])

  return (
    <div
      ref={containerRef}
      className={['twisting-ribbon', className].filter(Boolean).join(' ')}
      {...props}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
