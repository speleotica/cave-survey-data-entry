import * as React from 'react'
import { TextField } from '@mui/material'
import asyncThrottle from '@jcoreio/async-throttle'
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
      asyncThrottle(async (values: Values) => {
        try {
          const output =
            values.outputFormat === 'FRCS'
              ? await generateFrcsOutput(values)
              : values.outputFormat === 'Compass'
              ? await generateCompassOutput(values)
              : values.outputFormat === 'Walls'
              ? await generateWallsOutput(values)
              : ''

          setTimeout(() => {
            setValue(output)
          }, 0)
        } catch (error) {
          setValue(
            error instanceof Error
              ? error.stack || error.message
              : String(error)
          )
        }
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
