import * as React from 'react'
import { FormLabel, Switch } from '@mui/material'

export function SwitchField({
  label,
  ...props
}: Pick<
  React.ComponentProps<typeof Switch>,
  'name' | 'value' | 'checked' | 'onChange' | 'onBlur' | 'onFocus'
> & {
  label: React.ReactNode
}) {
  return (
    <FormLabel>
      <Switch {...props} />
      {label}
    </FormLabel>
  )
}
