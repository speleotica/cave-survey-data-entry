import * as React from 'react'
import { SxProps } from '@mui/material'
import Box from '@mui/material/Box'
import useMouseDrag from './useMouseDrag'

type Bounds = {
  top: number
  left: number
  width: number
  height: number
}

export function ResizableRect({
  handleSize = 9,
  bounds,
  sx,
  onResize,
}: {
  handleSize?: number
  bounds: Bounds
  onResize: (newBounds: Bounds) => void
  sx?: SxProps
}) {
  const onTopLeftMouseDown = useMouseDrag(
    (e, { dx, dy, dragStartProps: { bounds } }) => {
      e.preventDefault()
      e.stopPropagation()
      onResize({
        top: bounds.top + dy,
        left: bounds.left + dx,
        width: bounds.width - dx,
        height: bounds.height - dy,
      })
    },
    { bounds }
  )
  const onTopRightMouseDown = useMouseDrag(
    (e, { dx, dy, dragStartProps: { bounds } }) => {
      e.preventDefault()
      e.stopPropagation()
      onResize({
        top: bounds.top + dy,
        left: bounds.left,
        width: bounds.width + dx,
        height: bounds.height - dy,
      })
    },
    { bounds }
  )
  const onBottomLeftMouseDown = useMouseDrag(
    (e, { dx, dy, dragStartProps: { bounds } }) => {
      e.preventDefault()
      e.stopPropagation()
      onResize({
        top: bounds.top,
        left: bounds.left + dx,
        width: bounds.width - dx,
        height: bounds.height + dy,
      })
    },
    { bounds }
  )
  const onBottomRightMouseDown = useMouseDrag(
    (e, { dx, dy, dragStartProps: { bounds } }) => {
      e.preventDefault()
      e.stopPropagation()
      onResize({
        top: bounds.top,
        left: bounds.left,
        width: bounds.width + dx,
        height: bounds.height + dy,
      })
    },
    { bounds }
  )

  const handleProps = (left: number, top: number) => ({
    position: 'absolute',
    top: top - Math.ceil(handleSize / 2),
    left: left - Math.ceil(handleSize / 2),
    width: handleSize,
    height: handleSize,
    cursor: 'grab',
    backgroundColor: 'currentColor',
    pointerEvents: 'all',
  })

  return (
    <Box
      sx={{
        ...bounds,
        width: bounds.width,
        height: bounds.height,
        boxSizing: 'border-box',
        position: 'absolute',
        color: 'red',
        border: '1px solid currentColor',
        pointerEvents: 'none',
        ...sx,
      }}
    >
      <Box sx={handleProps(0, 0)} onMouseDown={onTopLeftMouseDown} />
      <Box
        sx={handleProps(bounds.width - 1, 0)}
        onMouseDown={onTopRightMouseDown}
      />
      <Box
        sx={handleProps(0, bounds.height - 1)}
        onMouseDown={onBottomLeftMouseDown}
      />
      <Box
        sx={handleProps(bounds.width - 1, bounds.height - 1)}
        onMouseDown={onBottomRightMouseDown}
      />
    </Box>
  )
}
