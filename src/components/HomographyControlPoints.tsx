import * as React from 'react'
import { SxProps } from '@mui/material'
import Box from '@mui/material/Box'
import useMouseDrag from './useMouseDrag'
import { Point, TableBounds } from './types'

export function HomographyControlPoints({
  handleSize = 9,
  bounds,
  sx,
  onResize,
}: {
  handleSize?: number
  bounds: TableBounds
  onResize: (newBounds: TableBounds) => void
  sx?: SxProps
}) {
  const onControlPointMouseDown = (point: keyof TableBounds) =>
    useMouseDrag(
      (e, { dx, dy, dragStartProps: { bounds } }) => {
        e.preventDefault()
        e.stopPropagation()
        onResize({
          ...bounds,
          [point]: {
            x: bounds[point].x + dx,
            y: bounds[point].y + dy,
          },
        })
      },
      { bounds }
    )

  const handleProps = ({ x, y }: Point) => ({
    position: 'absolute',
    top: y - bounds.topLeft.y - Math.ceil(handleSize / 2),
    left: x - bounds.topLeft.x - Math.ceil(handleSize / 2),
    width: handleSize,
    height: handleSize,
    cursor: 'grab',
    backgroundColor: 'currentColor',
    pointerEvents: 'all',
  })

  return (
    <>
      <Box
        sx={{
          top: bounds.topLeft.y,
          left: bounds.topLeft.x,
          width: bounds.bottomRight.x - bounds.topLeft.x,
          height: bounds.bottomRight.y - bounds.topLeft.y,
          boxSizing: 'border-box',
          position: 'absolute',
          color: 'red',
          pointerEvents: 'none',
          ...sx,
        }}
      >
        <Box
          sx={handleProps(bounds.topLeft)}
          onMouseDown={onControlPointMouseDown('topLeft')}
        />
        <Box
          sx={handleProps(bounds.topRight)}
          onMouseDown={onControlPointMouseDown('topRight')}
        />
        <Box
          sx={handleProps(bounds.bottomRight)}
          onMouseDown={onControlPointMouseDown('bottomRight')}
        />
        <Box
          sx={handleProps(bounds.bottomLeft)}
          onMouseDown={onControlPointMouseDown('bottomLeft')}
        />
      </Box>
    </>
  )
}
