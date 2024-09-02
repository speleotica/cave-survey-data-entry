import { Box } from '@mui/material'
import * as React from 'react'
import useMouseDrag from '../util/useMouseDrag'

export function SplitPane({
  sx,
  slotProps,
  children: _children,
  ...rest
}: React.ComponentProps<typeof Box> & {
  slotProps?: {
    left?: React.ComponentProps<typeof Box>
    right?: React.ComponentProps<typeof Box>
  }
}) {
  const children = React.Children.toArray(_children)
  if (children.length !== 2) throw new Error('must have two children')
  const [left, right] = children

  const [splitPosition, setSplitPosition] = React.useState(0.5)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const onMouseDown = useMouseDrag(
    (e, { dx, dragStartProps: { splitPosition } }) => {
      const root = rootRef.current
      if (!root) return
      e.preventDefault()
      e.stopPropagation()
      setSplitPosition(splitPosition + dx / root.offsetWidth)
    },
    { splitPosition }
  )

  return (
    <Box
      {...rest}
      ref={rootRef}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflow: 'hidden',
        alignItems: 'stretch',
        ...sx,
      }}
    >
      <Box
        {...slotProps?.left}
        sx={{
          flexGrow: 0,
          flexShrink: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          ...slotProps?.left?.sx,
        }}
        style={{
          flexBasis: `${splitPosition * 100}%`,
          ...slotProps?.left?.style,
        }}
      >
        {left}
      </Box>
      <Box sx={{ width: 0, position: 'relative' }}>
        <Box
          onMouseDown={onMouseDown}
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: -4,
            width: 8,
            cursor: 'col-resize',
          }}
        />
      </Box>
      <Box
        {...slotProps?.right}
        sx={{
          minWidth: 0,
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          ...slotProps?.right?.sx,
        }}
      >
        {right}
      </Box>
    </Box>
  )
}
