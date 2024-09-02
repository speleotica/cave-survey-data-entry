/* eslint-env browser */

import { useCallback } from 'react'
type DragHandler<Props> = (
  event: MouseEvent | React.MouseEvent<any>,
  info: { dx: number; dy: number; dragStartProps: Props }
) => any

/**
 * A hook for handling mouse drags.  It creates an onMouseDown handler;
 * after mouse down it adds mousemove/mouseup listeners to document.body, so
 * that it can intercept events even if the mouse moves out of the pressed
 * element.  Once the mouse is released it removes the listeners from
 * document.body.
 *
 * @param {Function} handler - your callback for receiving mousedown/mousemove/
 * mouseup events.  The mousedown event will be a React SyntheticMouseEvent but
 * the mousemove and mouseup events will be DOM MouseEvents since they're coming
 * from document.body.
 *
 * @return {Function} an onMouseDown handler to pass to the component you want to
 * respond to drags.
 */
export default function useMouseDrag<Props>(
  handler: DragHandler<Props>,
  dragStartProps: Props
): (arg1: MouseEvent | React.MouseEvent<any>) => any {
  return useCallback(
    (e: MouseEvent | React.MouseEvent<any>) => {
      const { clientX, clientY } = e
      if (typeof document !== 'object') return
      const { body } = document
      if (!body) return
      function handleMouseMove(e2: MouseEvent) {
        handler(e2, {
          dx: e2.clientX - clientX,
          dy: e2.clientY - clientY,
          dragStartProps,
        })
      }
      function end(e2: MouseEvent) {
        body.removeEventListener('mousemove', handleMouseMove, true)
        body.removeEventListener('mouseup', end)
        handler(e2, {
          dx: e2.clientX - clientX,
          dy: e2.clientY - clientY,
          dragStartProps,
        })
      }
      body.addEventListener('mousemove', handleMouseMove, true)
      body.addEventListener('mouseup', end)
      handler(e, { dx: 0, dy: 0, dragStartProps })
    },
    [handler]
  )
}
