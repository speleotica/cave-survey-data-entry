import * as React from 'react'
import { TextField } from '@mui/material'
import { FormState } from 'final-form'
import throttle from 'lodash/throttle'
import { FormSpy } from 'react-final-form'
import { generateFrcsOutput } from '../util/generateFrcsOutput'
import { Values } from '../types'

export function OutputField(props: React.ComponentProps<typeof TextField>) {
  const [value, setValue] = React.useState('')

  const handleChange = React.useMemo(
    () =>
      throttle(({ values }: FormState<Values>) => {
        setTimeout(() => {
          setValue(generateFrcsOutput(values))
        }, 0)
      }, 500),
    []
  )

  return (
    <>
      <TextField
        multiline
        value={value}
        InputProps={{ readOnly: true, sx: { fontFamily: 'monospace' } }}
        {...props}
      />
      <FormSpy onChange={handleChange} subscription={{ values: true }} />
    </>
  )
}
