import { FieldPath, useField, UseFieldProps } from '@jcoreio/zod-forms'

export function UseField<Field extends FieldPath>({
  field,
  children,
}: {
  field: Field
  children: (props: UseFieldProps<Field>) => React.ReactNode | null | undefined
}): React.ReactNode | null {
  const props = useField(field)
  return children(props) ?? null
}
