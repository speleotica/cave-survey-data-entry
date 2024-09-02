import * as React from 'react'
import { FieldPathForRawValue, useHtmlField } from '@jcoreio/zod-forms'
import { TextField } from '@mui/material'
import { HTMLInputTypeAttribute } from 'react'

export function FormTextField({
  field,
  type,
  ...props
}: Omit<React.ComponentProps<typeof TextField>, 'type'> & {
  type: HTMLInputTypeAttribute
  field: FieldPathForRawValue<
    string | number | bigint | boolean | null | undefined
  >
}) {
  const { input, meta } = useHtmlField({ field, type })
  const hasError = meta.touched && meta.error != null

  return (
    <TextField
      {...input}
      error={hasError}
      helperText={hasError ? meta.error : undefined}
      {...props}
    />
  )
}
