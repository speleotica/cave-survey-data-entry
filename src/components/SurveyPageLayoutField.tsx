import React from 'react'
import { MenuItem } from '@mui/material'
import { FormTextField } from './FormTextField'
import { FieldPath } from '@jcoreio/zod-forms'
import { LayoutVariant } from '@/types'
import z from 'zod'

export function SurveyPageLayoutField({
  field,
}: {
  field: FieldPath<z.ZodOptional<typeof LayoutVariant>>
}) {
  return (
    <FormTextField
      variant="filled"
      type="text"
      field={field}
      select
      label="Layout"
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <MenuItem value="IMO">Inner Mountain Outfitters</MenuItem>
      <MenuItem value="Lech">Lechuguilla</MenuItem>
      <MenuItem value="X-38">Cave Research Foundation X-38</MenuItem>
      <MenuItem value="X-39">Cave Research Foundation X-39</MenuItem>
      <MenuItem value="FromStaDisAzIncLrUd">
        From Sta | Dist | Az F/B | Inc F/B | L R | U D
      </MenuItem>
      <MenuItem value="ToStaDisAzIncLrUd">
        To Sta | Dist | Az F/B | Inc F/B | L R | U D
      </MenuItem>
    </FormTextField>
  )
}
