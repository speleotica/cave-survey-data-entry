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
          setValue(
            values.outputFormat === 'FRCS'
              ? generateFrcsOutput(values)
              : values.outputFormat === 'Compass'
              ? generateCompassOutput(values)
              : values.outputFormat === 'Walls'
              ? generateWallsOutput(values)
              : ''
          )
        }, 0)
      }, 500),
    []
  )

  React.useEffect(() => {
    if (values) handleChange(values)
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
