import * as React from 'react'
import { FieldPathForRawValue, useHtmlField } from '@jcoreio/zod-forms'
import { SwitchField } from './SwitchField'

export function FormSwitchField({
  field,
  ...props
}: React.ComponentProps<typeof SwitchField> & {
  field: FieldPathForRawValue<boolean | null | undefined>
}) {
  const { input } = useHtmlField({ field, type: 'checkbox' })
  return <SwitchField {...input} {...props} />
}
