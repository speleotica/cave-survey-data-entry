import * as React from 'react'
import { Box } from '@mui/material'
import { TableBounds } from '../types'
import { calculateHomography } from 'simple-homography'

export function HomographyBox({
  sx,
  children,
  width,
  height,
  bounds,
  ...props
}: Omit<React.ComponentProps<typeof Box>, 'width' | 'height'> & {
  width: number
  height: number
  bounds: TableBounds
}) {
  const transform = React.useMemo(() => {
    const h = calculateHomography(
      [0, 0],
      [bounds.topLeft.x, bounds.topLeft.y],
      [width, 0],
      [bounds.topRight.x, bounds.topRight.y],
      [width, height],
      [bounds.bottomRight.x, bounds.bottomRight.y],
      [0, height],
      [bounds.bottomLeft.x, bounds.bottomLeft.y]
    )
    return `matrix3d(${[
      h.get([0, 0]),
      h.get([1, 0]),
      0,
      h.get([2, 0]),
      h.get([0, 1]),
      h.get([1, 1]),
      0,
      h.get([2, 1]),
      0,
      0,
      1,
      0,
      h.get([0, 2]),
      h.get([1, 2]),
      0,
      h.get([2, 2]),
    ].join(',')})`
  }, [bounds, width, height])

  return (
    <Box
      {...props}
      sx={{
        ...sx,
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        transform,
        transformOrigin: 'top left',
      }}
    >
      {children}
    </Box>
  )
}
