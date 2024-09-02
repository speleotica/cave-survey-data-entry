import { createZodForm } from '@jcoreio/zod-forms'
import { Values } from './types'

export const form = createZodForm({
  schema: Values,
})
