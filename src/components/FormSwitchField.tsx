import * as React from 'react'
import { FieldPathForValue, useHtmlField } from '@jcoreio/zod-forms'
import { SwitchField } from './SwitchField'

export function FormSwitchField({
  field,
  ...props
}: React.ComponentProps<typeof SwitchField> & {
  field: FieldPathForValue<boolean | null | undefined>
}) {
  const { input } = useHtmlField({ field, type: 'checkbox' })
  return <SwitchField {...input} {...props} />
}
