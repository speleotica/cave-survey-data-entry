import * as React from 'react'
import { TextField } from '@mui/material'
import throttle from 'lodash/throttle'
import { generateFrcsOutput } from '../util/generateFrcsOutput'
import { Values } from '../types'
import { form } from '../form'
import { generateCompassOutput } from '@/util/generateCompassOutput'
import { generateWallsOutput } from '@/util/generateWallsOutput'

export function OutputField(props: React.ComponentProps<typeof TextField>) {
  const { value: values } = form.useField([])
  const [value, setValue] = React.useState('')

  const handleChange = React.useMemo(
    () =>
      throttle((values: Values) => {
        setTimeout(() => {
          try {
            setValue(
              values.outputFormat === 'FRCS'
                ? generateFrcsOutput(values)
                : values.outputFormat === 'Compass'
                ? generateCompassOutput(values)
                : values.outputFormat === 'Walls'
                ? generateWallsOutput(values)
                : ''
            )
          } catch (error) {
            setValue(
              error instanceof Error
                ? error.stack || error.message
                : String(error)
            )
          }
        }, 0)
      }, 500),
    []
  )

  React.useEffect(() => {
    const parsedValues = Values.safeParse(values)
    if (parsedValues.success) handleChange(parsedValues.data)
  }, [values])

  return (
    <>
      <TextField
        multiline
        value={value}
        InputProps={{ readOnly: true, sx: { fontFamily: 'monospace' } }}
        {...props}
      />
    </>
  )
}
