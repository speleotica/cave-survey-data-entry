import { createZodForm } from '@jcoreio/zod-forms'
import { ValidatedValues } from './types'

export const form = createZodForm({
  schema: ValidatedValues,
})
